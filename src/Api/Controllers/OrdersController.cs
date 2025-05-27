// src/Api/Controllers/OrdersController.cs
using Microsoft.AspNetCore.Authorization; // Para [Authorize]
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging; // Para ILogger
using System;
using System.Collections.Generic; // Para List e IEnumerable
using System.Linq; // Para .Any() e .Sum()
using System.Threading.Tasks;
using MinimalistECommerce.Application.Contracts.Persistence; // Repositórios
using MinimalistECommerce.Application.Dtos; // DTOs
using MinimalistECommerce.Domain.Entities; // Entidades

namespace MinimalistECommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Rota base: /api/orders
    public class OrdersController : ControllerBase
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICartRepository _cartRepository;
        private readonly IProductRepository _productRepository;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(
            IOrderRepository orderRepository,
            ICartRepository cartRepository,
            IProductRepository productRepository,
            ILogger<OrdersController> logger)
        {
            _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
            _cartRepository = cartRepository ?? throw new ArgumentNullException(nameof(cartRepository));
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // POST: api/orders
        [HttpPost]
        [ProducesResponseType(typeof(OrderDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CheckoutDto checkoutDto)
        {
            _logger.LogInformation("Tentativa de criação de pedido iniciada.");

            if (checkoutDto == null) // Validação do [ApiController] já trata ModelState.IsValid
            {
                return BadRequest("Dados de checkout inválidos.");
            }

            var temporaryCartId = Guid.Parse("8fc77faa-10d1-4f13-aeba-29d09571fe87"); // !!! Use o SEU Guid fixo !!!

            var cart = await _cartRepository.GetByIdAsync(temporaryCartId, includeItems: true);

            if (cart == null || !cart.CartItems.Any())
            {
                _logger.LogWarning("Tentativa de checkout com carrinho {CartId} não encontrado ou vazio.", temporaryCartId);
                return BadRequest("Carrinho não encontrado ou está vazio.");
            }

            var order = new Order
            {
                ShippingAddress = checkoutDto.ShippingAddress,
                OrderDate = DateTime.UtcNow,
                Status = "Pendente"
                // CustomerId será nulo por enquanto, ou preenchido se o usuário estiver logado (implementação futura)
            };

            decimal orderTotal = 0;
            foreach (var cartItem in cart.CartItems)
            {
                if (cartItem.Product == null)
                {
                    _logger.LogError("Produto com ID {ProductId} associado ao CartItem {CartItemId} não foi carregado do banco.", cartItem.ProductId, cartItem.Id);
                    return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao processar itens do carrinho: dados de produto ausentes.");
                }

                var orderItem = new OrderItem
                {
                    ProductId = cartItem.ProductId,
                    Quantity = cartItem.Quantity,
                    UnitPrice = cartItem.Product.Price
                };
                order.OrderItems.Add(orderItem);
                orderTotal += orderItem.Quantity * orderItem.UnitPrice;
            }
            order.TotalAmount = orderTotal;

            await _orderRepository.AddAsync(order);
            var orderSavedSuccess = await _orderRepository.SaveChangesAsync() > 0;

            if (!orderSavedSuccess)
            {
                _logger.LogError("Falha ao salvar o pedido no banco de dados.");
                return StatusCode(StatusCodes.Status500InternalServerError, "Não foi possível salvar o pedido.");
            }
            _logger.LogInformation("Pedido {OrderId} criado com sucesso.", order.Id);

            try
            {
                _logger.LogInformation("Limpando carrinho {CartId} após criação do pedido {OrderId}.", temporaryCartId, order.Id);
                await _cartRepository.ClearCartAsync(temporaryCartId);
                await _cartRepository.SaveChangesAsync();
                _logger.LogInformation("Carrinho {CartId} limpo com sucesso.", temporaryCartId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao tentar limpar o carrinho {CartId} após criar o pedido {OrderId}.", temporaryCartId, order.Id);
            }

            var orderDto = new OrderDto
            {
                Id = order.Id,
                OrderDate = order.OrderDate,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                CustomerId = order.CustomerId,
                ShippingAddress = order.ShippingAddress,
                Items = order.OrderItems.Select(oi => new CartItemDto // Reutilizando CartItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    ProductName = oi.Product?.Name ?? "Produto não disponível",
                    ImageUrl = oi.Product?.ImageUrl ?? ""
                }).ToList()
            };

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, orderDto);
        }

        // GET: api/orders/5
        [Authorize(Roles = "Admin")] // Protegido para Admin
        [HttpGet("{id}", Name = "GetOrder")]
        [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            _logger.LogInformation("Admin: buscando pedido com ID: {OrderId}", id);
            var order = await _orderRepository.GetByIdAsync(id, includeItemsAndProducts: true);

            if (order == null)
            {
                _logger.LogWarning("Admin: Pedido com ID {OrderId} não encontrado.", id);
                return NotFound($"Pedido com ID {id} não encontrado.");
            }

            var orderDto = new OrderDto
            {
                Id = order.Id,
                OrderDate = order.OrderDate,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                CustomerId = order.CustomerId,
                ShippingAddress = order.ShippingAddress,
                Items = order.OrderItems.Select(oi => new CartItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    ProductName = oi.Product?.Name ?? "Produto não disponível",
                    ImageUrl = oi.Product?.ImageUrl ?? ""
                }).ToList()
            };

            _logger.LogInformation("Admin: Pedido com ID {OrderId} encontrado e retornado.", id);
            return Ok(orderDto);
        }

        // GET: api/orders (Listagem para Admin)
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<OrderDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrders()
        {
            _logger.LogInformation("Admin: buscando todos os pedidos.");
            var orders = await _orderRepository.GetAllAsync(includeCustomer: true, includeItemsAndProducts: true);

            if (orders == null || !orders.Any())
            {
                return Ok(new List<OrderDto>());
            }

            var orderDtos = orders.Select(order => new OrderDto
            {
                Id = order.Id,
                OrderDate = order.OrderDate,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                CustomerId = order.CustomerId,
                ShippingAddress = order.ShippingAddress,
                Items = order.OrderItems.Select(oi => new CartItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    ProductName = oi.Product?.Name ?? "N/A",
                    ImageUrl = oi.Product?.ImageUrl ?? ""
                }).ToList()
            }).ToList();

            return Ok(orderDtos);
        }
    }
}