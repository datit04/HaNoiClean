# ?? Comments System Backend - HOÀN THÀNH!

## ? T?t c? ?ã s?n sàng! (?ã c?p nh?t: Nested Replies)

Backend cho h? th?ng Comments ?ã ???c implement ??y ?? và build thành công.

## ?? **NEW! Nested Comments (Reply Feature)**

? **?ã thêm tính n?ng Reply vào comments!**
- ParentCommentId field
- Nested structure support
- Recursive replies (không gi?i h?n ?? sâu)

?? **Chi ti?t:** Xem [CommentsAPI-NestedReplies.md](CommentsAPI-NestedReplies.md)

---

## ?? Migrations ?ã ch?y:

### Migration 1: T?o b?ng ReportComments
```bash
? 20260505084155_AddReportCommentsTable
```

### Migration 2: Thêm ParentCommentId (Nested Replies)
```bash
? 20260505093448_AddParentCommentIdToReportComments
```

---

## ?? API Endpoints (6 endpoints)

| Method | Endpoint | Auth | Features |
|--------|----------|------|----------|
| GET | `/api/reports/{id}/comments?includeReplies=true` | ? | L?y comments (nested/flat) ?? |
| POST | `/api/reports/{id}/comments` | ? | T?o comment/reply ?? |
| GET | `/api/comments/{id}` | ? | Chi ti?t comment |
| PUT | `/api/comments/{id}` | ? | S?a comment |
| DELETE | `/api/comments/{id}` | ? | Xóa comment |
| GET | `/api/reports/{id}/comments/count` | ? | ??m s? l??ng |

---

## ?? Nested Comments Example

### Request v?i Nested Structure
```javascript
// L?y comments v?i replies bên trong
const comments = await fetch('/api/reports/123/comments?includeReplies=true')
  .then(r => r.json());

// Response:
[
  {
    "id": 1,
    "content": "Comment chính",
    "parentCommentId": null,
    "repliesCount": 2,
    "replies": [
      {
        "id": 2,
        "content": "Reply 1",
        "parentCommentId": 1,
        "repliesCount": 0
      },
      {
        "id": 3,
        "content": "Reply 2",
        "parentCommentId": 1,
        "repliesCount": 1,
        "replies": [...]
      }
    ]
  }
]
```

### T?o Reply
```javascript
const formData = new FormData();
formData.append('Content', 'This is a reply');
formData.append('ParentCommentId', '1'); // ? Reply to comment #1

await fetch('/api/reports/123/comments', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

## ?? Files ?ã t?o/c?p nh?t

```
Backend:
??? src/KnowledgeSpace.BackendServer/
?   ??? Data/Entities/ReportComment.cs ? (Updated: ParentCommentId)
?   ??? Controllers/CommentsController.cs ? (Updated: Nested logic)
??? src/KnowledgeSpace.ViewModels/Contents/
?   ??? ReportCommentVm.cs ? (Updated: Replies fields)
?   ??? CommentRequests.cs ? (Updated: ParentCommentId)
??? src/KnowledgeSpace.BackendServer/Data/
    ??? ApplicationDbContext.cs ?

Documentation:
??? docs/CommentsAPI.md ?
??? docs/CommentsAPI-QuickRef.md ?
??? docs/CommentsAPI-Migration.md ?
??? docs/CommentsAPI-NestedReplies.md ? ??
??? docs/CommentsSystem-BackendSummary.md ?

Migrations:
??? 20260505084155_AddReportCommentsTable.cs ?
??? 20260505093448_AddParentCommentIdToReportComments.cs ? ??
```

## ?? API Endpoints (6 endpoints)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/reports/{id}/comments` | ? |
| POST | `/api/reports/{id}/comments` | ? |
| GET | `/api/comments/{id}` | ? |
| PUT | `/api/comments/{id}` | ? |
| DELETE | `/api/comments/{id}` | ? |
| GET | `/api/reports/{id}/comments/count` | ? |

## ?? Security

- ? Authentication required cho t?o/s?a/xóa
- ? User ch? s?a/xóa comment c?a mình
- ? Admin xóa ???c m?i comment
- ? Public read (không c?n auth)

## ?? Features

- ? Comment v?i text (max 2000 chars)
- ? Upload ?nh kèm comment
- ? Hi?n th? role (Citizen/Staff/Team/Admin)
- ? Edit comment v?i UpdatedAt timestamp
- ? Soft validation & error handling
- ? RESTful API design

## ?? Frontend Contract

```javascript
// L?y comments
const comments = await fetch('/api/reports/123/comments')
  .then(r => r.json());

// T?o comment
const formData = new FormData();
formData.append('Content', 'My comment');
formData.append('Image', imageFile);

await fetch('/api/reports/123/comments', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

## ?? Documentation

- **Full docs**: [CommentsAPI.md](CommentsAPI.md)
- **Quick ref**: [CommentsAPI-QuickRef.md](CommentsAPI-QuickRef.md)
- **Migration guide**: [CommentsAPI-Migration.md](CommentsAPI-Migration.md)
- **Summary**: [CommentsSystem-BackendSummary.md](CommentsSystem-BackendSummary.md)

## ? Quick Start

```bash
# 1. Migration
cd src/KnowledgeSpace.BackendServer
dotnet ef migrations add AddReportCommentsTable
dotnet ef database update

# 2. Run app
dotnet run

# 3. Test
# M? https://localhost:7xxx/swagger
# Th? GET /api/reports/{id}/comments
```

## ?? Troubleshooting

**L?i migration?** ? Xem [CommentsAPI-Migration.md](CommentsAPI-Migration.md)

**API không ho?t ??ng?** ? Ki?m tra:
1. Database ?ã migrate ch?a?
2. Bearer token có ?úng không?
3. ReportId có t?n t?i không?

**Upload ?nh b? l?i?** ? Ki?m tra:
1. Content-Type: multipart/form-data
2. Field name: "Image" (vi?t hoa I)
3. File size < limit

## ?? Success!

Build successful ?  
All endpoints ready ?  
Documentation complete ?  
Ready for frontend integration ?  

---

**Làm migration ngay bây gi? ?? b?t ??u s? d?ng!** ??
