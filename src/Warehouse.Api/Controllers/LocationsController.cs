using MediatR;
using Microsoft.AspNetCore.Mvc;
using Warehouse.Application.Locations;

namespace Warehouse.Api.Controllers;

[ApiController]
[Route("api/locations")]
public sealed class LocationsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<LocationDto>> GetAll([FromQuery] bool activeOnly = false, CancellationToken cancellationToken = default)
        => mediator.Send(new GetLocationsQuery(activeOnly), cancellationToken);

    [HttpPost]
    public Task<LocationDto> Create([FromBody] CreateLocationRequest request, CancellationToken cancellationToken = default)
        => mediator.Send(new CreateLocationCommand(request), cancellationToken);

    [HttpPut("{id:guid}")]
    public Task<LocationDto> Update(Guid id, [FromBody] UpdateLocationRequest request, CancellationToken cancellationToken = default)
        => mediator.Send(new UpdateLocationCommand(id, request), cancellationToken);
}
