namespace Warehouse.Application.Products;

public sealed record ProductDto(
    Guid Id,
    string Sku,
    string Name,
    string Unit,
    decimal ReorderLevel,
    bool IsActive,
    DateTimeOffset CreatedAt);

public sealed record CreateProductRequest(string Sku, string Name, string Unit, decimal ReorderLevel);

public sealed record UpdateProductRequest(string Name, string Unit, decimal ReorderLevel, bool IsActive);
