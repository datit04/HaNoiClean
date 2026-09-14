# Report Progress API - Quick Reference

## ?? T?t c? API ??u yêu c?u ??ng nh?p và ch? xem ???c báo cáo c?a chính mình

## Endpoints

| Method | Endpoint | Mô t? | Use Case |
|--------|----------|-------|----------|
| GET | `/api/reports/{id}/progress` | L?ch s? ti?n trình c?a 1 báo cáo | Chi ti?t timeline |
| GET | `/api/reports/{id}/current-status` | Tr?ng thái hi?n t?i c?a 1 báo cáo | Status badge |
| GET | `/api/reports/my-progress` | T?t c? ti?n trình c?a user | Feed c?p nh?t |
| GET | `/api/reports/my-current-statuses` | Tr?ng thái c?a t?t c? báo cáo | Dashboard |

## Tr?ng thái báo cáo

| Code | Tên | Ti?ng Vi?t |
|------|-----|------------|
| 0 | Submitted | ?ã g?i |
| 1 | Received | ?ã ti?p nh?n |
| 2 | InProgress | ?ang x? lý |
| 3 | Completed | Hoàn thành |
| 4 | Rejected | T? ch?i |

## Quick Example

```javascript
// Headers c?n thi?t
const headers = {
  'Authorization': `Bearer ${token}`
};

// Dashboard: L?y tr?ng thái t?t c? báo cáo
const statuses = await fetch('/api/reports/my-current-statuses', { headers })
  .then(r => r.json());

// Chi ti?t: L?y timeline c?a m?t báo cáo
const progress = await fetch(`/api/reports/${reportId}/progress`, { headers })
  .then(r => r.json());
```

## Response Format

```json
{
  "id": 1,
  "reportId": 123,
  "status": 2,
  "statusName": "?ang x? lý",
  "note": "??i ?ã ???c giao nhi?m v?",
  "description": "Chi ti?t...",
  "imageAfterUrl": "https://...",
  "updatedBy": "user123",
  "updatedByName": "Nguy?n V?n A",
  "updatedAt": "2024-01-16T10:30:00"
}
```

## ?? Error Codes

- `401` - Ch?a ??ng nh?p
- `403` - Báo cáo không ph?i c?a b?n
- `404` - Không tìm th?y báo cáo

---

?? **Chi ti?t ??y ??:** Xem file `ReportProgressAPI.md`
