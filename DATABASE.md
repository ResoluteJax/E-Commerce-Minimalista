erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : includes

    CUSTOMER {
        int Id PK
        string Name
        string Email
        string Address
    }

    ORDER {
        int Id PK
        datetime OrderDate
        int CustomerId FK
        decimal TotalAmount
        string ShippingAddress
        string Status
    }

    ORDER_ITEM {
        int Id PK
        int OrderId FK
        int ProductId FK
        int Quantity
        decimal UnitPrice
    }

    PRODUCT {
        int Id PK
        string Name
        string Description
        decimal Price
        string ImageUrl
    }