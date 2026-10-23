namespace Warehouse.Api.Auth;

public sealed record DemoUser(
    string Id,
    string Username,
    string Password,
    string DisplayName,
    string Role,
    string Warehouse);

internal static class DemoUserStore
{
    private static readonly DemoUser[] Users =
    [
        new("usr-admin", "admin", "Admin@123", "Warehouse Admin", "Admin", "BKK-DC01"),
        new("usr-manager", "manager", "Manager@123", "คลังผู้จัดการ", "Manager", "BKK-DC01"),
        new("usr-operator", "operator", "Operator@123", "พนักงานคลัง", "Operator", "BKK-DC01")
    ];

    public static DemoUser? Find(string username, string password)
    {
        return Users.FirstOrDefault(u =>
            string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase)
            && u.Password == password);
    }

    public static DemoUser? FindById(string id) => Users.FirstOrDefault(u => u.Id == id);
}
