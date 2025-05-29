// src/Api/Controllers/CategoriesController.cs
using Microsoft.AspNetCore.Authorization; // Adicionado
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging; // Adicionado se não existia
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MinimalistECommerce.Application.Contracts.Persistence;
using MinimalistECommerce.Application.Dtos;
using MinimalistECommerce.Domain.Entities;


namespace MinimalistECommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly ILogger<CategoriesController> _logger; // Adicionado

        public CategoriesController(ICategoryRepository categoryRepository, ILogger<CategoriesController> logger) // Modificado
        {
            _categoryRepository = categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger)); // Modificado
        }

        // GET: api/categories (Já existe)
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CategoryDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
        {
            var categories = await _categoryRepository.GetAllAsync();
            var categoryDtos = categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name
            }).ToList(); // Adicionado ToList()
            return Ok(categoryDtos);
        }

        // GET: api/categories/5 (Já existe)
        [HttpGet("{id}", Name = "GetCategoryById")] // Adicionado Name para CreatedAtAction
        [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
            {
                return NotFound();
            }
            var categoryDto = new CategoryDto { Id = category.Id, Name = category.Name };
            return Ok(categoryDto);
        }

        // POST: api/categories
        [HttpPost]
        [Authorize(Roles = "Admin")] // Protegido
        [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateCategoryDto createCategoryDto)
        {
            if (createCategoryDto == null) return BadRequest("Dados da categoria inválidos.");
            // Opcional: Verificar se já existe uma categoria com o mesmo nome

            var category = new Category { Name = createCategoryDto.Name };

            await _categoryRepository.AddAsync(category);
            await _categoryRepository.SaveChangesAsync();

            var categoryDto = new CategoryDto { Id = category.Id, Name = category.Name };

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, categoryDto);
        }

        // PUT: api/categories/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")] // Protegido
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryDto updateCategoryDto)
        {
            if (updateCategoryDto == null || id <= 0) // id do DTO não é usado, o id da rota é o que vale
            {
                return BadRequest("Dados de atualização inválidos ou ID da categoria ausente.");
            }

            var categoryToUpdate = await _categoryRepository.GetByIdAsync(id);
            if (categoryToUpdate == null)
            {
                return NotFound($"Categoria com ID {id} não encontrada.");
            }

            // Opcional: Verificar se já existe OUTRA categoria com o novo nome
            categoryToUpdate.Name = updateCategoryDto.Name;
            _categoryRepository.Update(categoryToUpdate);
            await _categoryRepository.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/categories/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Protegido
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var categoryToDelete = await _categoryRepository.GetByIdAsync(id);
            if (categoryToDelete == null)
            {
                return NotFound($"Categoria com ID {id} não encontrada.");
            }

            // ATENÇÃO: Deletar uma categoria pode falhar se houver produtos associados a ela,
            // dependendo da configuração OnDelete da chave estrangeira (que definimos como SetNull).
            // Se for SetNull, os produtos terão CategoryId = null.
            // Se fosse Restrict, daria erro de FK aqui.
            _categoryRepository.Delete(categoryToDelete);
            await _categoryRepository.SaveChangesAsync();

            return NoContent();
        }
    }
}