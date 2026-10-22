using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Warehouse.Application.Common.Interfaces;
using Warehouse.Domain.Enums;
using Warehouse.Domain.Exceptions;

namespace Warehouse.Application.Stock;

public sealed record GetStockBalancesQuery(Guid? ProductId = null, Guid? LocationId = null)
    : IRequest<IReadOnlyList<StockBalanceDto>>;

public sealed class GetStockBalancesHandler(IWarehouseDbContext db)
    : IRequestHandler<GetStockBalancesQuery, IReadOnlyList<StockBalanceDto>>
{
    public async Task<IReadOnlyList<StockBalanceDto>> Handle(GetStockBalancesQuery request, CancellationToken cancellationToken)
    {
        var query =
            from b in db.StockBalances.AsNoTracking()
            join p in db.Products.AsNoTracking() on b.ProductId equals p.Id
            join l in db.Locations.AsNoTracking() on b.LocationId equals l.Id
            select new { b, p, l };

        if (request.ProductId.HasValue)
            query = query.Where(x => x.b.ProductId == request.ProductId.Value);
        if (request.LocationId.HasValue)
            query = query.Where(x => x.b.LocationId == request.LocationId.Value);

        var rows = await query
            .OrderBy(x => x.p.Sku)
            .ThenBy(x => x.l.Code)
            .ToListAsync(cancellationToken);

        return rows.Select(x => new StockBalanceDto(
            x.b.ProductId,
            x.p.Sku,
            x.p.Name,
            x.b.LocationId,
            x.l.Code,
            x.b.Quantity,
            x.p.ReorderLevel,
            x.b.Quantity < x.p.ReorderLevel)).ToList();
    }
}

public sealed record GetStockMovementsQuery(int Limit = 50) : IRequest<IReadOnlyList<StockMovementDto>>;

public sealed class GetStockMovementsHandler(IWarehouseDbContext db)
    : IRequestHandler<GetStockMovementsQuery, IReadOnlyList<StockMovementDto>>
{
    public async Task<IReadOnlyList<StockMovementDto>> Handle(GetStockMovementsQuery request, CancellationToken cancellationToken)
    {
        var limit = request.Limit is < 1 or > 500 ? 50 : request.Limit;

        var rows = await (
            from m in db.StockMovements.AsNoTracking()
            join p in db.Products.AsNoTracking() on m.ProductId equals p.Id
            join l in db.Locations.AsNoTracking() on m.LocationId equals l.Id
            orderby m.CreatedAt descending
            select new { m, p, l }).Take(limit).ToListAsync(cancellationToken);

        return rows.Select(x => new StockMovementDto(
            x.m.Id,
            x.m.ProductId,
            x.p.Sku,
            x.m.LocationId,
            x.l.Code,
            x.m.Type.ToString(),
            x.m.Quantity,
            x.m.Reference,
            x.m.Note,
            x.m.CreatedAt)).ToList();
    }
}

public sealed record ReceiveStockCommand(ReceiveStockRequest Request) : IRequest<StockBalanceDto>;

public sealed class ReceiveStockValidator : AbstractValidator<ReceiveStockCommand>
{
    public ReceiveStockValidator()
    {
        RuleFor(x => x.Request.Quantity).GreaterThan(0);
        RuleFor(x => x.Request.Reference).NotEmpty().MaximumLength(128);
    }
}

public sealed class ReceiveStockHandler(IWarehouseDbContext db) : IRequestHandler<ReceiveStockCommand, StockBalanceDto>
{
    public async Task<StockBalanceDto> Handle(ReceiveStockCommand command, CancellationToken cancellationToken)
    {
        var req = command.Request;
        await StockService.EnsureProductAndLocationAsync(db, req.ProductId, req.LocationId, cancellationToken);

        var balance = await StockService.GetOrCreateBalanceAsync(db, req.ProductId, req.LocationId, cancellationToken);
        balance.ApplyDelta(req.Quantity);
        await StockService.RecordMovementAsync(
            db, req.ProductId, req.LocationId, MovementType.Receive, req.Quantity, req.Reference, req.Note, null, cancellationToken);

        await db.SaveChangesAsync(cancellationToken);
        return (await new GetStockBalancesHandler(db).Handle(
            new GetStockBalancesQuery(req.ProductId, req.LocationId), cancellationToken)).First();
    }
}

public sealed record IssueStockCommand(IssueStockRequest Request) : IRequest<StockBalanceDto>;

public sealed class IssueStockValidator : AbstractValidator<IssueStockCommand>
{
    public IssueStockValidator()
    {
        RuleFor(x => x.Request.Quantity).GreaterThan(0);
        RuleFor(x => x.Request.Reference).NotEmpty().MaximumLength(128);
    }
}

public sealed class IssueStockHandler(IWarehouseDbContext db) : IRequestHandler<IssueStockCommand, StockBalanceDto>
{
    public async Task<StockBalanceDto> Handle(IssueStockCommand command, CancellationToken cancellationToken)
    {
        var req = command.Request;
        await StockService.EnsureProductAndLocationAsync(db, req.ProductId, req.LocationId, cancellationToken);

        var balance = await StockService.GetOrCreateBalanceAsync(db, req.ProductId, req.LocationId, cancellationToken);
        balance.ApplyDelta(-req.Quantity);
        await StockService.RecordMovementAsync(
            db, req.ProductId, req.LocationId, MovementType.Issue, req.Quantity, req.Reference, req.Note, null, cancellationToken);

        await db.SaveChangesAsync(cancellationToken);
        return (await new GetStockBalancesHandler(db).Handle(
            new GetStockBalancesQuery(req.ProductId, req.LocationId), cancellationToken)).First();
    }
}

public sealed record TransferStockCommand(TransferStockRequest Request) : IRequest<IReadOnlyList<StockBalanceDto>>;

public sealed class TransferStockValidator : AbstractValidator<TransferStockCommand>
{
    public TransferStockValidator()
    {
        RuleFor(x => x.Request.Quantity).GreaterThan(0);
        RuleFor(x => x.Request.Reference).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Request).Must(r => r.FromLocationId != r.ToLocationId)
            .WithMessage("Source and destination locations must differ.");
    }
}

public sealed class TransferStockHandler(IWarehouseDbContext db)
    : IRequestHandler<TransferStockCommand, IReadOnlyList<StockBalanceDto>>
{
    public async Task<IReadOnlyList<StockBalanceDto>> Handle(TransferStockCommand command, CancellationToken cancellationToken)
    {
        var req = command.Request;
        await StockService.EnsureProductAndLocationAsync(db, req.ProductId, req.FromLocationId, cancellationToken);
        await StockService.EnsureProductAndLocationAsync(db, req.ProductId, req.ToLocationId, cancellationToken);

        var from = await StockService.GetOrCreateBalanceAsync(db, req.ProductId, req.FromLocationId, cancellationToken);
        var to = await StockService.GetOrCreateBalanceAsync(db, req.ProductId, req.ToLocationId, cancellationToken);

        from.ApplyDelta(-req.Quantity);
        to.ApplyDelta(req.Quantity);

        await StockService.RecordMovementAsync(
            db, req.ProductId, req.FromLocationId, MovementType.TransferOut, req.Quantity, req.Reference, req.Note, req.ToLocationId, cancellationToken);
        await StockService.RecordMovementAsync(
            db, req.ProductId, req.ToLocationId, MovementType.TransferIn, req.Quantity, req.Reference, req.Note, req.FromLocationId, cancellationToken);

        await db.SaveChangesAsync(cancellationToken);

        return await new GetStockBalancesHandler(db).Handle(
            new GetStockBalancesQuery(req.ProductId, null), cancellationToken);
    }
}

public sealed record AdjustStockCommand(AdjustStockRequest Request) : IRequest<StockBalanceDto>;

public sealed class AdjustStockValidator : AbstractValidator<AdjustStockCommand>
{
    public AdjustStockValidator()
    {
        RuleFor(x => x.Request.Delta).NotEqual(0);
        RuleFor(x => x.Request.Reference).NotEmpty().MaximumLength(128);
    }
}

public sealed class AdjustStockHandler(IWarehouseDbContext db) : IRequestHandler<AdjustStockCommand, StockBalanceDto>
{
    public async Task<StockBalanceDto> Handle(AdjustStockCommand command, CancellationToken cancellationToken)
    {
        var req = command.Request;
        await StockService.EnsureProductAndLocationAsync(db, req.ProductId, req.LocationId, cancellationToken);

        var balance = await StockService.GetOrCreateBalanceAsync(db, req.ProductId, req.LocationId, cancellationToken);
        balance.ApplyDelta(req.Delta);
        await StockService.RecordMovementAsync(
            db, req.ProductId, req.LocationId, MovementType.Adjust, Math.Abs(req.Delta), req.Reference, req.Note, null, cancellationToken);

        await db.SaveChangesAsync(cancellationToken);
        return (await new GetStockBalancesHandler(db).Handle(
            new GetStockBalancesQuery(req.ProductId, req.LocationId), cancellationToken)).First();
    }
}
