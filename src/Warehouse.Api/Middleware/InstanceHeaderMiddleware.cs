namespace Warehouse.Api.Middleware;

public sealed class InstanceHeaderMiddleware(RequestDelegate next, IConfiguration configuration)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var instanceId = configuration["INSTANCE_ID"] ?? Environment.MachineName;
        context.Response.OnStarting(() =>
        {
            context.Response.Headers["X-Instance-Id"] = instanceId;
            return Task.CompletedTask;
        });

        await next(context);
    }
}
