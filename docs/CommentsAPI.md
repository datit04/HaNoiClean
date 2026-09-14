# Comments API Documentation

## Mô t?
API h? th?ng bình lu?n cho phép ng??i dùng và cán b? trao ??i, ph?n h?i v? các báo cáo môi tr??ng.

## Endpoints

### 1. L?y t?t c? comments c?a m?t báo cáo
**Endpoint:** `GET /api/reports/{reportId}/comments`

**Authorization:** Không yêu c?u (AllowAnonymous)

**Parameters:**
- `reportId` (long, required): ID c?a báo cáo

**Response:** Danh sách comments ???c s?p x?p theo th?i gian (c? nh?t ? m?i nh?t)
```json
[
  {
    "id": 1,
    "reportId": 123,
    "content": "Khu v?c này rác ?ã ???c d?n d?p ch?a ??",
    "imageUrl": "https://example.com/comments/img1.jpg",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": null,
    "author": {
      "id": "user123",
      "fullName": "Nguy?n V?n A",
      "role": "Citizen"
    }
  },
  {
    "id": 2,
    "reportId": 123,
    "content": "Chúng tôi ?ang x? lý, d? ki?n hoàn thành trong ngày hôm nay.",
    "imageUrl": null,
    "createdAt": "2024-01-15T11:00:00",
    "updatedAt": null,
    "author": {
      "id": "staff456",
      "fullName": "Tr?n Th? B",
      "role": "Staff"
    }
  }
]
```

**Status Codes:**
- 200 OK: Tr? v? danh sách comments (có th? r?ng)
- 404 Not Found: Không tìm th?y báo cáo

---

### 2. T?o comment m?i
**Endpoint:** `POST /api/reports/{reportId}/comments`

**Authorization:** ? Yêu c?u ??ng nh?p

**Content-Type:** `multipart/form-data`

**Parameters:**
- `reportId` (long, required): ID c?a báo cáo

**Request Body:**
```
Content: string (required, max 2000 chars) - N?i dung comment
Image: file (optional) - ?nh ?ính kèm
```

**Response:** Comment v?a t?o
```json
{
  "id": 3,
  "reportId": 123,
  "content": "C?m ?n anh ?ã ph?n h?i!",
  "imageUrl": null,
  "createdAt": "2024-01-15T11:05:00",
  "updatedAt": null,
  "author": {
    "id": "user123",
    "fullName": "Nguy?n V?n A",
    "role": "Citizen"
  }
}
```

**Status Codes:**
- 201 Created: T?o comment thành công
- 400 Bad Request: D? li?u không h?p l?
- 401 Unauthorized: Ch?a ??ng nh?p
- 404 Not Found: Không tìm th?y báo cáo

**Validation:**
- Content: b?t bu?c, t?i ?a 2000 ký t?
- Image: tùy ch?n, ??nh d?ng jpg/png/gif

---

### 3. L?y thông tin m?t comment
**Endpoint:** `GET /api/comments/{commentId}`

**Authorization:** Không yêu c?u (AllowAnonymous)

**Parameters:**
- `commentId` (long, required): ID c?a comment

**Response:**
```json
{
  "id": 1,
  "reportId": 123,
  "content": "Khu v?c này rác ?ã ???c d?n d?p ch?a ??",
  "imageUrl": "https://example.com/comments/img1.jpg",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": null,
  "author": {
    "id": "user123",
    "fullName": "Nguy?n V?n A",
    "role": "Citizen"
  }
}
```

**Status Codes:**
- 200 OK: Tr? v? comment
- 404 Not Found: Không tìm th?y comment

---

### 4. C?p nh?t comment
**Endpoint:** `PUT /api/comments/{commentId}`

**Authorization:** ? Yêu c?u ??ng nh?p. Ch? ng??i t?o comment m?i ???c s?a.

**Content-Type:** `multipart/form-data`

**Parameters:**
- `commentId` (long, required): ID c?a comment

**Request Body:**
```
Content: string (required, max 2000 chars) - N?i dung m?i
Image: file (optional) - ?nh m?i (n?u có)
```

**Response:** Comment ?ã c?p nh?t
```json
{
  "id": 1,
  "reportId": 123,
  "content": "Khu v?c này rác ?ã ???c d?n d?p ch?a ?? (?ã s?a)",
  "imageUrl": "https://example.com/comments/img1_new.jpg",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T14:00:00",
  "author": {
    "id": "user123",
    "fullName": "Nguy?n V?n A",
    "role": "Citizen"
  }
}
```

**Status Codes:**
- 200 OK: C?p nh?t thành công
- 400 Bad Request: D? li?u không h?p l?
- 401 Unauthorized: Ch?a ??ng nh?p
- 403 Forbidden: Không ph?i ng??i t?o comment
- 404 Not Found: Không tìm th?y comment

---

### 5. Xóa comment
**Endpoint:** `DELETE /api/comments/{commentId}`

**Authorization:** ? Yêu c?u ??ng nh?p. Ng??i t?o ho?c Admin m?i ???c xóa.

**Parameters:**
- `commentId` (long, required): ID c?a comment

**Response:** 200 OK (empty body)

**Status Codes:**
- 200 OK: Xóa thành công
- 401 Unauthorized: Ch?a ??ng nh?p
- 403 Forbidden: Không có quy?n xóa
- 404 Not Found: Không tìm th?y comment

---

### 6. L?y s? l??ng comments c?a báo cáo
**Endpoint:** `GET /api/reports/{reportId}/comments/count`

**Authorization:** Không yêu c?u (AllowAnonymous)

**Parameters:**
- `reportId` (long, required): ID c?a báo cáo

**Response:**
```json
{
  "reportId": 123,
  "count": 5
}
```

**Status Codes:**
- 200 OK: Tr? v? s? l??ng comments

---

## Models

### ReportCommentVm
| Field | Type | Description |
|-------|------|-------------|
| id | long | ID c?a comment |
| reportId | long | ID báo cáo |
| content | string | N?i dung comment |
| imageUrl | string? | URL ?nh ?ính kèm (n?u có) |
| createdAt | DateTime | Th?i gian t?o |
| updatedAt | DateTime? | Th?i gian s?a (n?u có) |
| author | CommentAuthorVm | Thông tin ng??i comment |

### CommentAuthorVm
| Field | Type | Description |
|-------|------|-------------|
| id | string | User ID |
| fullName | string | Tên ??y ?? |
| role | string | "Citizen", "Staff", "Team", "Admin" |

---

## User Roles

| Role | Màu badge ?? xu?t | Quy?n h?n |
|------|------------------|-----------|
| Citizen | Xám | Comment, s?a/xóa comment c?a mình |
| Staff | Xanh d??ng | Comment, s?a/xóa comment c?a mình |
| Team | Xanh lá | Comment, s?a/xóa comment c?a mình |
| Admin | ?? | Comment, s?a/xóa m?i comment |

---

## Use Cases

### 1. Ng??i dân h?i v? ti?n ??
```javascript
const formData = new FormData();
formData.append('Content', 'Khi nào s? x? lý xong ??');

await fetch(`/api/reports/123/comments`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### 2. Cán b? tr? l?i
```javascript
const formData = new FormData();
formData.append('Content', 'D? ki?n hoàn thành trong 2 ngày');

await fetch(`/api/reports/123/comments`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### 3. Ng??i dân g?i ?nh b? sung
```javascript
const formData = new FormData();
formData.append('Content', 'Tình tr?ng hi?n t?i nh? trong ?nh');
formData.append('Image', imageFile);

await fetch(`/api/reports/123/comments`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### 4. Hi?n th? comment thread
```javascript
const comments = await fetch(`/api/reports/123/comments`)
  .then(r => r.json());

comments.forEach(comment => {
  console.log(`[${comment.author.role}] ${comment.author.fullName}: ${comment.content}`);
});
```

### 5. S?a comment c?a mình
```javascript
const formData = new FormData();
formData.append('Content', 'N?i dung ?ã s?a');

await fetch(`/api/comments/1`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### 6. Xóa comment
```javascript
await fetch(`/api/comments/1`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Security Notes

- ? T?t c? API t?o/s?a/xóa ??u yêu c?u authentication
- ? User ch? s?a/xóa ???c comment c?a chính mình
- ? Admin có quy?n xóa m?i comment
- ? ??c comment không c?n ??ng nh?p (public)
- ? Image upload ???c validate extension và size
- ? Content ???c validate max length 2000 chars

---

## Database Schema

```sql
CREATE TABLE ReportComments (
    Id BIGINT PRIMARY KEY IDENTITY,
    ReportId BIGINT NOT NULL FOREIGN KEY REFERENCES Reports(Id),
    UserId VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES AspNetUsers(Id),
    Content NVARCHAR(2000) NOT NULL,
    ImageUrl NVARCHAR(500) NULL,
    CreatedAt DATETIME NOT NULL,
    UpdatedAt DATETIME NULL
);

CREATE INDEX IX_ReportComments_ReportId ON ReportComments(ReportId);
CREATE INDEX IX_ReportComments_UserId ON ReportComments(UserId);
CREATE INDEX IX_ReportComments_CreatedAt ON ReportComments(CreatedAt);
```

---

## Frontend Integration Example (React)

```jsx
import { useState, useEffect } from 'react';

function CommentThread({ reportId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchComments();
  }, [reportId]);

  async function fetchComments() {
    const response = await fetch(`/api/reports/${reportId}/comments`);
    const data = await response.json();
    setComments(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('Content', newComment);

    await fetch(`/api/reports/${reportId}/comments`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    setNewComment('');
    fetchComments(); // Reload comments
  }

  return (
    <div className="comment-thread">
      {comments.map(comment => (
        <div key={comment.id} className="comment">
          <div className="comment-header">
            <strong>{comment.author.fullName}</strong>
            <span className={`role-badge ${comment.author.role.toLowerCase()}`}>
              {comment.author.role}
            </span>
            <small>{new Date(comment.createdAt).toLocaleString()}</small>
          </div>
          <p>{comment.content}</p>
          {comment.imageUrl && <img src={comment.imageUrl} alt="Comment" />}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <textarea 
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Vi?t bình lu?n..."
          maxLength={2000}
        />
        <button type="submit">G?i</button>
      </form>
    </div>
  );
}
```

---

## Performance Tips

1. **Pagination** - N?u comments nhi?u, thêm paging vào API:
   ```
   GET /api/reports/{reportId}/comments?pageIndex=1&pageSize=20
   ```

2. **Real-time** - S? d?ng SignalR ?? push comments m?i real-time:
   ```csharp
   await _hubContext.Clients.Group($"report-{reportId}")
       .SendAsync("NewComment", commentVm);
   ```

3. **Caching** - Cache danh sách comments trong vài phút
4. **Lazy loading** - Load comments khi user click "Xem bình lu?n"

---

?? **Chi ti?t entity:** Xem `src/KnowledgeSpace.BackendServer/Data/Entities/ReportComment.cs`
