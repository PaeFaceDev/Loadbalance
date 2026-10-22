using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Warehouse.Domain.Entities;
using Warehouse.Domain.Enums;

namespace Warehouse.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(WarehouseDbContext db, ILogger logger, CancellationToken cancellationToken = default)
    {
        if (await db.Products.AnyAsync(cancellationToken))
            return;

        logger.LogInformation("Seeding demo warehouse data...");

        var products = new[]
        {
            Product.Create("SKU-1001", "Bluetooth Scanner", "pcs", 10),
            Product.Create("SKU-1002", "Thermal Label Roll", "roll", 25),
            Product.Create("SKU-1003", "Packing Box (M)", "pcs", 50)
        };

        var locations = new[]
        {
            WarehouseLocation.Create("A-01-01", "Aisle A Rack 1", "A"),
            WarehouseLocation.Create("B-02-03", "Aisle B Rack 3", "B"),
            WarehouseLocation.Create("STAGING", "Staging Area", "STG")
        };

        db.Products.AddRange(products);
        db.Locations.AddRange(locations);
        await db.SaveChangesAsync(cancellationToken);

        var scanner = products[0];
        var labels = products[1];
        var locA = locations[0];
        var locB = locations[1];

        db.StockBalances.AddRange(
            StockBalance.Create(scanner.Id, locA.Id, 40),
            StockBalance.Create(labels.Id, locB.Id, 120));

        db.StockMovements.AddRange(
            StockMovement.Record(scanner.Id, locA.Id, MovementType.Receive, 40, "PO-2026-001", "Initial seed"),
            StockMovement.Record(labels.Id, locB.Id, MovementType.Receive, 120, "PO-2026-002", "Initial seed"));

        await db.SaveChangesAsync(cancellationToken);
    }
}
