using Warehouse.Domain.Common;
using Warehouse.Domain.Exceptions;

namespace Warehouse.Domain.Entities;

public sealed class WarehouseLocation : BaseEntity
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Zone { get; private set; } = string.Empty;
    public bool IsActive { get; private set; } = true;

    private WarehouseLocation()
    {
    }

    public static WarehouseLocation Create(string code, string name, string zone)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new DomainException("Location code is required.");
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Location name is required.");

        return new WarehouseLocation
        {
            Code = code.Trim().ToUpperInvariant(),
            Name = name.Trim(),
            Zone = string.IsNullOrWhiteSpace(zone) ? "DEFAULT" : zone.Trim().ToUpperInvariant()
        };
    }

    public void Update(string name, string zone, bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Location name is required.");

        Name = name.Trim();
        Zone = string.IsNullOrWhiteSpace(zone) ? Zone : zone.Trim().ToUpperInvariant();
        IsActive = isActive;
        Touch();
    }
}
