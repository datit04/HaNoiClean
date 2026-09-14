# ? Permissions - Quick Check

## Tr? l?i: **Permissions ?Ã ???c thêm vào DbInitializer!**

### ?? ?ã làm gì:

```csharp
// File: DbInitializer.cs

#region Permissions (Claims)
// Seed T?T C? permissions cho Admin role
if (!_context.RoleClaims.Any())
{
    var adminRole = await _roleManager.FindByNameAsync("Admin");
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
```

---

## ?? Ch?y ?? seed:

```bash
# Permissions s? t? ??ng ???c add vào DB khi ch?y app
dotnet run
```

---

## ?? Verify trong Database:

```sql
-- Xem permissions ?ã ???c seed
SELECT ClaimValue 
FROM AspNetRoleClaims 
WHERE ClaimType = 'Permission' 
  AND RoleId = (SELECT Id FROM AspNetRoles WHERE Name = 'Admin');

-- K?t qu? mong ??i (m?t ph?n):
-- Users.View
-- Users.Create
-- Reports.Create
-- Reports.UpdateStatus
-- Categories.Create
-- ... (t?t c? permissions t? Permissions.cs)
```

---

## ? Checklist:

- [x] Permissions.cs ??nh ngh?a các permissions
- [x] DbInitializer.cs seed permissions vào Admin role
- [x] Program.cs g?i DbInitializer.Seed()
- [ ] **C?n ch?y app ?? seed vào DB**

---

## ?? Permissions S? ???c Seed:

| Group | Permissions |
|-------|-------------|
| Users | View, Create, Update, Delete |
| Roles | View, Create, Update, Delete |
| Reports | Create, View, UpdateStatus, Assign, Delete |
| Categories | View, Create, Update, Delete |
| Wards | View, Create, Update, Delete |
| Teams | View |

**T?ng:** ~20+ permissions

---

**Chi ti?t:** Xem [PERMISSIONS-SEEDING.md](PERMISSIONS-SEEDING.md)
