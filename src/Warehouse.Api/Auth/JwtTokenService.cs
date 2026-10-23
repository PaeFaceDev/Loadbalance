using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Warehouse.Api.Auth;

public class JwtTokenService(IConfiguration configuration)
{
    public LoginResponse Issue(DemoUser user)
    {
        var key = configuration["Jwt:Key"] ?? "warehouse-demo-jwt-signing-key-32chars!!";
        var issuer = configuration["Jwt:Issuer"] ?? "warehouse-auth";
        var audience = configuration["Jwt:Audience"] ?? "warehouse-wms";
        var minutes = configuration.GetValue("Jwt:ExpiresMinutes", 480);
        var expires = DateTimeOffset.UtcNow.AddMinutes(minutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
            new Claim(ClaimTypes.Name, user.DisplayName),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("warehouse", user.Warehouse)
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: expires.UtcDateTime,
            signingCredentials: credentials);

        return new LoginResponse(
            new JwtSecurityTokenHandler().WriteToken(token),
            expires,
            new AuthUserDto(user.Id, user.Username, user.DisplayName, user.Role, user.Warehouse));
    }
}
