using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Warehouse.Api.Auth;

namespace Warehouse.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(JwtTokenService tokens) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var user = DemoUserStore.Find(request.Username?.Trim() ?? string.Empty, request.Password ?? string.Empty);
        if (user is null)
            return Unauthorized(new { message = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });

        return Ok(tokens.Issue(user));
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var id = User.FindFirst("sub")?.Value
                 ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                 ?? User.Identity?.Name;

        var user = id is null ? null : DemoUserStore.FindById(id);
        if (user is null)
            return Unauthorized();

        return Ok(new AuthUserDto(user.Id, user.Username, user.DisplayName, user.Role, user.Warehouse));
    }
}
