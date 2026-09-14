# Comments API - Quick Reference

## ?? Authentication
- ??c: ? Không c?n
- T?o/S?a/Xóa: ? Yêu c?u ??ng nh?p

## Endpoints

| Method | Endpoint | Auth | Mô t? |
|--------|----------|------|-------|
| GET | `/api/reports/{id}/comments` | ? | Danh sách comments |
| POST | `/api/reports/{id}/comments` | ? | T?o comment m?i |
| GET | `/api/comments/{id}` | ? | Chi ti?t comment |
| PUT | `/api/comments/{id}` | ? | S?a comment (ch? ng??i t?o) |
| DELETE | `/api/comments/{id}` | ? | Xóa comment (ng??i t?o + Admin) |
| GET | `/api/reports/{id}/comments/count` | ? | S? l??ng comments |

## Request/Response Format

### GET Comments
```javascript
// Request
GET /api/reports/123/comments

// Response
[
  {
    "id": 1,
    "reportId": 123,
    "content": "Câu h?i c?a tôi...",
    "imageUrl": "https://...",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": null,
    "author": {
      "id": "user123",
      "fullName": "Nguy?n V?n A",
      "role": "Citizen"
    }
  }
]
```

### POST Comment
```javascript
// Request
const formData = new FormData();
formData.append('Content', 'N?i dung comment');
formData.append('Image', imageFile); // Optional

POST /api/reports/123/comments
Content-Type: multipart/form-data
Authorization: Bearer {token}

// Response: Comment object (same as GET)
```

### PUT Comment
```javascript
// Request
const formData = new FormData();
formData.append('Content', 'N?i dung ?ã s?a');

PUT /api/comments/1
Content-Type: multipart/form-data
Authorization: Bearer {token}

// Response: Updated comment object
```

### DELETE Comment
```javascript
// Request
DELETE /api/comments/1
Authorization: Bearer {token}

// Response: 200 OK (empty)
```

## Roles

| Role | Màu badge | Quy?n |
|------|-----------|-------|
| Citizen | Xám (#6B7280) | Comment, s?a/xóa c?a mình |
| Staff | Xanh (#3B82F6) | Comment, s?a/xóa c?a mình |
| Team | Xanh lá (#10B981) | Comment, s?a/xóa c?a mình |
| Admin | ?? (#EF4444) | Comment, xóa m?i comment |

## Quick Code Examples

### React Hook
```javascript
import { useState, useEffect } from 'react';

function useComments(reportId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reports/${reportId}/comments`)
      .then(r => r.json())
      .then(data => {
        setComments(data);
        setLoading(false);
      });
  }, [reportId]);

  const addComment = async (content, imageFile) => {
    const formData = new FormData();
    formData.append('Content', content);
    if (imageFile) formData.append('Image', imageFile);

    const response = await fetch(`/api/reports/${reportId}/comments`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const newComment = await response.json();
    setComments([...comments, newComment]);
  };

  return { comments, loading, addComment };
}
```

### Simple Display
```jsx
function CommentList({ reportId }) {
  const { comments } = useComments(reportId);

  return (
    <div>
      {comments.map(c => (
        <div key={c.id} className="border-b py-2">
          <div className="flex items-center gap-2">
            <span className="font-bold">{c.author.fullName}</span>
            <span className={`badge-${c.author.role.toLowerCase()}`}>
              {c.author.role}
            </span>
          </div>
          <p>{c.content}</p>
          {c.imageUrl && <img src={c.imageUrl} className="mt-2" />}
        </div>
      ))}
    </div>
  );
}
```

## Error Codes

- `400` - Content quá dài ho?c invalid
- `401` - Ch?a ??ng nh?p
- `403` - Không có quy?n s?a/xóa
- `404` - Không tìm th?y comment/report

## Database Migration

Ch?y l?nh sau ?? t?o b?ng:

```bash
cd src/KnowledgeSpace.BackendServer
dotnet ef migrations add AddReportComments
dotnet ef database update
```

---

?? **Chi ti?t ??y ??:** Xem `CommentsAPI.md`
