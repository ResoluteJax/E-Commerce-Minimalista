namespace MinimalistECommerce.Domain.Entities
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; } // <-- Grafia e Casing CORRETOS
        public string ImageUrl { get; set; } = string.Empty; // <-- Grafia e Casing CORRETOS
    }
}