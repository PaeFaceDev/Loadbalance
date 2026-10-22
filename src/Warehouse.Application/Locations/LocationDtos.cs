namespace Warehouse.Application.Locations;

public sealed record LocationDto(
    Guid Id,
    string Code,
    string Name,
    string Zone,
    bool IsActive,
    DateTimeOffset CreatedAt);

public sealed record CreateLocationRequest(string Code, string Name, string Zone);

public sealed record UpdateLocationRequest(string Name, string Zone, bool IsActive);
