# ?? Comments System - Backend Implementation Summary

## ? ?ã hoàn thành

### 1. Database Layer
- ? **Entity**: `ReportComment.cs` - Ch?a c?u trúc d? li?u comment
- ? **DbContext**: ?ã thêm `DbSet<ReportComment>` vào ApplicationDbContext
- ? **Relationships**: Foreign Keys ??n Reports và Users

### 2. ViewModels Layer
- ? **ReportCommentVm.cs** - ViewModel cho response
- ? **CommentAuthorVm.cs** - Thông tin ng??i comment
- ? **CreateCommentRequest.cs** - Request model cho t?o comment
- ? **UpdateCommentRequest.cs** - Request model cho s?a comment

### 3. API Layer
- ? **CommentsController.cs** - 6 endpoints:
  - `GET /api/reports/{id}/comments` - L?y danh sách
  - `POST /api/reports/{id}/comments` - T?o m?i
  - `GET /api/comments/{id}` - L?y chi ti?t
  - `PUT /api/comments/{id}` - C?p nh?t
  - `DELETE /api/comments/{id}` - Xóa
  - `GET /api/reports/{id}/comments/count` - ??m s? l??ng

### 4. Business Logic
- ? Authentication & Authorization
- ? Image upload support (multipart/form-data)
- ? Role-based access control
- ? Validation (max 2000 chars)
- ? Ownership check (user ch? s?a/xóa c?a mình)
- ? Admin override (admin xóa ???c m?i comment)

### 5. Documentation
- ? `CommentsAPI.md` - Tài li?u ??y ??
- ? `CommentsAPI-QuickRef.md` - Quick reference
- ? `CommentsAPI-Migration.md` - H??ng d?n migration

## ?? Files Created/Modified

### Created (7 files)
```
src/KnowledgeSpace.BackendServer/
??? Data/Entities/ReportComment.cs
??? Controllers/CommentsController.cs

src/KnowledgeSpace.ViewModels/
??? Contents/
    ??? ReportCommentVm.cs
    ??? CommentRequests.cs

docs/
??? CommentsAPI.md
??? CommentsAPI-QuickRef.md
??? CommentsAPI-Migration.md
```

### Modified (1 file)
```
src/KnowledgeSpace.BackendServer/
??? Data/ApplicationDbContext.cs (added DbSet<ReportComment>)
```

## ?? Next Steps - C?n làm ngay

### 1. Database Migration (B?T BU?C)
```bash
cd src/KnowledgeSpace.BackendServer
dotnet ef migrations add AddReportCommentsTable
dotnet ef database update
```

### 2. Test API
- S? d?ng Postman/Swagger ?? test
- Ki?m tra authentication
- Ki?m tra upload ?nh
- Ki?m tra permissions

### 3. Frontend Integration
Xem plan chi ti?t ? memory file ?? implement:
- `commentService.js`
- `useComments.js` hook
- `CommentForm.jsx` component
- `CommentItem.jsx` component
- `CommentThread.jsx` component
- Tích h?p vào 3 màn hình (Map, Citizen, Staff)

## ?? API Contract cho Frontend

### Headers
```javascript
const headers = {
  'Authorization': `Bearer ${token}` // Ch? c?n cho POST/PUT/DELETE
};
```

### L?y comments
```javascript
const comments = await fetch(`/api/reports/${reportId}/comments`)
  .then(r => r.json());
// Tr? v?: ReportCommentVm[]
```

### T?o comment
```javascript
const formData = new FormData();
formData.append('Content', content);
if (imageFile) formData.append('Image', imageFile);

const newComment = await fetch(`/api/reports/${reportId}/comments`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
}).then(r => r.json());
// Tr? v?: ReportCommentVm
```

### S?a comment
```javascript
const formData = new FormData();
formData.append('Content', newContent);

const updated = await fetch(`/api/comments/${commentId}`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
}).then(r => r.json());
// Tr? v?: ReportCommentVm
```

### Xóa comment
```javascript
await fetch(`/api/comments/${commentId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});
// Tr? v?: 200 OK
```

## ?? Security Features

### Authentication
- ? ??c comments: Public (không c?n ??ng nh?p)
- ? T?o/S?a/Xóa: Yêu c?u ??ng nh?p (Bearer token)

### Authorization
- ? User ch? s?a/xóa comment c?a chính mình
- ? Admin có th? xóa m?i comment
- ? Tr? v? 403 Forbidden n?u không có quy?n

### Validation
- ? Content: Required, max 2000 characters
- ? Image: Optional, file upload validation
- ? ReportId: Must exist
- ? CommentId: Must exist

### Data Protection
- ? Foreign key constraints
- ? Cascade delete (khi xóa report ? xóa comments)
- ? SQL injection protection (Entity Framework)
- ? XSS protection (frontend c?n sanitize)

## ?? Database Schema

```sql
ReportComments
??? Id (PK, bigint, identity)
??? ReportId (FK ? Reports.Id)
??? UserId (FK ? AspNetUsers.Id)
??? Content (nvarchar(2000), required)
??? ImageUrl (nvarchar(500), nullable)
??? CreatedAt (datetime, required)
??? UpdatedAt (datetime, nullable)

Indexes:
- IX_ReportComments_ReportId
- IX_ReportComments_UserId
```

## ?? User Roles & Colors

| Role | Badge Color | Hex |
|------|-------------|-----|
| Citizen | Gray | #6B7280 |
| Staff | Blue | #3B82F6 |
| Team | Green | #10B981 |
| Admin | Red | #EF4444 |

## ?? Performance Considerations

### Current Implementation
- ? Indexes on ReportId, UserId
- ? Eager loading with `.Include()`
- ? Batch role lookup (GetUserRolesAsync)

### Future Optimizations (n?u c?n)
- Pagination (khi comments > 50)
- Caching (Redis)
- SignalR for real-time updates
- Lazy loading images
- Virtual scrolling

## ?? Known Limitations

1. **No Pagination**: T?t c? comments ???c load cùng lúc
   - **Impact**: Có th? ch?m n?u > 100 comments
   - **Solution**: Thêm paging sau n?u c?n

2. **No Nested Comments**: Không h? tr? reply (thread)
   - **Impact**: T?t c? comments ? level 1
   - **Solution**: Thêm ParentCommentId n?u c?n thread

3. **No Edit History**: Không l?u l?ch s? s?a
   - **Impact**: Ch? th?y UpdatedAt, không bi?t n?i dung c?
   - **Solution**: Thêm CommentHistory table n?u c?n audit

4. **No Reactions**: Không có like/dislike
   - **Impact**: Ng??i dùng không th? react
   - **Solution**: Thêm CommentReactions table

## ?? Testing Checklist

### Unit Tests (tùy ch?n)
- [ ] CreateComment with valid data
- [ ] CreateComment with invalid data (validation)
- [ ] UpdateComment by owner
- [ ] UpdateComment by non-owner (should fail)
- [ ] DeleteComment by owner
- [ ] DeleteComment by admin
- [ ] DeleteComment by non-owner (should fail)

### Integration Tests
- [ ] GET comments for existing report
- [ ] GET comments for non-existent report (404)
- [ ] POST comment without auth (401)
- [ ] POST comment with auth (201)
- [ ] PUT comment ownership check
- [ ] DELETE comment ownership check
- [ ] Image upload functionality

### Manual Tests
- [ ] T?o comment t? Postman
- [ ] Upload ?nh kèm comment
- [ ] S?a comment c?a mình
- [ ] Không s?a ???c comment ng??i khác
- [ ] Admin xóa ???c m?i comment
- [ ] Role hi?n th? ?úng (Citizen, Staff, Admin)

## ?? Deployment Checklist

- [ ] Run migration trên dev database
- [ ] Test t?t c? endpoints
- [ ] Ki?m tra indexes
- [ ] Verify foreign keys
- [ ] Test image upload
- [ ] Check permissions
- [ ] Review security
- [ ] Update API documentation
- [ ] Thông báo Frontend team
- [ ] Run migration trên staging
- [ ] Final test trên staging
- [ ] Run migration trên production

## ?? Contact & Support

N?u g?p v?n ??:
1. Ki?m tra docs: `CommentsAPI.md`
2. Ki?m tra migration: `CommentsAPI-Migration.md`
3. Xem quick ref: `CommentsAPI-QuickRef.md`
4. Debug controller: breakpoint t?i CommentsController

## ?? Success Criteria

H? th?ng ???c coi là hoàn thành khi:
- ? Migration ch?y thành công
- ? T?t c? 6 endpoints ho?t ??ng
- ? Authentication/Authorization ?úng
- ? Upload ?nh thành công
- ? Roles hi?n th? chính xác
- ? Frontend tích h?p thành công
- ? User có th? t?o/s?a/xóa comment
- ? Real users test và hài lòng

---

**Build Status:** ? Build successful

**Ready for:** ?? Database Migration ? ?? Testing ? ?? Frontend Integration
