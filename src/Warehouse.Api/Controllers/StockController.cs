using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Warehouse.Application.Stock;

namespace Warehouse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/stock")]
public sealed class StockController(IMediator mediator) : ControllerBase
{
    [HttpGet("balances")]
    public Task<IReadOnlyList<StockBalanceDto>> GetBalances(
        [FromQuery] Guid? productId,
        [FromQuery] Guid? locationId,
        CancellationToken cancellationToken = default)
        => mediator.Send(new GetStockBalancesQuery(productId, locationId), cancellationToken);

    [HttpGet("movements")]
    public Task<IReadOnlyList<StockMovementDto>> GetMovements([FromQuery] int limit = 50, CancellationToken cancellationToken = default)
        => mediator.Send(new GetStockMovementsQuery(limit), cancellationToken);

    [HttpPost("receive")]
    public Task<StockBalanceDto> Receive([FromBody] ReceiveStockRequest request, CancellationToken cancellationToken = default)
        => mediator.Send(new ReceiveStockCommand(request), cancellationToken);

    [HttpPost("issue")]
    public Task<StockBalanceDto> Issue([FromBody] IssueStockRequest request, CancellationToken cancellationToken = default)
        => mediator.Send(new IssueStockCommand(request), cancellationToken);

    [HttpPost("transfer")]
    public Task<IReadOnlyList<StockBalanceDto>> Transfer([FromBody] TransferStockRequest request, CancellationToken cancellationToken = default)
        => mediator.Send(new TransferStockCommand(request), cancellationToken);

    [HttpPost("adjust")]
    public Task<StockBalanceDto> Adjust([FromBody] AdjustStockRequest request, CancellationToken cancellationToken = default)
        => mediator.Send(new AdjustStockCommand(request), cancellationToken);
}
