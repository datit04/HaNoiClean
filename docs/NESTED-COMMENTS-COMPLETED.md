# ?? NESTED COMMENTS FEATURE - COMPLETED!

## ? ?ã hoàn thành tính n?ng Reply/Nested Comments

### ?? Quick Summary

H? th?ng Comments gi? ?ã h? tr? **nested replies** (comment cha-con) v?i ?? sâu không gi?i h?n!

---

## ?? Database Changes

### Migration Applied
```
? 20260505093448_AddParentCommentIdToReportComments
```

### New Fields in ReportComments Table
- **ParentCommentId** (bigint, nullable) - Foreign Key t? tham chi?u
- **Foreign Key Constraint** to ReportComments(Id)
- **Index** on ParentCommentId

---

## ?? API Changes

### GET Comments - New Query Parameter
```
GET /api/reports/{reportId}/comments?includeReplies=true
```

**Parameters:**
- `includeReplies=true` (default) ? Nested structure (replies bên trong)
- `includeReplies=false` ? Flat structure (t?t c? ? level 1)

### POST Comments - New Field
```
POST /api/reports/{reportId}/comments

FormData:
  Content: "Reply content"
  ParentCommentId: 1  ? M?I! (nullable)
  Image: file (optional)
```

---

## ?? Response Structure

### Nested (includeReplies=true)
```json
[
  {
    "id": 1,
    "content": "Root comment",
    "parentCommentId": null,
    "repliesCount": 2,
    "replies": [
      {
        "id": 2,
        "content": "Reply to root",
        "parentCommentId": 1,
        "repliesCount": 1,
        "replies": [
          {
            "id": 4,
            "content": "Reply to reply",
            "parentCommentId": 2,
            "repliesCount": 0,
            "replies": null
          }
        ]
      },
      {
        "id": 3,
        "content": "Another reply",
        "parentCommentId": 1,
        "repliesCount": 0,
        "replies": null
      }
    ]
  }
]
```

### Flat (includeReplies=false)
```json
[
  { "id": 1, "parentCommentId": null, "repliesCount": 2 },
  { "id": 2, "parentCommentId": 1, "repliesCount": 1 },
  { "id": 3, "parentCommentId": 1, "repliesCount": 0 },
  { "id": 4, "parentCommentId": 2, "repliesCount": 0 }
]
```

---

## ?? Frontend Quick Start

### React Example

```jsx
function CommentItem({ comment, onReply }) {
  const [showReply, setShowReply] = useState(false);

  return (
    <div className="comment">
      <p>{comment.content}</p>

      <button onClick={() => setShowReply(!showReply)}>
        ?? Reply ({comment.repliesCount})
      </button>

      {showReply && (
        <ReplyForm onSubmit={(content) => onReply(content, comment.id)} />
      )}

      {/* Recursive rendering */}
      {comment.replies?.map(reply => (
        <div key={reply.id} className="nested-reply">
          <CommentItem comment={reply} onReply={onReply} />
        </div>
      ))}
    </div>
  );
}

// Usage
function CommentThread({ reportId }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetch(`/api/reports/${reportId}/comments?includeReplies=true`)
      .then(r => r.json())
      .then(setComments);
  }, [reportId]);

  async function handleReply(content, parentCommentId) {
    const formData = new FormData();
    formData.append('Content', content);
    formData.append('ParentCommentId', parentCommentId);

    await fetch(`/api/reports/${reportId}/comments`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    // Refetch
    const updated = await fetch(`/api/reports/${reportId}/comments?includeReplies=true`)
      .then(r => r.json());
    setComments(updated);
  }

  return (
    <div>
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} onReply={handleReply} />
      ))}
    </div>
  );
}
```

### CSS for Nesting
```css
.comment {
  border-left: 2px solid #e5e7eb;
  padding-left: 12px;
  margin-bottom: 12px;
}

.nested-reply {
  margin-left: 24px;
  margin-top: 8px;
}
```

---

## ? Testing

### Test 1: Create Root Comment
```bash
curl -X POST "https://localhost:7xxx/api/reports/1/comments" \
  -H "Authorization: Bearer TOKEN" \
  -F "Content=Root comment"
```

### Test 2: Create Reply
```bash
curl -X POST "https://localhost:7xxx/api/reports/1/comments" \
  -H "Authorization: Bearer TOKEN" \
  -F "Content=This is a reply" \
  -F "ParentCommentId=1"
```

### Test 3: Get Nested Comments
```bash
curl "https://localhost:7xxx/api/reports/1/comments?includeReplies=true"
```

### Test 4: Get Flat Comments
```bash
curl "https://localhost:7xxx/api/reports/1/comments?includeReplies=false"
```

---

## ?? Documentation

- **Full Guide**: [CommentsAPI-NestedReplies.md](CommentsAPI-NestedReplies.md)
- **Main API Docs**: [CommentsAPI.md](CommentsAPI.md)
- **Quick Ref**: [CommentsAPI-QuickRef.md](CommentsAPI-QuickRef.md)

---

## ?? Use Cases

### 1. Customer Support Thread
```
User: "Khi nào x? lý xong?"
  ?? Staff: "2 ngày n?a ?"
    ?? User: "Ok, c?m ?n!"
```

### 2. Discussion
```
User 1: "Khu này rác nhi?u quá"
  ?? Staff: "S? ki?m tra"
  ?? User 2: "?úng v?y"
  ?? Team: "?ang x? lý"
```

### 3. Additional Info
```
Staff: "C?n thêm hình ?nh"
  ?? User: [uploads image]
```

---

## ?? Security & Validation

? ParentCommentId validation:
- Must exist in database
- Must belong to same report
- Returns 404 if not found
- Returns 400 if different report

? Cascade behavior:
- Deleting parent ? deletes all replies
- Proper foreign key constraints

---

## ?? Performance

### Nested Mode (includeReplies=true)
- **Pros**: One query, easy to render
- **Cons**: Larger response if many replies
- **Best for**: < 100 total comments

### Flat Mode (includeReplies=false)
- **Pros**: Smaller response, can paginate
- **Cons**: Frontend builds tree
- **Best for**: Many comments, lazy loading

---

## ? What's New

| Feature | Before | After |
|---------|--------|-------|
| Structure | Flat only | Nested + Flat |
| Reply support | ? | ? |
| ParentCommentId | ? | ? |
| RepliesCount | ? | ? |
| Recursive depth | N/A | Unlimited |
| Query param | None | `includeReplies` |

---

## ?? Status

- ? Entity updated
- ? Migration applied
- ? Controller updated
- ? ViewModels updated
- ? Build successful
- ? Documentation complete
- ? Ready for Frontend

---

**Happy coding! ??**

Gi? Frontend có th? build m?t comment system ??y ?? v?i nested replies!
