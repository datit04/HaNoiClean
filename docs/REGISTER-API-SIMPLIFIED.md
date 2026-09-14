# ? Register API - ?ã C?p Nh?t Cho FE ??n Gi?n H?n

## ?? **Thay ??i**

### Tr??c (Yêu c?u nhi?u fields):
```json
{
  "userName": "string",
  "password": "string",
  "email": "string",
  "fullName": "string",      // B?t bu?c
  "phoneNumber": "string",   // Optional
  "dob": "string"            // Optional
}
```

### Sau (Ch? yêu c?u 3 fields chính):
```json
{
  "userName": "string",      // B?t bu?c
  "password": "string",      // B?t bu?c
  "email": "string",         // B?t bu?c
  "fullName": "string",      // Optional - auto = userName n?u không có
  "phoneNumber": "string",   // Optional
  "dob": "string"            // Optional
}
```

---

## ?? **API Endpoint**

### POST /api/auth/register

**Request Body (T?i thi?u):**
```json
{
  "userName": "johndoe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response Success (200):**
```json
{
  "message": "??ng ký thành công",
  "userId": "guid-here",
  "userName": "johndoe",
  "email": "john@example.com",
  "fullName": "johndoe"
}
```

**Response Error (400):**
```json
{
  "title": "One or more validation errors occurred",
  "errors": {
    "UserName": ["Tên ??ng nh?p là b?t bu?c"],
    "Email": ["Email không h?p l?"],
    "Password": ["M?t kh?u ph?i có ít nh?t 6 ký t?"]
  }
}
```

---

## ? **Validation Rules**

| Field | Required | Min Length | Max Length | Format | Default |
|-------|----------|------------|------------|--------|---------|
| userName | ? Yes | 3 | 50 | - | - |
| password | ? Yes | 6 | 100 | - | - |
| email | ? Yes | - | - | Valid email | - |
| fullName | ? No | - | - | - | = userName |
| phoneNumber | ? No | - | - | - | null |
| dob | ? No | - | - | DateTime | null |

---

## ?? **Logic Changes**

### 1. FullName Auto-Fill
```csharp
FullName = request.FullName ?? request.UserName
```
- N?u FE không g?i `fullName` ? T? ??ng dùng `userName`
- User có th? update fullName sau trong profile

### 2. Auto Assign Role
```csharp
await _userManager.AddToRoleAsync(user, SystemConstants.Roles.Citizen);
```
- T?t c? user ??ng ký m?i t? ??ng là **Citizen**
- Admin có th? thay ??i role sau

### 3. Default Status
```csharp
Status = UserStatus.Active
```
- User m?i t? ??ng active (không c?n verify email)

---

## ?? **Test Cases**

### Test 1: Register v?i 3 fields b?t bu?c
```bash
curl -X POST "https://localhost:7263/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "testuser",
    "email": "test@example.com",
    "password": "Test@123"
  }'

# Expected: 200 OK
# FullName t? ??ng = "testuser"
```

### Test 2: Register v?i fullName custom
```bash
curl -X POST "https://localhost:7263/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "testuser",
    "email": "test@example.com",
    "password": "Test@123",
    "fullName": "John Doe"
  }'

# Expected: 200 OK
# FullName = "John Doe"
```

### Test 3: Validation errors
```bash
curl -X POST "https://localhost:7263/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "ab",
    "email": "invalid-email",
    "password": "123"
  }'

# Expected: 400 Bad Request
# Errors:
# - UserName: "Tên ??ng nh?p ph?i t? 3-50 ký t?"
# - Email: "Email không h?p l?"
# - Password: "M?t kh?u ph?i có ít nh?t 6 ký t?"
```

### Test 4: Duplicate username
```bash
# T?o user l?n 1
curl -X POST "https://localhost:7263/api/auth/register" \
  -d '{"userName":"duplicate","email":"test1@example.com","password":"Test@123"}'

# T?o user l?n 2 v?i cùng username
curl -X POST "https://localhost:7263/api/auth/register" \
  -d '{"userName":"duplicate","email":"test2@example.com","password":"Test@123"}'

# Expected: 400 Bad Request
# Error: "Username 'duplicate' is already taken"
```

---

## ?? **Frontend Example**

### React
```jsx
import { useState } from 'react';

function RegisterForm() {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message); // "??ng ký thành công"
        // Redirect to login
      } else {
        const error = await response.json();
        console.error('Validation errors:', error.errors);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Tên ??ng nh?p"
        value={formData.userName}
        onChange={(e) => setFormData({...formData, userName: e.target.value})}
        required
        minLength={3}
      />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />

      <input
        type="password"
        placeholder="M?t kh?u"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
        minLength={6}
      />

      <button type="submit">??ng ký</button>
    </form>
  );
}
```

---

## ?? **Security Notes**

1. ? Password validation (min 6 chars) - có th? t?ng lên 8
2. ? Email format validation
3. ? Username length validation
4. ?? Cân nh?c thêm:
   - Email verification
   - CAPTCHA
   - Rate limiting
   - Password strength meter

---

## ?? **User Flow**

```
1. User fills form: username, email, password
   ?
2. FE sends POST /api/auth/register
   ?
3. BE validates inputs
   ?
4. BE creates user with:
   - FullName = userName (default)
   - Role = Citizen
   - Status = Active
   ?
5. Return success + userId
   ?
6. FE redirects to login page
```

---

## ?? **Database Schema**

User ???c t?o v?i:
```
AspNetUsers:
  Id: guid (auto)
  UserName: from request
  Email: from request
  FullName: from request OR userName (default)
  PhoneNumber: null (can update later)
  Dob: null (can update later)
  Status: Active
  CreateDate: DateTime.Now

AspNetUserRoles:
  UserId: user.Id
  RoleId: "Citizen"
```

---

## ? **Checklist C?p Nh?t**

- [x] C?p nh?t RegisterRequest - thêm validation
- [x] C?p nh?t AuthController - auto-fill FullName
- [x] Build successful
- [x] Backward compatible (v?n nh?n fullName n?u FE g?i)
- [x] Documentation complete

---

## ?? **Next Steps**

1. Test API v?i Postman/Swagger
2. Update FE n?u c?n (?ã ??n gi?n r?i)
3. Cân nh?c thêm email verification
4. Add rate limiting cho register endpoint

---

**Status:** ? Ready to use

FE gi? ch? c?n g?i 3 fields: userName, email, password!
