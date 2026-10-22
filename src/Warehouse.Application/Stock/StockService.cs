using Microsoft.EntityFrameworkCore;
using Warehouse.Application.Common.Interfaces;
using Warehouse.Domain.Entities;
using Warehouse.Domain.Enums;
using Warehouse.Domain.Exceptions;

namespace Warehouse.Application.Stock;

internal static class StockService
{
    public static async Task<StockBalance> GetOrCreateBalanceAsync(
        IWarehouseDbContext db,
        Guid productId,
        Guid locationId,
        CancellationToken cancellationToken)
    {
        var balance = await db.StockBalances
            .FirstOrDefaultAsync(b => b.ProductId == productId && b.LocationId == locationId, cancellationToken);

        if (balance is not null)
            return balance;

        balance = StockBalance.Create(productId, locationId);
        db.StockBalances.Add(balance);
        return balance;
    }

    public static async Task EnsureProductAndLocationAsync(
        IWarehouseDbContext db,
        Guid productId,
        Guid locationId,
        CancellationToken cancellationToken)
    {
        var productExists = await db.Products.AnyAsync(p => p.Id == productId && p.IsActive, cancellationToken);
        if (!productExists)
            throw new DomainException($"Active product '{productId}' was not found.");

        var locationExists = await db.Locations.AnyAsync(l => l.Id == locationId && l.IsActive, cancellationToken);
        if (!locationExists)
            throw new DomainException($"Active location '{locationId}' was not found.");
    }

    public static async Task RecordMovementAsync(
        IWarehouseDbContext db,
        Guid productId,
        Guid locationId,
        MovementType type,
        decimal quantity,
        string reference,
        string? note,
        Guid? relatedLocationId,
        CancellationToken cancellationToken)
    {
        var movement = StockMovement.Record(productId, locationId, type, quantity, reference, note, relatedLocationId);
        db.StockMovements.Add(movement);
        await Task.CompletedTask;
    }
}
