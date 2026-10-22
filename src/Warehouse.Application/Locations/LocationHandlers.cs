using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Warehouse.Application.Common.Interfaces;
using Warehouse.Domain.Entities;
using Warehouse.Domain.Exceptions;

namespace Warehouse.Application.Locations;

public sealed record GetLocationsQuery(bool ActiveOnly = false) : IRequest<IReadOnlyList<LocationDto>>;

public sealed class GetLocationsHandler(IWarehouseDbContext db) : IRequestHandler<GetLocationsQuery, IReadOnlyList<LocationDto>>
{
    public async Task<IReadOnlyList<LocationDto>> Handle(GetLocationsQuery request, CancellationToken cancellationToken)
    {
        var query = db.Locations.AsNoTracking();
        if (request.ActiveOnly)
            query = query.Where(l => l.IsActive);

        var items = await query.OrderBy(l => l.Code).ToListAsync(cancellationToken);
        return items.Select(Map).ToList();
    }

    internal static LocationDto Map(WarehouseLocation l) =>
        new(l.Id, l.Code, l.Name, l.Zone, l.IsActive, l.CreatedAt);
}

public sealed record CreateLocationCommand(CreateLocationRequest Request) : IRequest<LocationDto>;

public sealed class CreateLocationValidator : AbstractValidator<CreateLocationCommand>
{
    public CreateLocationValidator()
    {
        RuleFor(x => x.Request.Code).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Request.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Request.Zone).MaximumLength(64);
    }
}

public sealed class CreateLocationHandler(IWarehouseDbContext db) : IRequestHandler<CreateLocationCommand, LocationDto>
{
    public async Task<LocationDto> Handle(CreateLocationCommand command, CancellationToken cancellationToken)
    {
        var code = command.Request.Code.Trim().ToUpperInvariant();
        if (await db.Locations.AnyAsync(l => l.Code == code, cancellationToken))
            throw new DomainException($"Location code '{code}' already exists.");

        var location = WarehouseLocation.Create(code, command.Request.Name, command.Request.Zone);
        db.Locations.Add(location);
        await db.SaveChangesAsync(cancellationToken);

        return GetLocationsHandler.Map(location);
    }
}

public sealed record UpdateLocationCommand(Guid Id, UpdateLocationRequest Request) : IRequest<LocationDto>;

public sealed class UpdateLocationValidator : AbstractValidator<UpdateLocationCommand>
{
    public UpdateLocationValidator()
    {
        RuleFor(x => x.Request.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Request.Zone).MaximumLength(64);
    }
}

public sealed class UpdateLocationHandler(IWarehouseDbContext db) : IRequestHandler<UpdateLocationCommand, LocationDto>
{
    public async Task<LocationDto> Handle(UpdateLocationCommand command, CancellationToken cancellationToken)
    {
        var location = await db.Locations.FirstOrDefaultAsync(l => l.Id == command.Id, cancellationToken);
        if (location is null)
            throw new DomainException($"Location '{command.Id}' was not found.");

        location.Update(command.Request.Name, command.Request.Zone, command.Request.IsActive);
        await db.SaveChangesAsync(cancellationToken);

        return GetLocationsHandler.Map(location);
    }
}
