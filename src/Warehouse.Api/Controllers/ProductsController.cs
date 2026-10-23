using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Warehouse.Application.Products;

namespace Warehouse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/products")]
public sealed class ProductsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<ProductDto>> GetAll([FromQuery] bool activeOnly = false, CancellationToken cancellationToken = default)
        => mediator.Send(new GetProductsQuery(activeOnly), cancellationToken);

    [HttpGet("{id:guid}")]
    public Task<ProductDto> GetById(Guid id, CancellationToken cancellationToken = default)
        => mediator.Send(new GetProductByIdQuery(id), cancellationToken);

    [HttpPost]
    public Task<ProductDto> Create([FromBody] CreateProductRequest request, CancellationToken cancellationToken = default)
        => mediator.Send(new CreateProductCommand(request), cancellationToken);

    [HttpPut("{id:guid}")]
    public Task<ProductDto> Update(Guid id, [FromBody] UpdateProductRequest request, CancellationToken cancellationToken = default)
        => mediator.Send(new UpdateProductCommand(id, request), cancellationToken);
}
