using Warehouse.Domain.Common;
using Warehouse.Domain.Exceptions;

namespace Warehouse.Domain.Entities;

public sealed class StockBalance : BaseEntity
{
    public Guid ProductId { get; private set; }
    public Guid LocationId { get; private set; }
    public decimal Quantity { get; private set; }

    public Product Product { get; private set; } = null!;
    public WarehouseLocation Location { get; private set; } = null!;

    private StockBalance()
    {
    }

    public static StockBalance Create(Guid productId, Guid locationId, decimal quantity = 0)
    {
        if (quantity < 0)
            throw new DomainException("Initial quantity cannot be negative.");

        return new StockBalance
        {
            ProductId = productId,
            LocationId = locationId,
            Quantity = quantity
        };
    }

    public void ApplyDelta(decimal delta)
    {
        var next = Quantity + delta;
        if (next < 0)
            throw new InsufficientStockException(ProductId, LocationId, Math.Abs(delta), Quantity);

        Quantity = next;
        Touch();
    }
}
