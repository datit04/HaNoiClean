# BÁO CÁO ĐỒ ÁN TỐT NGHIỆP

**Ngành:** Kỹ Thuật Phần Mềm

**Đề tài:** XÂY DỰNG HỆ THỐNG WEBSITE HỖ TRỢ QUẢN LÝ ĐÔ THỊ VÀ BÁO CÁO MÔI TRƯỜNG TRỰC TUYẾN (HANOI CLEANCITY)

---

## LỜI CẢM ƠN

Trong suốt quá trình học tập tại trường, chúng em đã được trang bị nền tảng kiến thức vững chắc để hoàn thành đồ án tốt nghiệp *"Xây dựng hệ thống website hỗ trợ quản lý đô thị và báo cáo môi trường trực tuyến – Hanoi CleanCity"*.

Chúng em xin chân thành cảm ơn các thầy cô đã tận tình giảng dạy và hướng dẫn trong suốt quá trình thực hiện đề tài. Những nhận xét và định hướng của thầy cô đã giúp chúng em có cái nhìn rõ ràng hơn trong việc triển khai các nội dung nghiên cứu và phát triển sản phẩm.

---

## MỤC LỤC

1. [Mở đầu](#mở-đầu)
2. [Chương 1 – Tổng quan hệ thống](#chương-1)
3. [Chương 2 – Phân tích thiết kế hệ thống](#chương-2)
4. [Chương 3 – Kết quả thực nghiệm và đánh giá](#chương-3)
5. [Kết luận](#kết-luận)

---

## DANH MỤC TỪ VIẾT TẮT

| STT | Viết tắt | Tiếng Anh | Nghĩa tiếng Việt |
|-----|----------|-----------|-----------------|
| 1 | HTML | HyperText Markup Language | Ngôn ngữ đánh dấu siêu văn bản |
| 2 | CSS | Cascading Style Sheets | Mô tả cách hiển thị tài liệu HTML |
| 3 | UI/UX | User Interface / User Experience | Giao diện / Trải nghiệm người dùng |
| 4 | ReactJS | React JavaScript Library | Thư viện JavaScript xây dựng giao diện |
| 5 | ASP.NET | Active Server Pages .NET | Framework phát triển web của Microsoft |
| 6 | JWT | JSON Web Token | Token xác thực dạng JSON |
| 7 | API | Application Programming Interface | Giao diện lập trình ứng dụng |
| 8 | RESTful | Representational State Transfer | Kiến trúc truyền tải trạng thái |
| 9 | UC | Use Case | Ca sử dụng |
| 10 | UML | Unified Modeling Language | Ngôn ngữ mô hình hóa thống nhất |
| 11 | GIS | Geographic Information System | Hệ thống thông tin địa lý |
| 12 | DOM | Document Object Model | Mô hình đối tượng tài liệu |
| 13 | NPM | Node Package Manager | Trình quản lý gói Node.js |
| 14 | SPA | Single Page Application | Ứng dụng trang đơn |
| 15 | i18n | Internationalization | Đa ngôn ngữ hóa |

---

## MỞ ĐẦU

### 1. Lý do chọn đề tài

Trong bối cảnh đô thị hoá diễn ra mạnh mẽ, các thành phố lớn như Hà Nội đang phải đối mặt với nhiều vấn đề môi trường ngày càng nghiêm trọng: rác thải tràn lan, hạ tầng xuống cấp, đèn đường hỏng, vỉa hè lấn chiếm. Trong khi đó, cơ chế tiếp nhận và xử lý phản ánh từ người dân hiện nay vẫn còn rất thủ công, thiếu minh bạch và kém hiệu quả.

Nhận thấy những bất cập đó, dự án **Hanoi CleanCity** được thực hiện nhằm xây dựng một nền tảng trực tuyến giúp người dân dễ dàng báo cáo các vấn đề môi trường trong vòng 30 giây, đồng thời hỗ trợ cán bộ đô thị quản lý, phân công và theo dõi tiến độ xử lý một cách khoa học, hiệu quả và minh bạch.

### 2. Mục tiêu của dự án

- Xây dựng hệ thống website cho phép người dân báo cáo các sự cố môi trường kèm hình ảnh, vị trí địa lý trực quan trên bản đồ.
- Cung cấp công cụ quản lý báo cáo cho cán bộ: phân loại, phân công đội xử lý, cập nhật trạng thái theo quy trình.
- Hệ thống điểm xanh (Green Points) khuyến khích người dân tham gia tích cực.
- Đảm bảo bảo mật với JWT, phân quyền theo vai trò.
- Giao diện hiện đại, hỗ trợ đa ngôn ngữ (Tiếng Việt / Tiếng Anh).

### 3. Ý nghĩa của dự án

Dự án không chỉ giải quyết bài toán thực tiễn về quản lý đô thị mà còn tạo ra kênh kết nối trực tiếp, minh bạch giữa người dân và chính quyền địa phương. Hệ thống góp phần nâng cao ý thức cộng đồng, chuyên nghiệp hoá quy trình xử lý sự cố và hướng tới mục tiêu đô thị thông minh bền vững.

### 4. Phương pháp thực hiện

- **Thu thập và phân tích yêu cầu:** Khảo sát thực trạng báo cáo môi trường, nghiên cứu các hệ thống tương tự.
- **Phân tích và thiết kế hệ thống:** Sử dụng UML (Use Case, Sequence, Class Diagram) và thiết kế CSDL quan hệ.
- **Lập trình thực nghiệm:** Frontend với ReactJS + Vite + TailwindCSS; Backend với ASP.NET Core; bản đồ với Leaflet/OpenStreetMap.
- **Kiểm thử và đánh giá:** Kiểm thử chức năng các luồng nghiệp vụ chính, đánh giá UI/UX.

### 5. Đối tượng nghiên cứu

- **Hệ thống:** Website quản lý đô thị và báo cáo môi trường Hanoi CleanCity.
- **Các chức năng trọng tâm:**
  - *Người dân:* Gửi báo cáo, xem bản đồ thực tế, theo dõi trạng thái báo cáo, tích luỹ điểm xanh.
  - *Cán bộ đô thị:* Dashboard thống kê, quản lý báo cáo, phân công đội xử lý, quản lý danh mục/đội nhóm/vai trò/tài khoản.
- **Công nghệ nền tảng:**
  - *Frontend:* ReactJS 18, React Router v6, Axios, Leaflet, TailwindCSS, i18next.
  - *Backend:* ASP.NET Core, RESTful API, JWT Authentication.
  - *Công cụ:* Visual Studio Code, Vite, GitHub.

### 6. Kết cấu báo cáo

- **Chương 1:** Tổng quan hệ thống — Khảo sát thực trạng và giới thiệu công nghệ sử dụng.
- **Chương 2:** Phân tích và thiết kế hệ thống — Use Case, ERD, thiết kế giao diện.
- **Chương 3:** Kết quả thực nghiệm và kiểm thử.

---

## CHƯƠNG 1. TỔNG QUAN HỆ THỐNG

### 1.1 Khảo sát

Trong kỷ nguyên số 4.0, các thành phố lớn như Hà Nội đang đối mặt với nhiều thách thức về môi trường đô thị. Theo khảo sát, mỗi ngày tại Hà Nội có hàng trăm sự cố môi trường xảy ra nhưng chưa được báo cáo kịp thời do thiếu kênh tiếp nhận hiệu quả. Những bất cập chính bao gồm:

- **Thiếu kênh báo cáo thuận tiện:** Người dân phải gọi điện hoặc đến trực tiếp cơ quan hành chính, mất nhiều thời gian và thủ tục.
- **Thiếu minh bạch trong xử lý:** Người báo cáo không biết phản ánh của mình đã được tiếp nhận và xử lý đến đâu.
- **Quản lý thủ công:** Cán bộ quản lý sự cố qua sổ sách, thiếu công cụ tổng hợp và phân tích dữ liệu.
- **Không có cơ chế khuyến khích:** Người dân không có động lực tham gia báo cáo tích cực.

Trước thực tế đó, hệ thống **Hanoi CleanCity** được xây dựng trên nền tảng công nghệ hiện đại với Frontend ReactJS mang lại giao diện mượt mà, tích hợp bản đồ tương tác Leaflet để hiển thị sự cố theo vị trí địa lý, và hệ thống điểm xanh (Green Points) để gamify hành vi tích cực của cộng đồng.

**Các chức năng cốt lõi xác định qua khảo sát:**

**A. Nhóm chức năng dành cho Người dân:**
- Đăng ký / Đăng nhập tài khoản.
- Gửi báo cáo sự cố môi trường (kèm ảnh, vị trí, danh mục, mức độ ưu tiên).
- Xem danh sách báo cáo của bản thân và theo dõi trạng thái xử lý.
- Xem bản đồ thực tế hiển thị tất cả sự cố trong khu vực.
- Tích luỹ và xem điểm xanh (Green Points) theo lịch sử đóng góp.
- Quản lý thông tin cá nhân, đổi mật khẩu.

**B. Nhóm chức năng dành cho Cán bộ đô thị:**
- Dashboard thống kê tổng quan (tổng báo cáo, tỉ lệ xử lý, người dân hoạt động, sự cố giải quyết hôm nay).
- Biểu đồ phân tích: thống kê theo tuần (cột), phân bố danh mục (donut), top phường có nhiều báo cáo, hiệu suất đội nhóm.
- Quản lý báo cáo: xem, lọc theo trạng thái/danh mục/phường, phân công đội xử lý, cập nhật trạng thái (Tiếp nhận → Đang xử lý → Hoàn thành / Từ chối), xoá báo cáo.
- Quản lý danh mục sự cố (CRUD).
- Quản lý đội xử lý (CRUD, xem hiệu suất).
- Quản lý vai trò và phân quyền.
- Quản lý tài khoản người dùng.

### 1.2 Các công cụ và công nghệ

#### 1.2.1 ReactJS

ReactJS là thư viện JavaScript mã nguồn mở phát triển bởi Meta (2013), chuyên xây dựng giao diện người dùng theo kiến trúc Component-Based. Hệ thống sử dụng ReactJS 18 với các tính năng nổi bật:
- **Virtual DOM** giúp cập nhật giao diện cực nhanh.
- **JSX** cho phép viết cấu trúc HTML ngay trong JavaScript.
- **React Hooks** (useState, useEffect, useCallback, useMemo, useRef) quản lý state và side effects.
- **React Router v6** xử lý định tuyến phía client (SPA).

#### 1.2.2 Vite

Vite là công cụ build hiện đại thay thế Create React App, cung cấp Hot Module Replacement (HMR) cực nhanh và bundle tối ưu cho production. Cấu hình qua `vite.config.js` cho phép đặt base URL và proxy API.

#### 1.2.3 TailwindCSS

TailwindCSS là framework CSS utility-first giúp xây dựng giao diện nhanh chóng, nhất quán và responsive. Hệ thống sử dụng bảng màu Material Design 3 (primary, secondary, tertiary, surface) tuỳ chỉnh qua `tailwind.config.js`.

#### 1.2.4 Leaflet & React-Leaflet

Leaflet là thư viện bản đồ tương tác mã nguồn mở, kết hợp React-Leaflet để tích hợp liền mạch vào React. Hệ thống sử dụng tile OpenStreetMap để hiển thị bản đồ Hà Nội với các marker biểu diễn sự cố theo màu trạng thái (đỏ = mới, vàng = đang xử lý, xanh = hoàn thành).

#### 1.2.5 ASP.NET Core (Backend)

ASP.NET Core là framework web đa nền tảng hiệu suất cao của Microsoft, cung cấp các RESTful API theo chuẩn HTTP. Hệ thống xác thực bằng JWT (JSON Web Token) và phân quyền theo RBAC (Role-Based Access Control).

#### 1.2.6 Axios

Axios là HTTP client dựa trên Promise, hỗ trợ interceptor để tự động đính kèm JWT token vào mọi request và xử lý lỗi 401/403 tập trung.

#### 1.2.7 i18next

i18next là framework đa ngôn ngữ cho phép hệ thống hỗ trợ Tiếng Việt và Tiếng Anh, tự động phát hiện ngôn ngữ trình duyệt và lưu trữ lựa chọn của người dùng.

#### 1.2.8 SweetAlert2

SweetAlert2 cung cấp các hộp thoại xác nhận và thông báo đẹp, thay thế `alert()` và `confirm()` mặc định của trình duyệt.

---

## CHƯƠNG 2. PHÂN TÍCH THIẾT KẾ HỆ THỐNG

### 2.1 Phân tích hệ thống

#### 2.1.1 Mô tả bài toán

Hệ thống Hanoi CleanCity cung cấp nền tảng kết nối trực tiếp giữa người dân và cán bộ đô thị trong công tác quản lý sự cố môi trường. Khi người dân phát hiện sự cố (rác thải, hạ tầng hỏng, đèn đường, cấp nước…), họ có thể gửi báo cáo kèm ảnh và vị trí chỉ trong 30 giây. Cán bộ đô thị tiếp nhận, phân công đội xử lý phù hợp và cập nhật tiến độ. Người dân theo dõi trạng thái xử lý theo thời gian thực và tích luỹ điểm xanh khi đóng góp tích cực.

#### 2.1.2 Quy tắc nghiệp vụ

**a) Quy tắc nghiệp vụ đối với Người dân:**
- Người dân đăng ký tài khoản với thông tin cơ bản (họ tên, tên đăng nhập, email, mật khẩu).
- Sau khi đăng nhập, người dân gửi báo cáo sự cố gồm: mô tả, danh mục, hình ảnh, vị trí phường/xã, mức độ ưu tiên (Khẩn cấp / Trung bình / Bình thường).
- Báo cáo sau khi gửi ở trạng thái "Mới gửi" (Submitted).
- Người dân được cộng điểm xanh (Green Points) mỗi khi báo cáo được xử lý hoàn thành.
- Người dân xem lịch sử điểm xanh và bảng xếp hạng đóng góp.

**b) Quy tắc nghiệp vụ đối với Cán bộ đô thị:**
- Cán bộ xem tổng quan Dashboard với các chỉ số thống kê tự động cập nhật.
- Luồng xử lý báo cáo: **Mới gửi → Đã tiếp nhận → Đang xử lý → Hoàn thành** (hoặc **Từ chối** ở bất kỳ bước nào).
- Khi chuyển sang "Đang xử lý", cán bộ bắt buộc chỉ định một đội xử lý (Team).
- Khi hoàn thành, cán bộ có thể đính kèm ảnh sau xử lý và ghi chú.
- Cán bộ có thể lọc báo cáo theo trạng thái, danh mục, phường; chọn nhiều báo cáo để thao tác hàng loạt.

**c) Quy tắc phân quyền:**
- Hệ thống phân quyền theo RBAC với các permission cụ thể: `Reports.View`, `Reports.Update`, `Categories.View`, `Teams.View`, `Roles.View`, `Users.View`…
- Cán bộ chỉ thấy menu/chức năng tương ứng với quyền được gán.

#### 2.1.3 Mô hình Use Case tổng quan

Hệ thống có 3 nhóm tác nhân chính:

| Tác nhân | Chức năng chính |
|----------|----------------|
| **Người dân** | Đăng ký, Đăng nhập, Gửi báo cáo, Xem báo cáo của tôi, Xem bản đồ, Xem điểm xanh, Quản lý hồ sơ |
| **Cán bộ đô thị** | Xem Dashboard, Quản lý báo cáo, Phân công đội, Quản lý danh mục, Quản lý đội nhóm, Quản lý vai trò, Quản lý tài khoản |
| **Hệ thống (CSDL)** | Lưu trữ và trả về dữ liệu qua RESTful API |

#### 2.1.4 Mô tả các Use Case

**UC01 – Đăng ký**

| Trường | Nội dung |
|--------|---------|
| Tác nhân | Người dùng chưa có tài khoản |
| Mô tả | Tạo tài khoản mới với vai trò Người dân |
| Tiền điều kiện | Chưa có tài khoản trên hệ thống |
| Luồng chính | 1. Truy cập trang đăng ký → 2. Nhập họ tên, tên đăng nhập, email, mật khẩu, số điện thoại → 3. Hệ thống kiểm tra hợp lệ → 4. Tạo tài khoản → 5. Chuyển hướng đăng nhập |
| Luồng thay thế | Email đã tồn tại → thông báo lỗi; Mật khẩu < 6 ký tự → thông báo lỗi |
| Hậu điều kiện | Tài khoản được tạo và lưu vào CSDL |

**UC02 – Đăng nhập**

| Trường | Nội dung |
|--------|---------|
| Tác nhân | Người dân / Cán bộ |
| Mô tả | Xác thực tài khoản và nhận JWT token |
| Tiền điều kiện | Đã có tài khoản |
| Luồng chính | 1. Nhập email/tên đăng nhập + mật khẩu → 2. Hệ thống xác thực → 3. Trả về JWT token → 4. Lưu token → 5. Chuyển hướng theo vai trò (Người dân: /nguoi-dan; Cán bộ: /can-bo) |
| Luồng thay thế | Sai thông tin → thông báo lỗi; Tài khoản bị khoá → thông báo; Token hết hạn → chuyển hướng đăng nhập |
| Hậu điều kiện | Người dùng được xác thực, token lưu trong localStorage |

**UC03 – Gửi báo cáo sự cố**

| Trường | Nội dung |
|--------|---------|
| Tác nhân | Người dân (đã đăng nhập) |
| Mô tả | Tạo báo cáo sự cố môi trường mới |
| Tiền điều kiện | Đã đăng nhập |
| Luồng chính | 1. Click "Báo cáo ngay" → 2. Hiển thị modal tạo báo cáo → 3. Chọn danh mục, nhập mô tả, chọn phường, chọn mức ưu tiên, đính kèm ảnh → 4. Xác nhận gửi → 5. Hệ thống lưu báo cáo ở trạng thái Submitted → 6. Thông báo thành công |
| Luồng thay thế | Thiếu trường bắt buộc → hiển thị lỗi; Upload ảnh thất bại → thông báo |
| Hậu điều kiện | Báo cáo được lưu, hiển thị trên bản đồ và danh sách của người dùng |

**UC04 – Xem bản đồ thực tế**

| Trường | Nội dung |
|--------|---------|
| Tác nhân | Người dùng (có hoặc không đăng nhập) |
| Mô tả | Xem bản đồ hiển thị các sự cố theo vị trí địa lý |
| Tiền điều kiện | Không yêu cầu |
| Luồng chính | 1. Truy cập /ban-do → 2. Hệ thống tải markers từ API → 3. Hiển thị bản đồ Hà Nội với các marker màu sắc theo trạng thái → 4. Lọc theo phường hoặc danh mục → 5. Click marker xem chi tiết |
| Luồng thay thế | Không có dữ liệu → hiển thị bản đồ trống |
| Hậu điều kiện | Không |

**UC05 – Quản lý báo cáo (Cán bộ)**

| Trường | Nội dung |
|--------|---------|
| Tác nhân | Cán bộ (có quyền Reports.View/Update) |
| Mô tả | Xem, lọc, phân công và cập nhật trạng thái báo cáo |
| Tiền điều kiện | Đăng nhập với quyền tương ứng |
| Luồng chính | 1. Truy cập /can-bo/reports → 2. Xem danh sách báo cáo (phân trang 6 bản/trang) → 3. Lọc theo trạng thái/danh mục/phường → 4. Chọn báo cáo → Click "Xử lý" → 5. Modal Dispatch: chọn trạng thái mới, chọn đội, nhập ghi chú, đính kèm ảnh → 6. Xác nhận → 7. Cập nhật thành công |
| Luồng thay thế | Chuyển sang Đang xử lý mà không chọn đội → thông báo lỗi; Xoá báo cáo → hỏi xác nhận trước |
| Hậu điều kiện | Trạng thái báo cáo được cập nhật trong CSDL |

**UC06 – Xem điểm xanh (Green Points)**

| Trường | Nội dung |
|--------|---------|
| Tác nhân | Người dân (đã đăng nhập) |
| Mô tả | Xem tổng điểm xanh tích luỹ và lịch sử |
| Tiền điều kiện | Đã đăng nhập |
| Luồng chính | 1. Hệ thống tự động gọi API `/greenpoints/my` → 2. Hiển thị tổng điểm và lịch sử tích luỹ trong trang /nguoi-dan |
| Hậu điều kiện | Không |

**UC07 – Dashboard thống kê (Cán bộ)**

| Trường | Nội dung |
|--------|---------|
| Tác nhân | Cán bộ |
| Mô tả | Xem tổng quan hiệu quả hoạt động của hệ thống |
| Tiền điều kiện | Đăng nhập với tài khoản Cán bộ |
| Luồng chính | 1. Truy cập /can-bo → 2. Hệ thống tải dữ liệu từ nhiều API → 3. Hiển thị: thẻ thống kê (tổng báo cáo, tỉ lệ xử lý, người dân, sự cố hôm nay) + biểu đồ cột theo tuần + donut danh mục + top phường + hiệu suất đội nhóm + danh sách báo cáo gần đây |
| Hậu điều kiện | Không |

### 2.2 Thiết kế hệ thống

#### 2.2.1 Kiến trúc hệ thống

Hệ thống được xây dựng theo kiến trúc **Client-Server** tách biệt hoàn toàn:

```
┌─────────────────────────────────────┐
│           Frontend (ReactJS)         │
│   Vite + TailwindCSS + Leaflet      │
│   Port: 3000 (dev) / Static (prod)  │
└──────────────┬──────────────────────┘
               │ HTTPS / REST API
               │ Authorization: Bearer <JWT>
┌──────────────▼──────────────────────┐
│         Backend (ASP.NET Core)       │
│   RESTful API + JWT Auth + RBAC     │
│   Port: 5000 (dev)                  │
└──────────────┬──────────────────────┘
               │ SQL
┌──────────────▼──────────────────────┐
│         Cơ sở dữ liệu               │
│   SQL Server / PostgreSQL            │
└─────────────────────────────────────┘
```

#### 2.2.2 Cấu trúc thư mục Frontend

```
src/
├── App.jsx                  # Routing chính
├── main.jsx                 # Entry point
├── index.css                # Global styles
├── assets/                  # Static assets
├── components/
│   ├── common/              # Dùng chung nhiều trang
│   │   ├── CreateReportModal.jsx
│   │   ├── RequireAuth.jsx  # Bảo vệ route đăng nhập
│   │   ├── RequirePermission.jsx  # Bảo vệ route phân quyền
│   │   ├── Pagination.jsx
│   │   ├── ReportCard.jsx
│   │   ├── SelectionBar.jsx
│   │   └── StatusBadge.jsx
│   └── layout/
│       ├── TopNav.jsx       # Thanh điều hướng trên
│       ├── BottomNav.jsx    # Thanh điều hướng dưới (mobile)
│       └── SideNav.jsx      # Thanh bên (Cán bộ)
├── contexts/
│   └── AuthContext.jsx      # Quản lý trạng thái xác thực toàn cục
├── hooks/                   # Custom React Hooks
│   ├── useReports.js        # Lấy danh sách báo cáo
│   ├── useMyReports.js      # Báo cáo của người dùng hiện tại
│   ├── useMapMarkers.js     # Markers bản đồ
│   ├── useHanoiWards.js     # Danh sách phường Hà Nội
│   ├── useWardBoundary.js   # Ranh giới phường trên bản đồ
│   ├── useCategoryStatistics.js
│   ├── useTopWards.js
│   ├── useWeeklyStats.js
│   ├── useTeamPerformance.js
│   ├── useNotifications.js
│   ├── useReportProgress.js
│   └── useDebounce.js
├── i18n/                    # Đa ngôn ngữ
│   ├── vi.json              # Tiếng Việt
│   ├── en.json              # Tiếng Anh
│   └── index.js
├── pages/
│   ├── Auth/                # Đăng nhập, Đăng ký
│   ├── Citizen/             # Trang người dân
│   ├── Home/                # Trang chủ giới thiệu
│   ├── Map/                 # Bản đồ thực tế
│   ├── Profile/             # Hồ sơ cá nhân
│   ├── Staff/               # Cán bộ đô thị
│   └── NotFoundPage.jsx
├── services/                # Gọi API
│   ├── api.js               # Axios instance + interceptors
│   ├── authService.js       # Đăng nhập/đăng ký/profile
│   ├── authStorage.js       # Lưu/đọc token localStorage
│   ├── reportService.js     # Báo cáo + danh mục
│   ├── teamApi.js           # Đội xử lý
│   ├── roleApi.js           # Vai trò
│   ├── userApi.js           # Tài khoản người dùng
│   ├── permissionApi.js     # Phân quyền
│   ├── greenPointApi.js     # Điểm xanh
│   ├── wardApi.js           # Phường/xã
│   ├── mapService.js        # Dữ liệu bản đồ
│   └── hanoiBoundaryService.js
└── utils/
    ├── constants.js         # Hằng số (ROUTES, STATUS…)
    ├── apiError.js          # Parse lỗi API
    └── swal.js              # Wrapper SweetAlert2
```

#### 2.2.3 Thiết kế API chính

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| POST | /Auth/login | Đăng nhập | Public |
| POST | /Auth/register | Đăng ký | Public |
| GET | /Auth/profile | Lấy thông tin cá nhân | Authenticated |
| GET | /reports | Danh sách báo cáo (phân trang, lọc) | Staff |
| GET | /reports/my | Báo cáo của tôi | Authenticated |
| GET | /reports/:id | Chi tiết báo cáo | Authenticated |
| POST | /reports | Tạo báo cáo mới | Authenticated |
| PUT | /reports/:id/status | Cập nhật trạng thái | Reports.Update |
| POST | /reports/:id/assign | Phân công đội xử lý | Reports.Update |
| DELETE | /reports/:id | Xoá báo cáo | Reports.Delete |
| GET | /reports/stats | Thống kê tổng hợp | Staff |
| GET | /categories | Danh sách danh mục | Public |
| GET | /teams | Danh sách đội xử lý | Staff |
| GET | /teams/performance | Hiệu suất đội nhóm | Staff |
| GET | /greenpoints/my | Điểm xanh của tôi | Authenticated |
| GET | /greenpoints/leaderboard | Bảng xếp hạng | Public |
| GET | /wards | Danh sách phường | Public |

#### 2.2.4 Thiết kế giao diện

**Trang chủ (/trang-chu):**
- HeroSection: Banner với tiêu đề "Kiến tạo Thủ đô Xanh & Bền vững", ảnh nền Hà Nội, 2 CTA button (Báo cáo ngay / Xem bản đồ).
- StatsSection: 3 chỉ số nổi bật (1000+ báo cáo đã xử lý, 20+ quận huyện, 5 tấn rác thu gom).
- ProcessSection: Quy trình 3 bước đơn giản.
- CTASection: Kêu gọi hành động.

**Bản đồ (/ban-do):**
- Giao diện 2 cột: bên trái là FilterPanel (tìm kiếm phường, lọc danh mục, chú giải màu), bên phải là MapCanvas (Leaflet full-height).
- StatsBar phía trên: tổng số markers theo trạng thái.
- MapLeaderboard: bảng xếp hạng điểm xanh.

**Trang người dân (/nguoi-dan):**
- Header với tên người dùng, tổng điểm xanh, nút "Báo cáo ngay".
- Danh sách báo cáo với badge trạng thái, lọc và phân trang.
- Sidebar thông báo.

**Dashboard cán bộ (/can-bo):**
- BentoStats: 4 thẻ chỉ số chính.
- Biểu đồ cột thống kê theo tuần (SVG thuần).
- Biểu đồ donut phân bố danh mục (SVG thuần, hover effect).
- Top 5 phường nhiều sự cố nhất (thanh tiến trình).
- Hiệu suất đội nhóm.
- Danh sách 5 báo cáo gần nhất.

**Quản lý báo cáo (/can-bo/reports):**
- Bộ lọc: trạng thái, danh mục, phường.
- Bảng danh sách có phân trang, multi-select, badge trạng thái.
- Modal Dispatch: chọn bước xử lý tiếp theo, chọn đội, ghi chú, đính kèm ảnh sau.

---

## CHƯƠNG 3. KẾT QUẢ THỰC NGHIỆM VÀ ĐÁNH GIÁ

### 3.1 Cài đặt chương trình

**Yêu cầu hệ thống:**
- Node.js 20.x trở lên
- .NET SDK 8.0 trở lên
- SQL Server hoặc PostgreSQL

**Hướng dẫn cài đặt Frontend:**
```bash
# Clone repository
git clone <repository-url>
cd CleanCityApp

# Cài đặt dependencies
npm install

# Tạo file môi trường
cp .env.example .env
# Chỉnh VITE_API_BASE_URL=http://localhost:5000/api

# Chạy development server
npm run dev
# → http://localhost:3000

# Build production
npm run build
```

**Biến môi trường quan trọng:**
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_AUTH_LOGIN_PATH=/Auth/login
VITE_AUTH_REGISTER_PATH=/Auth/register
VITE_AUTH_PROFILE_PATH=/Auth/profile
```

### 3.2 Kết quả hệ thống

Hệ thống đã được triển khai đầy đủ các chức năng theo yêu cầu:

**Trang chủ:** Giao diện hiện đại với bảng màu Material Design 3, responsive trên mọi thiết bị, hero section ấn tượng với ảnh nền Hà Nội.

**Bản đồ thực tế:** Hiển thị tất cả sự cố theo vị trí địa lý với 3 màu marker (đỏ/vàng/xanh theo trạng thái), lọc theo phường (dropdown tìm kiếm), lọc theo danh mục (checkbox nhóm), hiển thị ranh giới phường khi chọn.

**Trang người dân:** Hiển thị danh sách báo cáo cá nhân với trạng thái cập nhật, tổng điểm xanh, form gửi báo cáo nhanh với đầy đủ thông tin.

**Dashboard cán bộ:** Biểu đồ thống kê phong phú (cột + donut), thẻ chỉ số thời gian thực, bảng báo cáo gần đây có link điều hướng nhanh.

**Quản lý báo cáo:** Phân trang 6 bản/trang, lọc đa chiều, modal xử lý trực quan theo luồng trạng thái, chọn nhiều báo cáo để thao tác hàng loạt.

### 3.3 Kịch bản kiểm thử

#### 3.3.1 Kiểm thử chức năng Đăng nhập/Đăng ký

| STT | Kịch bản | Đầu vào | Kết quả kỳ vọng | Kết quả thực tế |
|-----|----------|---------|----------------|----------------|
| 1 | Đăng nhập hợp lệ | Email + mật khẩu đúng | Chuyển hướng theo vai trò | Đúng kỳ vọng |
| 2 | Sai mật khẩu | Mật khẩu sai | Thông báo lỗi | Đúng kỳ vọng |
| 3 | Email sai định dạng | `abc@` | Lỗi "Email không hợp lệ" | Đúng kỳ vọng |
| 4 | Mật khẩu < 6 ký tự | `abc12` | Lỗi "Mật khẩu tối thiểu 6 ký tự" | Đúng kỳ vọng |
| 5 | Đăng ký email đã tồn tại | Email trùng | Lỗi "Email đã được sử dụng" | Đúng kỳ vọng |
| 6 | Đăng nhập tài khoản bị khoá | Tài khoản locked | Thông báo "Tài khoản bị khoá" | Đúng kỳ vọng |

#### 3.3.2 Kiểm thử chức năng Gửi báo cáo

| STT | Kịch bản | Đầu vào | Kết quả kỳ vọng | Kết quả thực tế |
|-----|----------|---------|----------------|----------------|
| 1 | Gửi báo cáo đầy đủ thông tin | Tất cả trường hợp lệ | Báo cáo được tạo, xuất hiện trên bản đồ | Đúng kỳ vọng |
| 2 | Thiếu mô tả | Bỏ trống mô tả | Thông báo lỗi | Đúng kỳ vọng |
| 3 | Chưa đăng nhập | Truy cập /nguoi-dan | Chuyển hướng /dang-nhap | Đúng kỳ vọng |
| 4 | Đính kèm ảnh | File ảnh hợp lệ | Ảnh được upload và hiển thị preview | Đúng kỳ vọng |

#### 3.3.3 Kiểm thử chức năng Quản lý báo cáo (Cán bộ)

| STT | Kịch bản | Các bước | Kết quả kỳ vọng | Kết quả thực tế |
|-----|----------|----------|----------------|----------------|
| 1 | Xem danh sách | Truy cập /can-bo/reports | Hiển thị danh sách 6 báo cáo/trang | Đúng kỳ vọng |
| 2 | Lọc theo trạng thái | Chọn "Mới gửi" | Chỉ hiển thị báo cáo Submitted | Đúng kỳ vọng |
| 3 | Chuyển Tiếp nhận | Submitted → Received | Trạng thái cập nhật ngay | Đúng kỳ vọng |
| 4 | Phân công đội | InProgress + chọn đội | Báo cáo gắn team, trạng thái InProgress | Đúng kỳ vọng |
| 5 | Phân công không chọn đội | InProgress + bỏ trống team | Thông báo "Vui lòng chọn đội xử lý" | Đúng kỳ vọng |
| 6 | Xoá báo cáo | Click Xoá → xác nhận | Báo cáo bị xoá khỏi danh sách | Đúng kỳ vọng |
| 7 | Multi-select | Chọn nhiều → thao tác hàng loạt | SelectionBar hiện, xoá/cập nhật đồng loạt | Đúng kỳ vọng |

#### 3.3.4 Kiểm thử phân quyền

| STT | Kịch bản | Kết quả kỳ vọng | Kết quả thực tế |
|-----|----------|----------------|----------------|
| 1 | Người dân truy cập /can-bo | Chuyển hướng /ban-do | Đúng kỳ vọng |
| 2 | Cán bộ không có quyền Teams.View truy cập /can-bo/teams | Thông báo "Không có quyền" | Đúng kỳ vọng |
| 3 | Token hết hạn | Tự động logout, chuyển /ban-do | Đúng kỳ vọng |

---

## KẾT LUẬN

### Kết quả đạt được

**Về lý thuyết:** Đồ án đã hệ thống hoá các vấn đề lý thuyết về phát triển web hiện đại, ứng dụng thành công các công nghệ ReactJS, ASP.NET Core, Leaflet, JWT. Các mô hình phân tích UML được xây dựng khoa học, làm cơ sở triển khai hệ thống.

**Về thực tiễn:** Hệ thống Hanoi CleanCity đã được xây dựng hoàn chỉnh với:
- **Phân hệ Người dân:** Gửi báo cáo nhanh, xem bản đồ thực tế, theo dõi tiến độ, tích luỹ điểm xanh, đa ngôn ngữ.
- **Phân hệ Cán bộ:** Dashboard thống kê đa chiều, quản lý báo cáo theo luồng trạng thái, phân công đội xử lý, quản lý danh mục/đội/vai trò/tài khoản.
- **Bảo mật:** JWT, RBAC, route protection, interceptor xử lý lỗi tập trung.
- **Trải nghiệm:** Giao diện Material Design 3, responsive, hỗ trợ đa ngôn ngữ Việt/Anh.

### Hạn chế và hướng phát triển

**Hạn chế hiện tại:**
- Chưa có thông báo thời gian thực (WebSocket/SignalR) khi trạng thái báo cáo được cập nhật.
- Chưa tích hợp bản đồ upload vị trí GPS tự động từ thiết bị di động.
- Ứng dụng mobile (React Native) chưa được phát triển.
- Chưa có tính năng chatbot AI hỗ trợ người dân.

**Hướng phát triển:**
- Tích hợp SignalR để push notification thời gian thực.
- Phát triển ứng dụng mobile với React Native, tích hợp GPS.
- Thêm module báo cáo nâng cao: xuất PDF/Excel, biểu đồ heat map.
- Tích hợp AI phân loại sự cố tự động từ hình ảnh.
- Hệ thống thông báo qua email/SMS cho người báo cáo.
- Triển khai Docker + CI/CD pipeline cho môi trường production.

---

## TÀI LIỆU THAM KHẢO

1. Meta (2023), *ReactJS Official Documentation*, https://react.dev
2. Microsoft (2024), *ASP.NET Core Documentation*, https://docs.microsoft.com/aspnet/core
3. Leaflet (2024), *Leaflet.js — an open-source JavaScript library for mobile-friendly interactive maps*, https://leafletjs.com
4. i18next (2024), *i18next Documentation*, https://www.i18next.com
5. Tailwind Labs (2024), *TailwindCSS Documentation*, https://tailwindcss.com/docs
6. Nguyễn Thị Thanh Huyền và cộng sự (2011), *Giáo trình Phân tích thiết kế hệ thống*, NXB Giáo dục Việt Nam.
7. Vũ Thị Dương và cộng sự (2015), *Giáo trình Phân tích thiết kế hướng đối tượng*, NXB Khoa học và Kỹ thuật, Trường Đại học Công nghiệp Hà Nội.
8. UBND Thành phố Hà Nội (2023), *Đề án Chuyển đổi số và đô thị thông minh Hà Nội giai đoạn 2023-2025*.
