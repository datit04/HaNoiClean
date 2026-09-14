# Report Progress API Documentation

## Mô t?
API này cung c?p các endpoints ?? l?y thông tin v? ti?n trình x? lý báo cáo (ReportProgress). **T?t c? các API ??u yêu c?u ??ng nh?p và ch? cho phép user xem ti?n trình c?a các báo cáo mà h? ?ã t?o.**

## Endpoints

### 1. L?y toàn b? l?ch s? ti?n trình c?a m?t báo cáo
**Endpoint:** `GET /api/reports/{id}/progress`

**Mô t?:** L?y t?t c? các b?n ghi ti?n trình c?a m?t báo cáo, ???c s?p x?p theo th?i gian t? c? ??n m?i.

**Authorization:** ? Yêu c?u ??ng nh?p. User ch? xem ???c ti?n trình c?a báo cáo do chính h? t?o.

**Parameters:**
- `id` (long, required): ID c?a báo cáo

**Response:** Danh sách các ??i t??ng ReportProgressVm
```json
[
  {
    "id": 1,
    "reportId": 123,
    "status": 0,
    "statusName": "?ã g?i",
    "note": "Báo cáo ?ã ???c g?i",
    "description": null,
    "imageAfterUrl": null,
    "updatedBy": "user123",
    "updatedByName": "Nguy?n V?n A",
    "updatedAt": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "reportId": 123,
    "status": 1,
    "statusName": "?ã ti?p nh?n",
    "note": "Báo cáo ?ã ti?p nh?n",
    "description": "S? x? lý trong vòng 24h",
    "imageAfterUrl": null,
    "updatedBy": "admin456",
    "updatedByName": "Tr?n Th? B",
    "updatedAt": "2024-01-15T14:20:00"
  }
]
```

**Status Codes:**
- 200 OK: Tr? v? danh sách ti?n trình thành công
- 401 Unauthorized: Ch?a ??ng nh?p
- 403 Forbidden: Báo cáo không thu?c v? user hi?n t?i
- 404 Not Found: Không tìm th?y báo cáo v?i ID ?ã cho

---

### 2. L?y tr?ng thái hi?n t?i c?a m?t báo cáo
**Endpoint:** `GET /api/reports/{id}/current-status`

**Mô t?:** L?y thông tin ti?n trình m?i nh?t (tr?ng thái hi?n t?i) c?a m?t báo cáo.

**Authorization:** ? Yêu c?u ??ng nh?p. User ch? xem ???c tr?ng thái c?a báo cáo do chính h? t?o.

**Parameters:**
- `id` (long, required): ID c?a báo cáo

**Response:** ??i t??ng ReportProgressVm
```json
{
  "id": 5,
  "reportId": 123,
  "status": 3,
  "statusName": "Hoàn thành",
  "note": "Báo cáo ?ã hoàn thành",
  "description": "?ã thu gom rác t?i v? trí",
  "imageAfterUrl": "https://example.com/uploads/reports/after_123.jpg",
  "updatedBy": "team789",
  "updatedByName": "??i v? sinh s? 5",
  "updatedAt": "2024-01-16T09:15:00"
}
```

**Status Codes:**
- 200 OK: Tr? v? tr?ng thái hi?n t?i thành công
- 401 Unauthorized: Ch?a ??ng nh?p
- 403 Forbidden: Báo cáo không thu?c v? user hi?n t?i
- 404 Not Found: Không tìm th?y báo cáo ho?c ch?a có ti?n trình nào

---

### 3. L?y t?t c? ti?n trình c?a các báo cáo c?a user ??
**Endpoint:** `GET /api/reports/my-progress`

**Mô t?:** L?y t?t c? các b?n ghi ti?n trình c?a T?T C? các báo cáo mà user hi?n t?i ?ã t?o. K?t qu? ???c s?p x?p theo th?i gian m?i nh?t tr??c.

**Authorization:** ? Yêu c?u ??ng nh?p

**Response:** Danh sách các ??i t??ng ReportProgressVm
```json
[
  {
    "id": 10,
    "reportId": 125,
    "status": 2,
    "statusName": "?ang x? lý",
    "note": "??i ?ã ???c giao nhi?m v?",
    "description": "??i v? sinh s? 3 ?ang x? lý",
    "imageAfterUrl": null,
    "updatedBy": "admin456",
    "updatedByName": "Tr?n Th? B",
    "updatedAt": "2024-01-16T11:00:00"
  },
  {
    "id": 5,
    "reportId": 123,
    "status": 3,
    "statusName": "Hoàn thành",
    "note": "Báo cáo ?ã hoàn thành",
    "description": "?ã thu gom rác",
    "imageAfterUrl": "https://example.com/uploads/reports/after_123.jpg",
    "updatedBy": "team789",
    "updatedByName": "??i v? sinh s? 5",
    "updatedAt": "2024-01-16T09:15:00"
  }
]
```

**Status Codes:**
- 200 OK: Tr? v? danh sách ti?n trình thành công (có th? là m?ng r?ng n?u ch?a có báo cáo nào)
- 401 Unauthorized: Ch?a ??ng nh?p

**Use Case:** Hi?n th? timeline t?ng h?p t?t c? ho?t ??ng c?a các báo cáo c?a user.

---

### 4. L?y tr?ng thái hi?n t?i c?a t?t c? báo cáo c?a user ??
**Endpoint:** `GET /api/reports/my-current-statuses`

**Mô t?:** L?y tr?ng thái m?i nh?t c?a t?ng báo cáo mà user hi?n t?i ?ã t?o. Tr? v? m?t m?ng v?i m?i ph?n t? là tr?ng thái hi?n t?i c?a m?t báo cáo.

**Authorization:** ? Yêu c?u ??ng nh?p

**Response:** Danh sách các ??i t??ng ReportProgressVm (m?t cho m?i báo cáo)
```json
[
  {
    "id": 10,
    "reportId": 125,
    "status": 2,
    "statusName": "?ang x? lý",
    "note": "??i ?ã ???c giao nhi?m v?",
    "description": "??i v? sinh s? 3 ?ang x? lý",
    "imageAfterUrl": null,
    "updatedBy": "admin456",
    "updatedByName": "Tr?n Th? B",
    "updatedAt": "2024-01-16T11:00:00"
  },
  {
    "id": 5,
    "reportId": 123,
    "status": 3,
    "statusName": "Hoàn thành",
    "note": "Báo cáo ?ã hoàn thành",
    "description": "?ã thu gom rác",
    "imageAfterUrl": "https://example.com/uploads/reports/after_123.jpg",
    "updatedBy": "team789",
    "updatedByName": "??i v? sinh s? 5",
    "updatedAt": "2024-01-16T09:15:00"
  }
]
```

**Status Codes:**
- 200 OK: Tr? v? danh sách tr?ng thái thành công (có th? là m?ng r?ng n?u ch?a có báo cáo nào)
- 401 Unauthorized: Ch?a ??ng nh?p

**Use Case:** Hi?n th? t?ng quan tr?ng thái c?a t?t c? báo cáo c?a user - r?t h?u ích cho dashboard.

---

## Các tr?ng thái báo cáo (ReportStatus)

| Giá tr? | Tên enum | Tên hi?n th? | Mô t? |
|---------|----------|--------------|-------|
| 0 | Submitted | ?ã g?i | Báo cáo v?a ???c t?o m?i |
| 1 | Received | ?ã ti?p nh?n | Báo cáo ?ã ???c ti?p nh?n b?i qu?n tr? viên |
| 2 | InProgress | ?ang x? lý | Báo cáo ?ang ???c ??i ng? x? lý |
| 3 | Completed | Hoàn thành | Báo cáo ?ã ???c x? lý xong |
| 4 | Rejected | T? ch?i | Báo cáo b? t? ch?i |

---

## ReportProgressVm Model

| Thu?c tính | Ki?u d? li?u | Mô t? |
|------------|--------------|-------|
| id | long | ID c?a b?n ghi ti?n trình |
| reportId | long | ID c?a báo cáo |
| status | int | Mã tr?ng thái (0-4) |
| statusName | string | Tên tr?ng thái b?ng ti?ng Vi?t |
| note | string | Ghi chú ng?n v? ti?n trình |
| description | string | Mô t? chi ti?t (n?u có) |
| imageAfterUrl | string | URL hình ?nh sau khi x? lý (n?u có) |
| updatedBy | string | ID ng??i c?p nh?t |
| updatedByName | string | Tên ng??i c?p nh?t |
| updatedAt | DateTime | Th?i gian c?p nh?t |

---

## Ví d? s? d?ng

### JavaScript/TypeScript

```javascript
// Headers v?i token authentication
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};

// 1. L?y toàn b? l?ch s? ti?n trình c?a m?t báo cáo c? th?
async function getReportProgress(reportId) {
  const response = await fetch(`/api/reports/${reportId}/progress`, { headers });
  if (response.ok) {
    const progressList = await response.json();
    console.log('L?ch s? ti?n trình:', progressList);
  } else if (response.status === 403) {
    console.error('B?n không có quy?n xem báo cáo này');
  }
}

// 2. L?y tr?ng thái hi?n t?i c?a m?t báo cáo c? th?
async function getCurrentStatus(reportId) {
  const response = await fetch(`/api/reports/${reportId}/current-status`, { headers });
  if (response.ok) {
    const currentStatus = await response.json();
    console.log(`Tr?ng thái hi?n t?i: ${currentStatus.statusName}`);
    console.log(`C?p nh?t b?i: ${currentStatus.updatedByName}`);
    console.log(`Vào lúc: ${new Date(currentStatus.updatedAt).toLocaleString()}`);
  }
}

// 3. L?y t?t c? ti?n trình c?a các báo cáo c?a user ??
async function getAllMyProgress() {
  const response = await fetch('/api/reports/my-progress', { headers });
  if (response.ok) {
    const allProgress = await response.json();
    console.log(`T?ng s? c?p nh?t: ${allProgress.length}`);
    allProgress.forEach(p => {
      console.log(`[${p.reportId}] ${p.statusName} - ${p.note}`);
    });
  }
}

// 4. L?y tr?ng thái hi?n t?i c?a t?t c? báo cáo ??
async function getAllMyCurrentStatuses() {
  const response = await fetch('/api/reports/my-current-statuses', { headers });
  if (response.ok) {
    const statuses = await response.json();
    console.log('Tr?ng thái các báo cáo c?a tôi:');
    statuses.forEach(s => {
      console.log(`Báo cáo #${s.reportId}: ${s.statusName}`);
    });
  }
}
```

### React Component Examples

#### 1. Component hi?n th? danh sách báo cáo v?i tr?ng thái
```jsx
import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth'; // Hook ?? l?y token

function MyReportsList() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // L?y danh sách báo cáo
        const reportsRes = await fetch('/api/reports/my', { headers });
        const reportsData = await reportsRes.json();
        setReports(reportsData);

        // L?y tr?ng thái hi?n t?i c?a t?t c? báo cáo
        const statusesRes = await fetch('/api/reports/my-current-statuses', { headers });
        const statusesData = await statusesRes.json();

        // Chuy?n thành object v?i key là reportId ?? d? tra c?u
        const statusesMap = {};
        statusesData.forEach(status => {
          statusesMap[status.reportId] = status;
        });
        setStatuses(statusesMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchData();
    }
  }, [token]);

  if (loading) return <div>?ang t?i...</div>;

  return (
    <div className="my-reports-list">
      <h2>Báo cáo c?a tôi</h2>
      {reports.map((report) => {
        const status = statuses[report.id];
        return (
          <div key={report.id} className="report-card">
            <img src={report.imageUrl} alt="Report" />
            <div className="report-info">
              <h3>{report.category?.name}</h3>
              <p>{report.description}</p>
              {status && (
                <div className="status-badge">
                  <span className={`badge status-${status.status}`}>
                    {status.statusName}
                  </span>
                  <small>
                    C?p nh?t: {new Date(status.updatedAt).toLocaleDateString('vi-VN')}
                  </small>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

#### 2. Component hi?n th? timeline ti?n trình c?a m?t báo cáo
```jsx
import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';

function ReportProgressTimeline({ reportId }) {
  const { token } = useAuth();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
        };

        const response = await fetch(`/api/reports/${reportId}/progress`, { headers });

        if (response.status === 403) {
          setError('B?n không có quy?n xem báo cáo này');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch progress');
        }

        const data = await response.json();
        setProgress(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (token && reportId) {
      fetchProgress();
    }
  }, [token, reportId]);

  if (loading) return <div>?ang t?i...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="progress-timeline">
      <h3>L?ch s? ti?n trình</h3>
      {progress.map((item, index) => (
        <div key={item.id} className={`timeline-item ${index === progress.length - 1 ? 'current' : ''}`}>
          <div className="timeline-marker">
            <div className={`marker-dot status-${item.status}`}></div>
            {index < progress.length - 1 && <div className="marker-line"></div>}
          </div>
          <div className="timeline-content">
            <div className="timeline-header">
              <strong className={`status-label status-${item.status}`}>
                {item.statusName}
              </strong>
              <small className="timeline-date">
                {new Date(item.updatedAt).toLocaleString('vi-VN')}
              </small>
            </div>
            <p className="timeline-note">{item.note}</p>
            {item.description && (
              <p className="timeline-description">{item.description}</p>
            )}
            {item.imageAfterUrl && (
              <img 
                src={item.imageAfterUrl} 
                alt="Hình ?nh sau x? lý" 
                className="timeline-image"
              />
            )}
            <small className="timeline-updater">
              C?p nh?t b?i: {item.updatedByName || item.updatedBy}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### 3. Component dashboard t?ng quan
```jsx
import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';

function MyReportsDashboard() {
  const { token } = useAuth();
  const [currentStatuses, setCurrentStatuses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
        };

        const response = await fetch('/api/reports/my-current-statuses', { headers });
        const data = await response.json();
        setCurrentStatuses(data);

        // Tính toán th?ng kê
        const newStats = {
          total: data.length,
          submitted: data.filter(s => s.status === 0).length,
          received: data.filter(s => s.status === 1).length,
          inProgress: data.filter(s => s.status === 2).length,
          completed: data.filter(s => s.status === 3).length,
          rejected: data.filter(s => s.status === 4).length
        };
        setStats(newStats);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    if (token) {
      fetchData();
    }
  }, [token]);

  return (
    <div className="dashboard">
      <h2>T?ng quan báo cáo c?a tôi</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.total}</h3>
          <p>T?ng báo cáo</p>
        </div>
        <div className="stat-card status-0">
          <h3>{stats.submitted}</h3>
          <p>?ã g?i</p>
        </div>
        <div className="stat-card status-1">
          <h3>{stats.received}</h3>
          <p>?ã ti?p nh?n</p>
        </div>
        <div className="stat-card status-2">
          <h3>{stats.inProgress}</h3>
          <p>?ang x? lý</p>
        </div>
        <div className="stat-card status-3">
          <h3>{stats.completed}</h3>
          <p>Hoàn thành</p>
        </div>
        <div className="stat-card status-4">
          <h3>{stats.rejected}</h3>
          <p>T? ch?i</p>
        </div>
      </div>

      <div className="recent-updates">
        <h3>C?p nh?t g?n ?ây</h3>
        {currentStatuses
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 5)
          .map((status) => (
            <div key={status.id} className="update-item">
              <span className={`badge status-${status.status}`}>
                {status.statusName}
              </span>
              <span className="report-id">Báo cáo #{status.reportId}</span>
              <span className="update-note">{status.note}</span>
              <span className="update-time">
                {new Date(status.updatedAt).toLocaleString('vi-VN')}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

export default MyReportsDashboard;
```

---

## Ghi chú quan tr?ng

### Authentication & Authorization
- ? **T?T C? các endpoints ??u yêu c?u ??ng nh?p** (tr? API public n?u có)
- ? User ch? có th? xem ti?n trình c?a các báo cáo do chính h? t?o
- ? N?u c? g?ng truy c?p báo cáo c?a ng??i khác ? Status 403 Forbidden
- ? N?u ch?a ??ng nh?p ? Status 401 Unauthorized

### Cách g?i request v?i authentication
S? d?ng Bearer token trong header:
```
Authorization: Bearer {your_access_token}
```

### Use Cases ph? bi?n

| Use Case | API phù h?p | Lý do |
|----------|-------------|-------|
| Xem chi ti?t ti?n trình 1 báo cáo | `GET /api/reports/{id}/progress` | L?y toàn b? l?ch s? |
| Hi?n th? status badge c?a 1 báo cáo | `GET /api/reports/{id}/current-status` | Ch? c?n tr?ng thái m?i nh?t |
| Dashboard t?ng quan | `GET /api/reports/my-current-statuses` | Xem tr?ng thái t?t c? báo cáo cùng lúc |
| Feed/Timeline c?p nh?t | `GET /api/reports/my-progress` | Xem t?t c? ho?t ??ng m?i nh?t |
| Danh sách báo cáo + tr?ng thái | `GET /api/reports/my` + `GET /api/reports/my-current-statuses` | K?t h?p 2 API |

### Tips t?i ?u hi?u su?t
1. **Tránh g?i API progress cho t?ng báo cáo riêng l?** - S? d?ng `my-current-statuses` ?? l?y hàng lo?t
2. **Cache k?t qu?** - Tr?ng thái không thay ??i th??ng xuyên, có th? cache trong 1-2 phút
3. **S? d?ng WebSocket/SignalR** - ?? nh?n c?p nh?t real-time thay vì poll API liên t?c

### Recommended API Flow cho Frontend

```javascript
// Khi vào trang "Báo cáo c?a tôi"
async function loadMyReportsPage() {
  const [reports, statuses] = await Promise.all([
    fetch('/api/reports/my'),
    fetch('/api/reports/my-current-statuses')
  ]);

  // Hi?n th? danh sách báo cáo v?i tr?ng thái
  displayReportsList(reports, statuses);
}

// Khi click vào m?t báo cáo ?? xem chi ti?t
async function loadReportDetail(reportId) {
  const [report, progress] = await Promise.all([
    fetch(`/api/reports/${reportId}`),
    fetch(`/api/reports/${reportId}/progress`)
  ]);

  // Hi?n th? chi ti?t báo cáo v?i timeline ??y ??
  displayReportDetail(report, progress);
}

// Dashboard - ch? c?n statuses
async function loadDashboard() {
  const statuses = await fetch('/api/reports/my-current-statuses');

  // Tính toán và hi?n th? th?ng kê
  displayDashboard(statuses);
}
```
