namespace Warehouse.Domain.Exceptions;

public sealed class InsufficientStockException : DomainException
{
    public InsufficientStockException(Guid productId, Guid locationId, decimal requested, decimal available)
        : base($"Insufficient stock for product {productId} at location {locationId}. Requested {requested}, available {available}.")
    {
    }
}
