using Warehouse.Domain.Common;
using Warehouse.Domain.Exceptions;

namespace Warehouse.Domain.Entities;

public sealed class Product : BaseEntity
{
    public string Sku { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Unit { get; private set; } = "pcs";
    public decimal ReorderLevel { get; private set; }
    public bool IsActive { get; private set; } = true;

    private Product()
    {
    }

    public static Product Create(string sku, string name, string unit, decimal reorderLevel)
    {
        if (string.IsNullOrWhiteSpace(sku))
            throw new DomainException("SKU is required.");
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Product name is required.");

        return new Product
        {
            Sku = sku.Trim().ToUpperInvariant(),
            Name = name.Trim(),
            Unit = string.IsNullOrWhiteSpace(unit) ? "pcs" : unit.Trim(),
            ReorderLevel = reorderLevel < 0 ? 0 : reorderLevel
        };
    }

    public void Update(string name, string unit, decimal reorderLevel, bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Product name is required.");

        Name = name.Trim();
        Unit = string.IsNullOrWhiteSpace(unit) ? Unit : unit.Trim();
        ReorderLevel = reorderLevel < 0 ? 0 : reorderLevel;
        IsActive = isActive;
        Touch();
    }
}
