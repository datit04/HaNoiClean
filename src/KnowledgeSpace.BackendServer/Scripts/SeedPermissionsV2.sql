-- ============================================
-- Seed bang Permissions + AspNetRoleClaims
-- Database: HaNoiClean
-- ============================================

-- 1. Tao bang Permissions (neu chua co)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Permissions')
BEGIN
    CREATE TABLE Permissions (
        Id VARCHAR(100) NOT NULL PRIMARY KEY,
        Description NVARCHAR(200) NULL,
        [Group] NVARCHAR(50) NULL
    );
END

-- 2. Them danh sach Permissions
INSERT INTO Permissions (Id, Description, [Group])
SELECT p.Id, p.Description, p.[Group]
FROM (VALUES
    ('Users.View',           N'Xem danh sach nguoi dung',       'Users'),
    ('Users.Create',         N'Tao nguoi dung moi',             'Users'),
    ('Users.Update',         N'Cap nhat nguoi dung',            'Users'),
    ('Users.Delete',         N'Xoa nguoi dung',                 'Users'),
    ('Roles.View',           N'Xem danh sach vai tro',          'Roles'),
    ('Roles.Create',         N'Tao vai tro moi',                'Roles'),
    ('Roles.Update',         N'Cap nhat vai tro',               'Roles'),
    ('Roles.Delete',         N'Xoa vai tro',                    'Roles'),
    ('Reports.Create',       N'Tao bao cao',                    'Reports'),
    ('Reports.View',         N'Xem bao cao',                    'Reports'),
    ('Reports.UpdateStatus', N'Cap nhat trang thai bao cao',    'Reports'),
    ('Reports.Assign',       N'Giao bao cao cho doi',           'Reports'),
    ('Reports.Delete',       N'Xoa bao cao',                    'Reports'),
    ('Categories.Create',    N'Tao danh muc',                   'Categories'),
    ('Categories.Update',    N'Cap nhat danh muc',              'Categories'),
    ('Categories.Delete',    N'Xoa danh muc',                   'Categories'),
    ('Wards.Create',         N'Tao phuong/xa',                  'Wards'),
    ('Wards.Update',         N'Cap nhat phuong/xa',             'Wards'),
    ('Wards.Delete',         N'Xoa phuong/xa',                  'Wards'),
    ('Teams.Create',         N'Tao doi',                        'Teams'),
    ('Teams.Update',         N'Cap nhat doi',                   'Teams'),
    ('Teams.Delete',         N'Xoa doi',                        'Teams'),
    ('TrashBins.Create',     N'Tao thung rac',                  'TrashBins'),
    ('TrashBins.Update',     N'Cap nhat thung rac',             'TrashBins'),
    ('TrashBins.Delete',     N'Xoa thung rac',                  'TrashBins'),
    ('GreenPoints.Add',      N'Them diem xanh',                 'GreenPoints'),
    ('Permissions.View',     N'Xem danh sach quyen',            'Permissions'),
    ('Permissions.Create',   N'Tao quyen moi',                  'Permissions'),
    ('Permissions.Update',   N'Cap nhat/gan quyen',             'Permissions'),
    ('Permissions.Delete',   N'Xoa quyen',                      'Permissions')
) AS p(Id, Description, [Group])
WHERE NOT EXISTS (SELECT 1 FROM Permissions WHERE Permissions.Id = p.Id);

-- ============================================
-- RoleId trong DB:
-- Admin:      5F1E6773-72F7-4F8F-967F-2B2107E37C74
-- User:       6C515A5E-5384-4B19-9BD8-8635630790CE
-- Collector:  7568F89C-394B-4385-B315-38F6D2C5C9AA
-- WardLeader: B18CF7C2-F0E1-4A9B-8AC3-009C2120CFF2
-- Moderator:  C839BFE9-3AFE-4ECE-B5F6-7F323454723C
-- ============================================

-- 3. Admin: tat ca permissions
INSERT INTO AspNetRoleClaims (RoleId, ClaimType, ClaimValue)
SELECT '5F1E6773-72F7-4F8F-967F-2B2107E37C74', 'permission', p.Id
FROM Permissions p
WHERE NOT EXISTS (
    SELECT 1 FROM AspNetRoleClaims
    WHERE RoleId = '5F1E6773-72F7-4F8F-967F-2B2107E37C74'
      AND ClaimType = 'permission' AND ClaimValue = p.Id
);

-- 4. User: quyen co ban
INSERT INTO AspNetRoleClaims (RoleId, ClaimType, ClaimValue)
SELECT '6C515A5E-5384-4B19-9BD8-8635630790CE', 'permission', p.Id
FROM (VALUES ('Reports.Create'), ('Reports.View')) AS p(Id)
WHERE NOT EXISTS (
    SELECT 1 FROM AspNetRoleClaims
    WHERE RoleId = '6C515A5E-5384-4B19-9BD8-8635630790CE'
      AND ClaimType = 'permission' AND ClaimValue = p.Id
);

-- 5. Kiem tra
SELECT p.Id, p.[Group], p.Description,
       STUFF((SELECT ', ' + r.Name
              FROM AspNetRoleClaims rc
              JOIN AspNetRoles r ON r.Id = rc.RoleId
              WHERE rc.ClaimType = 'permission' AND rc.ClaimValue = p.Id
              FOR XML PATH('')), 1, 2, '') AS AssignedRoles
FROM Permissions p
ORDER BY p.[Group], p.Id;
