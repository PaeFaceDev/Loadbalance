using MediatR;
using Microsoft.EntityFrameworkCore;
using Warehouse.Application.Common.Interfaces;

namespace Warehouse.Application.Products;

public sealed record GetProductsQuery(bool ActiveOnly = false) : IRequest<IReadOnlyList<ProductDto>>;

public sealed class GetProductsHandler(IWarehouseDbContext db) : IRequestHandler<GetProductsQuery, IReadOnlyList<ProductDto>>
{
    public async Task<IReadOnlyList<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var query = db.Products.AsNoTracking();
        if (request.ActiveOnly)
            query = query.Where(p => p.IsActive);

        var items = await query.OrderBy(p => p.Sku).ToListAsync(cancellationToken);
        return items.Select(CreateProductHandler.Map).ToList();
    }
}
