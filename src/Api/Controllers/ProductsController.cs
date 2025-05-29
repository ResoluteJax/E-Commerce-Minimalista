// src/Api/Controllers/ProductsController.cs
using Microsoft.AspNetCore.Authorization; // Para [Authorize]
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;     // Para ILogger
using System;                             // Para ArgumentNullException
using System.Collections.Generic;         // Para IEnumerable
using System.Linq;                        // Para .Select() e .Where()
using System.Threading.Tasks;
using MinimalistECommerce.Application.Contracts.Persistence;
using MinimalistECommerce.Application.Dtos;
using MinimalistECommerce.Domain.Entities;

namespace MinimalistECommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductRepository _productRepository;
        private readonly ICategoryRepository _categoryRepository; // Adicionado
        private readonly ILogger<ProductsController> _logger;     // Adicionado

        public ProductsController(
            IProductRepository productRepository,
            ICategoryRepository categoryRepository, // Parâmetro adicionado
            ILogger<ProductsController> logger)     // Parâmetro adicionado
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
            _categoryRepository = categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository)); // Atribuir
            _logger = logger ?? throw new ArgumentNullException(nameof(logger)); // Atribuir
        }

        // GET: api/products
        // GET: api/products?categoryId=1
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ProductDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts([FromQuery] int? categoryId)
        {
            _logger.LogInformation("Buscando produtos. CategoryId: {CategoryId}", categoryId);

            // O método GetAllAsync no repositório foi atualizado para aceitar includeCategory.
            var products = await _productRepository.GetAllAsync(includeCategory: true);

            if (categoryId.HasValue)
            {
                products = products.Where(p => p.CategoryId == categoryId.Value);
            }

            var productDtos = products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.Name // Se Category for null, CategoryName será null
            });

            return Ok(productDtos);
        }

        // GET: api/products/5
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            _logger.LogInformation("Buscando produto com ID: {ProductId}", id);

            // A chamada GetByIdAsync no repositório foi atualizada para incluir a categoria
            var product = await _productRepository.GetByIdAsync(id, includeCategory: true);

            if (product == null)
            {
                _logger.LogWarning("Produto com ID {ProductId} não encontrado.", id);
                return NotFound($"Produto com ID {id} não encontrado.");
            }

            var productDto = new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                ImageUrl = product.ImageUrl,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.Name // Se Category for null, CategoryName será null
            };

            return Ok(productDto);
        }

        // POST: api/products
        // TODO: [Authorize(Roles = "Admin")] // Proteger este endpoint para Admin no futuro
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ProductDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto createProductDto)
        {
            _logger.LogInformation("Tentativa de criar produto: {ProductName}", createProductDto.Name);

            if (createProductDto == null) // Validação do [ApiController] já trata ModelState para o DTO em si
            {
                return BadRequest("Dados do produto não podem ser nulos.");
            }

            // Validação explícita para CategoryId, se fornecido
            if (createProductDto.CategoryId.HasValue)
            {
                var categoryExists = await _categoryRepository.GetByIdAsync(createProductDto.CategoryId.Value);
                if (categoryExists == null)
                {
                    _logger.LogWarning("Tentativa de criar produto com CategoryId inválido: {CategoryId}", createProductDto.CategoryId.Value);
                    ModelState.AddModelError("CategoryId", $"Categoria com ID {createProductDto.CategoryId.Value} não encontrada.");
                    return BadRequest(ModelState); // Retorna os erros de validação do ModelState
                }
            }

            var newProduct = new Product
            {
                Name = createProductDto.Name,
                Description = createProductDto.Description,
                Price = createProductDto.Price,
                ImageUrl = createProductDto.ImageUrl,
                CategoryId = createProductDto.CategoryId // Categoria associada
            };

            await _productRepository.AddAsync(newProduct);
            await _productRepository.SaveChangesAsync();

            _logger.LogInformation("Produto {ProductId} - '{ProductName}' criado com sucesso.", newProduct.Id, newProduct.Name);

            // Buscar o produto recém-criado COM sua categoria para popular o DTO de retorno corretamente.
            var createdProductWithDetails = await _productRepository.GetByIdAsync(newProduct.Id, includeCategory: true);

            if (createdProductWithDetails == null) // Checagem de segurança, não deveria acontecer
            {
                _logger.LogError("Falha ao buscar produto recém-criado {ProductId} para retorno do DTO.", newProduct.Id);
                // Retorna o produto sem os detalhes da categoria se a busca falhar,
                // mas com o ID e outros dados já preenchidos.
                var fallbackDto = new ProductDto
                {
                    Id = newProduct.Id,
                    Name = newProduct.Name,
                    Description = newProduct.Description,
                    Price = newProduct.Price,
                    ImageUrl = newProduct.ImageUrl,
                    CategoryId = newProduct.CategoryId
                    // CategoryName será null
                };
                return CreatedAtAction(nameof(GetProduct), new { id = newProduct.Id }, fallbackDto);
            }


            var productToReturnDto = new ProductDto
            {
                Id = createdProductWithDetails.Id,
                Name = createdProductWithDetails.Name,
                Description = createdProductWithDetails.Description,
                Price = createdProductWithDetails.Price,
                ImageUrl = createdProductWithDetails.ImageUrl,
                CategoryId = createdProductWithDetails.CategoryId,
                CategoryName = createdProductWithDetails.Category?.Name
            };

            return CreatedAtAction(nameof(GetProduct), new { id = productToReturnDto.Id }, productToReturnDto);
        }

        // PUT: api/products/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto updateProductDto)
        {
            _logger.LogInformation("Admin: Tentativa de atualizar produto ID {ProductId}", id);

            if (updateProductDto == null) // Validação do [ApiController] já trata ModelState
            {
                return BadRequest("Dados do produto inválidos.");
            }

            var productToUpdate = await _productRepository.GetByIdAsync(id, includeCategory: false); // Não precisa carregar categoria para atualizar

            if (productToUpdate == null)
            {
                _logger.LogWarning("Admin: Produto com ID {ProductId} não encontrado para atualização.", id);
                return NotFound($"Produto com ID {id} não encontrado.");
            }

            // Validar CategoryId, se fornecido
            if (updateProductDto.CategoryId.HasValue)
            {
                var categoryExists = await _categoryRepository.GetByIdAsync(updateProductDto.CategoryId.Value);
                if (categoryExists == null)
                {
                    ModelState.AddModelError("CategoryId", $"Categoria com ID {updateProductDto.CategoryId.Value} não encontrada.");
                    return BadRequest(ModelState);
                }
            }

            // Mapear DTO para a entidade existente
            productToUpdate.Name = updateProductDto.Name;
            productToUpdate.Description = updateProductDto.Description;
            productToUpdate.Price = updateProductDto.Price;
            productToUpdate.ImageUrl = updateProductDto.ImageUrl;
            productToUpdate.CategoryId = updateProductDto.CategoryId;

            _productRepository.Update(productToUpdate); // Marca a entidade como modificada
            await _productRepository.SaveChangesAsync();

            _logger.LogInformation("Admin: Produto ID {ProductId} atualizado com sucesso.", id);
            return NoContent(); // Resposta padrão para PUT bem-sucedido
        }

        // DELETE: api/products/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            _logger.LogInformation("Admin: Tentativa de deletar produto ID {ProductId}", id);
            var productToDelete = await _productRepository.GetByIdAsync(id, includeCategory: false);

            if (productToDelete == null)
            {
                _logger.LogWarning("Admin: Produto com ID {ProductId} não encontrado para deleção.", id);
                return NotFound($"Produto com ID {id} não encontrado.");
            }

            // TODO: Considerar o que acontece se o produto estiver em OrderItems ou CartItems.
            // A configuração atual do OnDelete para ProductId em OrderItem/CartItem pode ser Restrict,
            // o que causaria um erro aqui se o produto estiver em uso.
            // Precisaríamos de uma lógica para lidar com isso (ex: soft delete, impedir deleção, deletar em cascata com cuidado).
            // Por enquanto, a deleção será "hard delete".

            _productRepository.Delete(productToDelete);
            await _productRepository.SaveChangesAsync();

            _logger.LogInformation("Admin: Produto ID {ProductId} deletado com sucesso.", id);
            return NoContent();
        }


    }
}