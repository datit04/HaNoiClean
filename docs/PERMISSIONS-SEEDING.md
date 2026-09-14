# ? Permissions ?ã ???c Thêm Vào DbInitializer

## ?? Tóm t?t

?ã c?p nh?t `DbInitializer.cs` ?? t? ??ng seed **t?t c? permissions** vào database khi ?ng d?ng kh?i ??ng l?n ??u.

---

## ?? Thay ??i trong DbInitializer.cs

### Tr??c (Thi?u Permissions):
```csharp
// Ch? có Roles và Users
#region Roles
    // T?o Admin, Citizen roles
#endregion

#region Users
    // T?o admin user
#endregion
```

### Sau (?ã thêm Permissions):
```csharp
#region Roles
    // T?o Admin, Citizen roles
#endregion

#region Permissions (Claims)  ? M?I!
    // Seed T?T C? permissions cho Admin role
    if (!_context.RoleClaims.Any())
    {
        var adminRole = await _roleManager.FindByNameAsync(SystemConstants.Roles.Admin);
        if (adminRole != null)
        {
            foreach (var permission in Permissions.All)
            {
                await _roleManager.AddClaimAsync(adminRole, 
                    new Claim("Permission", permission.Id));
            }
        }
    }
#endregion

#region Users
    // T?o admin user
#endregion
```

---

## ?? Permissions S? ???c Seed

D?a trên `Permissions.cs`, các permissions sau s? ???c t? ??ng add vào Admin role:

### Users Management
- `Users.View` - Xem danh sách ng??i dùng
- `Users.Create` - T?o ng??i dùng m?i
- `Users.Update` - C?p nh?t ng??i dùng
- `Users.Delete` - Xóa ng??i dùng

### Roles Management
- `Roles.View` - Xem danh sách vai trò
- `Roles.Create` - T?o vai trò m?i
- `Roles.Update` - C?p nh?t vai trò
- `Roles.Delete` - Xóa vai trò

### Reports Management
- `Reports.Create` - T?o báo cáo
- `Reports.View` - Xem báo cáo
- `Reports.UpdateStatus` - C?p nh?t tr?ng thái báo cáo
- `Reports.Assign` - Giao báo cáo cho ??i
- `Reports.Delete` - Xóa báo cáo

### Categories Management
- `Categories.View` - Xem danh m?c
- `Categories.Create` - T?o danh m?c
- `Categories.Update` - C?p nh?t danh m?c
- `Categories.Delete` - Xóa danh m?c

### Wards Management
- `Wards.View` - Xem ph??ng/xã
- `Wards.Create` - T?o ph??ng/xã
- `Wards.Update` - C?p nh?t ph??ng/xã
- `Wards.Delete` - Xóa ph??ng/xã

### Teams Management
- `Teams.View` - Xem ??i

---

## ?? Cách Permissions ???c Seed

### L?n ??u ch?y app:
1. ? App kh?i ??ng ? `Program.cs` g?i `DbInitializer.Seed()`
2. ? T?o 2 roles: **Admin** và **Citizen**
3. ? **M?I:** Add t?t c? permissions vào **Admin role** (as Claims)
4. ? T?o user **admin** v?i password `Admin@123`
5. ? Assign user vào **Admin role**

### K?t qu?:
- User **admin** s? có **T?T C? permissions** ngay t? ??u
- Permissions ???c l?u trong b?ng `AspNetRoleClaims`

---

## ?? Verify Permissions ?ã ???c Seed

### Cách 1: Query Database Tr?c Ti?p
```sql
-- Xem t?t c? permissions c?a Admin role
SELECT 
    rc.ClaimType,
    rc.ClaimValue,
    r.Name as RoleName
FROM AspNetRoleClaims rc
JOIN AspNetRoles r ON rc.RoleId = r.Id
WHERE r.Name = 'Admin'
ORDER BY rc.ClaimValue;

-- K?t qu? mong ??i:
-- ClaimType: Permission | ClaimValue: Categories.Create
-- ClaimType: Permission | ClaimValue: Categories.Delete
-- ClaimType: Permission | ClaimValue: Categories.Update
-- ... (t?t c? permissions)
```

### Cách 2: Qua API
```bash
# Login ?? l?y token
POST /api/auth/login
{
  "username": "admin",
  "password": "Admin@123"
}

# Decode JWT token và xem claims
# Ho?c g?i API yêu c?u permission:
GET /api/users
Authorization: Bearer {token}

# N?u có permission Users.View ? Thành công
```

### Cách 3: Check Code
```csharp
// Trong controller, attribute này s? check permission:
[Permission("Users.View")]
public async Task<IActionResult> GetAll()
{
    // Ch? user có claim "Permission: Users.View" m?i vào ???c
}
```

---

## ?? Khi Nào Permissions ???c Seed?

| Tình hu?ng | Seed? | Lý do |
|------------|-------|-------|
| First run (DB m?i) | ? YES | `!_context.RoleClaims.Any()` = true |
| Restart app (DB có data) | ? NO | `!_context.RoleClaims.Any()` = false |
| Add permission m?i | ? NO | C?n seed th? công ho?c xóa claims c? |

---

## ?? N?u Thêm Permission M?i

### Option 1: Xóa RoleClaims và Re-seed
```sql
-- Xóa t?t c? permissions c?
DELETE FROM AspNetRoleClaims WHERE ClaimType = 'Permission';

-- Restart app ? S? seed l?i t?t c? permissions m?i
```

### Option 2: Add Th? Công
```sql
-- L?y Admin RoleId
DECLARE @AdminRoleId NVARCHAR(450) = (SELECT Id FROM AspNetRoles WHERE Name = 'Admin');

-- Add permission m?i
INSERT INTO AspNetRoleClaims (RoleId, ClaimType, ClaimValue)
VALUES (@AdminRoleId, 'Permission', 'NewFeature.Create');
```

### Option 3: Migration
```csharp
public partial class AddNewPermissions : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            DECLARE @AdminRoleId NVARCHAR(450) = (SELECT Id FROM AspNetRoles WHERE Name = 'Admin');
            INSERT INTO AspNetRoleClaims (RoleId, ClaimType, ClaimValue)
            VALUES (@AdminRoleId, 'Permission', 'Comments.View'),
                   (@AdminRoleId, 'Permission', 'Comments.Delete');
        ");
    }
}
```

---

## ? Checklist

?? verify permissions ?ã ho?t ??ng:

- [ ] Build successful
- [ ] Run app `dotnet run`
- [ ] Check logs: "Seeding data..." xu?t hi?n
- [ ] Query database: `SELECT * FROM AspNetRoleClaims`
- [ ] Login v?i admin/Admin@123
- [ ] Test API có [Permission] attribute
- [ ] Verify user có quy?n truy c?p

---

## ?? Troubleshooting

### L?i: "Seeding data..." không xu?t hi?n
**Gi?i pháp:** DbInitializer ch?a ???c register trong DI container
```csharp
// Trong Startup.cs - ConfigureServices
services.AddScoped<DbInitializer>();
```

### L?i: RoleClaims v?n empty
**Gi?i pháp:** 
```sql
-- Xóa d? li?u c?
DELETE FROM AspNetRoleClaims;
DELETE FROM AspNetUserRoles;
DELETE FROM AspNetUsers;
DELETE FROM AspNetRoles;

-- Restart app ?? re-seed
```

### L?i: Permission check fails
**Gi?i pháp:** Ki?m tra PermissionFilter có ???c register không
```csharp
// Trong Startup.cs
services.AddControllersWithViews(options =>
{
    options.Filters.Add<PermissionFilter>();
});
```

---

## ?? Database Schema

```
AspNetRoles
??? Id (PK)
??? Name (Admin, Citizen)
??? NormalizedName

AspNetRoleClaims
??? Id (PK)
??? RoleId (FK ? AspNetRoles.Id)
??? ClaimType ("Permission")
??? ClaimValue ("Users.View", "Reports.Create", ...)

AspNetUserRoles
??? UserId (FK ? AspNetUsers.Id)
??? RoleId (FK ? AspNetRoles.Id)
```

**Flow:**
1. User ? UserRoles ? Roles
2. Roles ? RoleClaims ? Permissions
3. User có quy?n = RoleClaims c?a các Roles mà user thu?c v?

---

## ?? K?t Lu?n

? **Permissions ?ã ???c thêm vào DbInitializer**  
? **T? ??ng seed khi app ch?y l?n ??u**  
? **Admin có T?T C? permissions**  
? **S?n sàng s? d?ng [Permission] attribute**

---

**Next Steps:**
1. Ch?y app: `dotnet run`
2. Login v?i admin
3. Test các API có permission
4. T?o thêm roles và assign permissions tùy ch?nh
