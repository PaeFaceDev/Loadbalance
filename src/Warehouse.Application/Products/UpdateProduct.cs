using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Warehouse.Application.Common.Interfaces;
using Warehouse.Domain.Exceptions;

namespace Warehouse.Application.Products;

public sealed record UpdateProductCommand(Guid Id, UpdateProductRequest Request) : IRequest<ProductDto>;

public sealed class UpdateProductValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Request.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Request.Unit).MaximumLength(32);
        RuleFor(x => x.Request.ReorderLevel).GreaterThanOrEqualTo(0);
    }
}

public sealed class UpdateProductHandler(IWarehouseDbContext db) : IRequestHandler<UpdateProductCommand, ProductDto>
{
    public async Task<ProductDto> Handle(UpdateProductCommand command, CancellationToken cancellationToken)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == command.Id, cancellationToken);
        if (product is null)
            throw new DomainException($"Product '{command.Id}' was not found.");

        product.Update(command.Request.Name, command.Request.Unit, command.Request.ReorderLevel, command.Request.IsActive);
        await db.SaveChangesAsync(cancellationToken);

        return CreateProductHandler.Map(product);
    }
}
