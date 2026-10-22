using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Warehouse.Infrastructure.Postgrest;

public static class PostgrestSchemaInitializer
{
    private const string Sql = """
        CREATE SCHEMA IF NOT EXISTS api;

        CREATE OR REPLACE VIEW api.stock_overview AS
        SELECT
            p."Id" AS product_id,
            p."Sku" AS sku,
            p."Name" AS product_name,
            p."Unit" AS unit,
            p."ReorderLevel" AS reorder_level,
            l."Id" AS location_id,
            l."Code" AS location_code,
            l."Zone" AS zone,
            COALESCE(b."Quantity", 0) AS quantity,
            (COALESCE(b."Quantity", 0) < p."ReorderLevel") AS below_reorder_level
        FROM products p
        CROSS JOIN locations l
        LEFT JOIN stock_balances b ON b."ProductId" = p."Id" AND b."LocationId" = l."Id"
        WHERE p."IsActive" = TRUE AND l."IsActive" = TRUE;

        CREATE OR REPLACE VIEW api.recent_movements AS
        SELECT
            m."Id" AS id,
            p."Sku" AS sku,
            l."Code" AS location_code,
            m."Type" AS movement_type,
            m."Quantity" AS quantity,
            m."Reference" AS reference,
            m."Note" AS note,
            m."CreatedAt" AS created_at
        FROM stock_movements m
        INNER JOIN products p ON p."Id" = m."ProductId"
        INNER JOIN locations l ON l."Id" = m."LocationId";

        GRANT USAGE ON SCHEMA api TO warehouse_anon;
        GRANT SELECT ON ALL TABLES IN SCHEMA api TO warehouse_anon;
        ALTER DEFAULT PRIVILEGES IN SCHEMA api GRANT SELECT ON TABLES TO warehouse_anon;

        GRANT SELECT ON products, locations, stock_balances, stock_movements TO warehouse_anon;
        """;

    public static async Task EnsureAsync(DbContext db, ILogger logger, CancellationToken cancellationToken = default)
    {
        try
        {
            await db.Database.ExecuteSqlRawAsync(Sql, cancellationToken);
            logger.LogInformation("PostgREST api schema views are ready.");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "PostgREST schema init skipped (roles may not exist yet in local-only runs).");
        }
    }
}
