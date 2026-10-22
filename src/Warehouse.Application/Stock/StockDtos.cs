namespace Warehouse.Application.Stock;

public sealed record StockBalanceDto(
    Guid ProductId,
    string ProductSku,
    string ProductName,
    Guid LocationId,
    string LocationCode,
    decimal Quantity,
    decimal ReorderLevel,
    bool BelowReorderLevel);

public sealed record StockMovementDto(
    Guid Id,
    Guid ProductId,
    string ProductSku,
    Guid LocationId,
    string LocationCode,
    string Type,
    decimal Quantity,
    string Reference,
    string? Note,
    DateTimeOffset CreatedAt);

public sealed record ReceiveStockRequest(Guid ProductId, Guid LocationId, decimal Quantity, string Reference, string? Note);

public sealed record IssueStockRequest(Guid ProductId, Guid LocationId, decimal Quantity, string Reference, string? Note);

public sealed record TransferStockRequest(
    Guid ProductId,
    Guid FromLocationId,
    Guid ToLocationId,
    decimal Quantity,
    string Reference,
    string? Note);

public sealed record AdjustStockRequest(Guid ProductId, Guid LocationId, decimal Delta, string Reference, string? Note);
