// src/Application/Dtos/CategoryDto.cs
namespace MinimalistECommerce.Application.Dtos
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        // Poderíamos adicionar outras propriedades se necessário, como ContagemDeProdutos, etc.
    }
}