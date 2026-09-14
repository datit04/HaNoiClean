# H??ng d?n Migration cho Comments System

## B??c 1: T?o Migration

M? terminal t?i th? m?c root c?a solution và ch?y:

```bash
cd src/KnowledgeSpace.BackendServer
dotnet ef migrations add AddReportCommentsTable
```

## B??c 2: Ki?m tra Migration

Migration s? t?o file trong th? m?c `Migrations/` v?i n?i dung t??ng t?:

```csharp
public partial class AddReportCommentsTable : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "ReportComments",
            columns: table => new
            {
                Id = table.Column<long>(nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                ReportId = table.Column<long>(nullable: false),
                UserId = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                Content = table.Column<string>(maxLength: 2000, nullable: false),
                ImageUrl = table.Column<string>(maxLength: 500, nullable: true),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ReportComments", x => x.Id);
                table.ForeignKey(
                    name: "FK_ReportComments_Reports_ReportId",
                    column: x => x.ReportId,
                    principalTable: "Reports",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_ReportComments_AspNetUsers_UserId",
                    column: x => x.UserId,
                    principalTable: "AspNetUsers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_ReportComments_ReportId",
            table: "ReportComments",
            column: "ReportId");

        migrationBuilder.CreateIndex(
            name: "IX_ReportComments_UserId",
            table: "ReportComments",
            column: "UserId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "ReportComments");
    }
}
```

## B??c 3: Apply Migration vào Database

```bash
dotnet ef database update
```

## B??c 4: Verify trong Database

K?t n?i SQL Server và ki?m tra:

```sql
-- Ki?m tra b?ng ?ã ???c t?o
SELECT * FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'ReportComments'

-- Ki?m tra c?u trúc b?ng
EXEC sp_help 'ReportComments'

-- Ki?m tra indexes
EXEC sp_helpindex 'ReportComments'
```

## B??c 5: Test API

### 5.1. Test t?o comment
```bash
curl -X POST "https://localhost:7xxx/api/reports/1/comments" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "Content=Test comment" \
  -F "Image=@/path/to/image.jpg"
```

### 5.2. Test l?y comments
```bash
curl "https://localhost:7xxx/api/reports/1/comments"
```

### 5.3. Test count
```bash
curl "https://localhost:7xxx/api/reports/1/comments/count"
```

## Rollback (n?u c?n)

N?u mu?n h?y migration:

```bash
# Rollback database
dotnet ef database update PreviousMigrationName

# Xóa migration file
dotnet ef migrations remove
```

## Troubleshooting

### L?i: Foreign key constraint failed

**Nguyên nhân:** B?ng Reports ho?c AspNetUsers ch?a t?n t?i

**Gi?i pháp:**
```bash
# Ki?m tra các migration tr??c ?ó
dotnet ef migrations list

# ??m b?o ?ã ch?y t?t c? migrations
dotnet ef database update
```

### L?i: Column name conflicts

**Nguyên nhân:** ?ã có b?ng ReportComments t? tr??c

**Gi?i pháp:**
```sql
-- Drop b?ng c? (CHÚ Ý: M?t d? li?u)
DROP TABLE ReportComments

-- Ho?c rename b?ng c?
EXEC sp_rename 'ReportComments', 'ReportComments_Old'
```

### L?i: Connection string

**Nguyên nhân:** appsettings.json không có connection string ?úng

**Gi?i pháp:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=HaNoiCleanDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  }
}
```

## Seed Data (Optional)

N?u mu?n t?o d? li?u m?u:

```csharp
// Trong ApplicationDbContext.cs - OnModelCreating
protected override void OnModelCreating(ModelBuilder builder)
{
    base.OnModelCreating(builder);

    // Seed sample comments (ch? cho development)
    if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
    {
        builder.Entity<ReportComment>().HasData(
            new ReportComment
            {
                Id = 1,
                ReportId = 1,
                UserId = "sample-user-id",
                Content = "Test comment",
                CreatedAt = DateTime.Now
            }
        );
    }
}
```

## Sau khi Migration thành công

? Ki?m tra b?ng ReportComments ?ã ???c t?o
? Test các API endpoints
? Ki?m tra Foreign Keys ho?t ??ng
? Test upload ?nh
? Test phân quy?n (user ch? s?a/xóa comment c?a mình)

---

**L?u ý quan tr?ng:**
- Luôn backup database tr??c khi ch?y migration trên production
- Test k? trên môi tr??ng development tr??c
- Ki?m tra indexes ?ã ???c t?o ?? t?i ?u performance
