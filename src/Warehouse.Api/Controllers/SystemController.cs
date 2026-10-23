using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Warehouse.Api.Controllers;

[AllowAnonymous]
[ApiController]
[Route("api/system")]
public sealed class SystemController(IConfiguration configuration) : ControllerBase
{
    [HttpGet("info")]
    public IActionResult Info()
    {
        return Ok(new
        {
            service = "Warehouse Management API",
            instanceId = configuration["INSTANCE_ID"] ?? Environment.MachineName,
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
            utcNow = DateTimeOffset.UtcNow
        });
    }
}
