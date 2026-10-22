using Warehouse.Domain.Entities;
using Warehouse.Domain.Exceptions;

namespace Warehouse.Tests.Domain;

public class StockBalanceTests
{
    [Fact]
    public void ApplyDelta_WhenInsufficientStock_Throws()
    {
        var balance = StockBalance.Create(Guid.NewGuid(), Guid.NewGuid(), 5);

        Assert.Throws<InsufficientStockException>(() => balance.ApplyDelta(-6));
    }

    [Fact]
    public void ApplyDelta_WhenValid_UpdatesQuantity()
    {
        var balance = StockBalance.Create(Guid.NewGuid(), Guid.NewGuid(), 5);

        balance.ApplyDelta(-2);

        Assert.Equal(3, balance.Quantity);
    }
}
