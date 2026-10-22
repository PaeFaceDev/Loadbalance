using Warehouse.Domain.Common;
using Warehouse.Domain.Enums;
using Warehouse.Domain.Exceptions;

namespace Warehouse.Domain.Entities;

public sealed class StockMovement : BaseEntity
{
    public Guid ProductId { get; private set; }
    public Guid LocationId { get; private set; }
    public Guid? RelatedLocationId { get; private set; }
    public MovementType Type { get; private set; }
    public decimal Quantity { get; private set; }
    public string Reference { get; private set; } = string.Empty;
    public string? Note { get; private set; }

    public Product Product { get; private set; } = null!;
    public WarehouseLocation Location { get; private set; } = null!;

    private StockMovement()
    {
    }

    public static StockMovement Record(
        Guid productId,
        Guid locationId,
        MovementType type,
        decimal quantity,
        string reference,
        string? note,
        Guid? relatedLocationId = null)
    {
        if (quantity <= 0)
            throw new DomainException("Movement quantity must be positive.");
        if (string.IsNullOrWhiteSpace(reference))
            throw new DomainException("Reference is required.");

        return new StockMovement
        {
            ProductId = productId,
            LocationId = locationId,
            RelatedLocationId = relatedLocationId,
            Type = type,
            Quantity = quantity,
            Reference = reference.Trim(),
            Note = string.IsNullOrWhiteSpace(note) ? null : note.Trim()
        };
    }
}
