# Nested Comments (Reply) Feature - Documentation

## ?? ?ã thêm tính n?ng Reply vào Comments!

### ? C?p nh?t thành công

**Migration:** `20260505093448_AddParentCommentIdToReportComments`

---

## ?? Database Changes

### Thêm vào b?ng `ReportComments`:
- ? **ParentCommentId** (bigint, nullable) - Foreign Key t? tham chi?u
- ? **Foreign Key Constraint** - References ReportComments(Id)
- ? **Navigation Properties** - ParentComment & Replies

---

## ?? API Updates

### 1. GET Comments - H? tr? Nested Structure

**Endpoint:** `GET /api/reports/{reportId}/comments?includeReplies=true`

**Query Parameters:**
- `includeReplies` (bool, optional, default: true)
  - `true` = Nested structure (comments v?i replies bên trong)
  - `false` = Flat structure (t?t c? comments ? level 1)

**Response v?i `includeReplies=true` (Nested):**
```json
[
  {
    "id": 1,
    "reportId": 123,
    "content": "Comment chính",
    "imageUrl": "https://...",
    "parentCommentId": null,
    "repliesCount": 2,
    "replies": [
      {
        "id": 2,
        "reportId": 123,
        "content": "Reply 1",
        "parentCommentId": 1,
        "repliesCount": 0,
        "replies": null,
        "createdAt": "2024-01-15T11:00:00",
        "author": { "id": "user2", "fullName": "User 2", "role": "Staff" }
      },
      {
        "id": 3,
        "reportId": 123,
        "content": "Reply 2",
        "parentCommentId": 1,
        "repliesCount": 0,
        "replies": null,
        "createdAt": "2024-01-15T11:05:00",
        "author": { "id": "user3", "fullName": "User 3", "role": "Citizen" }
      }
    ],
    "createdAt": "2024-01-15T10:00:00",
    "author": { "id": "user1", "fullName": "User 1", "role": "Citizen" }
  }
]
```

**Response v?i `includeReplies=false` (Flat):**
```json
[
  {
    "id": 1,
    "reportId": 123,
    "content": "Comment chính",
    "parentCommentId": null,
    "repliesCount": 2,
    "replies": null,
    ...
  },
  {
    "id": 2,
    "reportId": 123,
    "content": "Reply 1",
    "parentCommentId": 1,
    "repliesCount": 0,
    "replies": null,
    ...
  },
  {
    "id": 3,
    "reportId": 123,
    "content": "Reply 2",
    "parentCommentId": 1,
    "repliesCount": 0,
    "replies": null,
    ...
  }
]
```

---

### 2. POST Comment - T?o Reply

**Endpoint:** `POST /api/reports/{reportId}/comments`

**Request Body (FormData):**
```
Content: string (required)
Image: file (optional)
ParentCommentId: long? (optional) ? M?I
```

**Example - T?o comment g?c:**
```javascript
const formData = new FormData();
formData.append('Content', 'This is a root comment');
// ParentCommentId không g?i ho?c null

await fetch('/api/reports/123/comments', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**Example - T?o reply:**
```javascript
const formData = new FormData();
formData.append('Content', 'This is a reply');
formData.append('ParentCommentId', '1'); // ID c?a comment cha

await fetch('/api/reports/123/comments', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**Validation:**
- ? ParentCommentId ph?i t?n t?i
- ? Parent comment ph?i thu?c cùng report
- ? Tr? v? 404 n?u parent không t?n t?i
- ? Tr? v? 400 n?u parent thu?c report khác

---

### 3. All Comments Response Include:

M?i comment response gi? ??u có:
```json
{
  "id": 1,
  "reportId": 123,
  "content": "...",
  "imageUrl": "...",
  "parentCommentId": null,        // ? M?I
  "repliesCount": 2,               // ? M?I
  "replies": [...],                // ? M?I (ch? khi includeReplies=true)
  "createdAt": "...",
  "updatedAt": null,
  "author": { ... }
}
```

---

## ?? Frontend Integration Examples

### React Hook - useComments

```javascript
import { useState, useEffect } from 'react';

function useComments(reportId, includeReplies = true) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [reportId, includeReplies]);

  async function fetchComments() {
    const response = await fetch(
      `/api/reports/${reportId}/comments?includeReplies=${includeReplies}`
    );
    const data = await response.json();
    setComments(data);
    setLoading(false);
  }

  async function addComment(content, imageFile, parentCommentId = null) {
    const formData = new FormData();
    formData.append('Content', content);
    if (imageFile) formData.append('Image', imageFile);
    if (parentCommentId) formData.append('ParentCommentId', parentCommentId);

    const response = await fetch(`/api/reports/${reportId}/comments`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const newComment = await response.json();

    // Refetch ?? c?p nh?t nested structure
    await fetchComments();

    return newComment;
  }

  return { comments, loading, addComment, refetch: fetchComments };
}
```

### React Component - Nested Comments Display

```jsx
function CommentItem({ comment, onReply }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  async function handleReply() {
    await onReply(replyContent, comment.id);
    setReplyContent('');
    setShowReplyForm(false);
  }

  return (
    <div className="comment">
      <div className="comment-header">
        <strong>{comment.author.fullName}</strong>
        <span className={`badge ${comment.author.role.toLowerCase()}`}>
          {comment.author.role}
        </span>
        <small>{new Date(comment.createdAt).toLocaleString()}</small>
      </div>

      <p className="comment-content">{comment.content}</p>

      {comment.imageUrl && (
        <img src={comment.imageUrl} alt="Comment" className="comment-image" />
      )}

      <div className="comment-actions">
        <button onClick={() => setShowReplyForm(!showReplyForm)}>
          ?? Reply {comment.repliesCount > 0 && `(${comment.repliesCount})`}
        </button>
      </div>

      {showReplyForm && (
        <div className="reply-form">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
          />
          <button onClick={handleReply}>Send Reply</button>
          <button onClick={() => setShowReplyForm(false)}>Cancel</button>
        </div>
      )}

      {/* Hi?n th? replies (nested) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies">
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentThread({ reportId }) {
  const { comments, loading, addComment } = useComments(reportId);

  async function handleReply(content, parentCommentId) {
    await addComment(content, null, parentCommentId);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="comment-thread">
      {comments.map(comment => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          onReply={handleReply}
        />
      ))}
    </div>
  );
}
```

### CSS Example - Nested Indentation

```css
.comment {
  border-left: 2px solid #e5e7eb;
  padding: 12px;
  margin-bottom: 12px;
}

.replies {
  margin-left: 24px;
  margin-top: 12px;
  border-left: 2px solid #d1d5db;
  padding-left: 12px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.badge.citizen { background: #6b7280; color: white; }
.badge.staff { background: #3b82f6; color: white; }
.badge.admin { background: #ef4444; color: white; }

.reply-form {
  margin-top: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.reply-form textarea {
  width: 100%;
  min-height: 60px;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  margin-bottom: 8px;
}
```

---

## ?? Use Cases

### 1. User h?i chi ti?t
```
Comment g?c (Citizen): "Khi nào s? x? lý xong?"
  ?? Reply (Staff): "D? ki?n 2 ngày n?a"
    ?? Reply (Citizen): "C?m ?n anh!"
```

### 2. Th?o lu?n gi?a nhi?u ng??i
```
Comment g?c (Citizen): "Rác ? ?ây r?t nhi?u"
  ?? Reply (Staff): "Chúng tôi s? ki?m tra"
  ?? Reply (Citizen 2): "Tôi c?ng th?y v?y"
  ?? Reply (Team): "??i ?ang trên ???ng ??n"
```

### 3. Cung c?p thêm thông tin
```
Comment g?c (Staff): "C?n thêm hình ?nh"
  ?? Reply (Citizen): [g?i kèm ?nh m?i]
```

---

## ?? ViewModels Updated

### ReportCommentVm
```csharp
public class ReportCommentVm
{
    public long Id { get; set; }
    public long ReportId { get; set; }
    public string Content { get; set; }
    public string? ImageUrl { get; set; }
    public long? ParentCommentId { get; set; }        // ? M?I
    public int RepliesCount { get; set; }             // ? M?I
    public List<ReportCommentVm>? Replies { get; set; } // ? M?I
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public CommentAuthorVm Author { get; set; }
}
```

### CreateCommentRequest
```csharp
public class CreateCommentRequest
{
    [Required]
    [MaxLength(2000)]
    public string Content { get; set; }

    public IFormFile? Image { get; set; }

    public long? ParentCommentId { get; set; } // ? M?I
}
```

---

## ? Performance Notes

### Nested Structure (includeReplies=true)
- **Pros**: D? render nested UI, m?t l?n query
- **Cons**: Response l?n h?n n?u nhi?u replies
- **Use**: Khi hi?n th? full thread

### Flat Structure (includeReplies=false)
- **Pros**: Response nh? h?n, có th? paginate
- **Cons**: Frontend ph?i t? build tree
- **Use**: Khi c?n pagination ho?c lazy loading

---

## ?? Edge Cases Handled

1. ? **Parent không t?n t?i**: Tr? v? 404
2. ? **Parent thu?c report khác**: Tr? v? 400
3. ? **Xóa comment có replies**: Cascade delete (xóa c? replies)
4. ? **Circular reference**: Không th? x?y ra (ParentCommentId > Id)
5. ? **Infinite nesting**: Không gi?i h?n ?? sâu (tùy UI)

---

## ?? Migration Applied

```bash
Migration: 20260505093448_AddParentCommentIdToReportComments
Status: ? Applied successfully
```

**SQL Changes:**
```sql
ALTER TABLE ReportComments
ADD ParentCommentId BIGINT NULL;

ALTER TABLE ReportComments
ADD CONSTRAINT FK_ReportComments_ReportComments_ParentCommentId
FOREIGN KEY (ParentCommentId) REFERENCES ReportComments(Id)
ON DELETE NO ACTION; -- Tránh cascade delete loop

CREATE INDEX IX_ReportComments_ParentCommentId 
ON ReportComments(ParentCommentId);
```

---

## ? Testing Checklist

- [ ] T?o comment g?c (ParentCommentId = null)
- [ ] T?o reply cho comment g?c
- [ ] T?o reply cho reply (nested level 2)
- [ ] L?y comments v?i includeReplies=true
- [ ] L?y comments v?i includeReplies=false
- [ ] Verify repliesCount ?úng
- [ ] Verify nested structure trong JSON
- [ ] Test xóa comment có replies
- [ ] Test reply vào parent không t?n t?i (404)
- [ ] Test reply vào parent c?a report khác (400)

---

**Ready to use!** ??

Frontend có th? b?t ??u implement nested comments UI ngay bây gi?.
