using Microsoft.EntityFrameworkCore;
using Warehouse.Domain.Entities;

namespace Warehouse.Application.Common.Interfaces;

public interface IWarehouseDbContext
{
    DbSet<Product> Products { get; }
    DbSet<WarehouseLocation> Locations { get; }
    DbSet<StockBalance> StockBalances { get; }
    DbSet<StockMovement> StockMovements { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
