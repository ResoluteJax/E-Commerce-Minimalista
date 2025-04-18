using System;
using System.Collections.Generic;
using System.Diagnostics.Tracing;
using System.Linq;
using System.Threading.Tasks;

namespace MinimalistECommerce.Domain.Entities{
    public class Product
    {
        public int Id {get;set; }
        public string Name {get; set; } = string.Empty;
        public string Description {get; set; } = string.Empty;
        public decimal price {get; set; }
        public string ImagemUrl {get; set; } = string.Empty;

        // Poderíamos adicionar mais propriedades no futuro, como:
        // public int StockQuantity { get; set; }
        // public int CategoryId { get; set; } // Chave estrangeira para Categoria
        // public Category Category { get; set; } // Propriedade de navegação
    }
}