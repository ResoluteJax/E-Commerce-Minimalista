// src/Api/Controllers/ProductsController.cs
using Microsoft.AspNetCore.Mvc;
using MinimalistECommerce.Application.Contracts.Persistence;
using MinimalistECommerce.Application.Dtos;
using MinimalistECommerce.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
 


namespace MinimalistECommerce.Api.Controllers
{
    [ApiController] // Habilita comportamentos padrão de API
    [Route("api/[controller]")] // Define a rota base como /api/products
    public class ProductsController : ControllerBase // Herda de ControllerBase para APIs
    {
        private readonly IProductRepository _productRepository;

        // Injetamos o repositório via construtor (DI)
        public ProductsController(IProductRepository productRepository)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
        }

        // GET: api/products
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ProductDto>), StatusCodes.Status200OK)] // Documenta o tipo de retorno para o Swagger
        //'[Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
        {
            var products = await _productRepository.GetAllAsync();

            // Mapeia as entidades Product para ProductDto
            // (Mapeamento manual por enquanto)
            var productDtos = products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                ImageUrl = p.ImageUrl
            });

            return Ok(productDtos); // Retorna HTTP 200 OK com a lista de DTOs
        }

        // GET: api/products/5
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
        //[Authorize(Roles = "Admin")]
        
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);

            if (product == null)
            {
                return NotFound(); // Retorna HTTP 404 Not Found se o produto não existe
            }

            // Mapeia a entidade Product para ProductDto
            var productDto = new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                ImageUrl = product.ImageUrl
            };

            return Ok(productDto); // Retorna HTTP 200 OK com o DTO do produto
        }

        // POST: api/products
        [HttpPost]
        [ProducesResponseType(typeof(ProductDto), StatusCodes.Status201Created)] // Retorno 201 Created
        [ProducesResponseType(StatusCodes.Status400BadRequest)] // Possível erro de validação (Tarefa 5)
        public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto createProductDto)
        {
    // Validação básica (melhoraremos na Tarefa 5)
    if (createProductDto == null)
    {
        return BadRequest("Dados do produto inválidos.");
    }

    // Mapeia o DTO de criação para a entidade de domínio Product
    var newProduct = new Product
    {
        Name = createProductDto.Name,
        Description = createProductDto.Description,
        Price = createProductDto.Price,
        ImageUrl = createProductDto.ImageUrl
        // Id será gerado pelo banco
    };

    // Adiciona o novo produto ao contexto do EF Core
    await _productRepository.AddAsync(newProduct);

    // Salva as alterações no banco de dados
    await _productRepository.SaveChangesAsync();

    // Mapeia a entidade criada (agora com Id) de volta para um DTO de resposta
    var productToReturnDto = new ProductDto
    {
        Id = newProduct.Id, // Inclui o Id gerado
        Name = newProduct.Name,
        Description = newProduct.Description,
        Price = newProduct.Price,
        ImageUrl = newProduct.ImageUrl
    };

    // Retorna a resposta 201 Created, com a localização do novo recurso e o DTO criado
    return CreatedAtAction(nameof(GetProduct), new { id = newProduct.Id }, productToReturnDto);
    }

        // --- Endpoints PUT, DELETE virão aqui depois ---

    }
}