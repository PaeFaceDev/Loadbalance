using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Warehouse.Application.Common.Interfaces;
using Warehouse.Domain.Entities;
using Warehouse.Domain.Exceptions;

namespace Warehouse.Application.Products;

public sealed record CreateProductCommand(CreateProductRequest Request) : IRequest<ProductDto>;

public sealed class CreateProductValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Request.Sku).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Request.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Request.Unit).MaximumLength(32);
        RuleFor(x => x.Request.ReorderLevel).GreaterThanOrEqualTo(0);
    }
}

public sealed class CreateProductHandler(IWarehouseDbContext db) : IRequestHandler<CreateProductCommand, ProductDto>
{
    public async Task<ProductDto> Handle(CreateProductCommand command, CancellationToken cancellationToken)
    {
        var sku = command.Request.Sku.Trim().ToUpperInvariant();
        if (await db.Products.AnyAsync(p => p.Sku == sku, cancellationToken))
            throw new DomainException($"SKU '{sku}' already exists.");

        var product = Product.Create(sku, command.Request.Name, command.Request.Unit, command.Request.ReorderLevel);
        db.Products.Add(product);
        await db.SaveChangesAsync(cancellationToken);

        return Map(product);
    }

    internal static ProductDto Map(Product p) =>
        new(p.Id, p.Sku, p.Name, p.Unit, p.ReorderLevel, p.IsActive, p.CreatedAt);
}
