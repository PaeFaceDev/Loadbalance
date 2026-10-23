namespace Warehouse.Api.Auth;

public sealed record LoginRequest(string Username, string Password);

public sealed record AuthUserDto(
    string Id,
    string Username,
    string DisplayName,
    string Role,
    string Warehouse);

public sealed record LoginResponse(string Token, DateTimeOffset ExpiresAt, AuthUserDto User);
