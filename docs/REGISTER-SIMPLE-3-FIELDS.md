# ? ??NG KÝ CH? C?N 3 TR??NG - HOÀN THÀNH!

## ?? Yêu C?u
User ??ng ký ch? c?n nh?p:
1. **Tài kho?n** (userName)
2. **Email**
3. **M?t kh?u** (password)

Các thông tin khác (FullName, PhoneNumber, Dob, Avatar...) s? c?p nh?t sau ? ph?n **Thông tin cá nhân**.

---

## ? Backend ?ã S?n Sàng

### 1. RegisterRequest - Validation
```csharp
public class RegisterRequest
{
    // B?T BU?C - FE ph?i g?i
    [Required] public string UserName { get; set; }    // 3-50 ký t?
    [Required] public string Password { get; set; }    // Min 6 ký t?
    [Required] public string Email { get; set; }       // Valid email

    // TÙY CH?N - FE không c?n g?i
    public string? FullName { get; set; }              // null
    public string? PhoneNumber { get; set; }           // null
    public string? Dob { get; set; }                   // null
}
```

### 2. AuthController - Register Logic
```csharp
[HttpPost("register")]
public async Task<IActionResult> Register([FromBody] RegisterRequest request)
{
    var user = new User
    {
        Id = Guid.NewGuid().ToString(),
        UserName = request.UserName,        // ? T? FE
        Email = request.Email,              // ? T? FE
        FullName = request.FullName,        // ? null (không auto-fill)
        PhoneNumber = request.PhoneNumber,  // ? null
        Dob = ...,                          // ? null
        CreateDate = DateTime.Now,
        Status = UserStatus.Active
    };

    await _userManager.CreateAsync(user, request.Password);
    await _userManager.AddToRoleAsync(user, "Citizen"); // Auto assign role

    return Ok(...);
}
```

---

## ?? API Contract

### Endpoint
```
POST /api/auth/register
```

### Request Body (FE ch? g?i 3 tr??ng)
```json
{
  "userName": "johndoe",
  "email": "john@example.com",
  "password": "Password123"
}
```

### Response Success (200 OK)
```json
{
  "message": "??ng ký thành công",
  "userId": "guid-here",
  "userName": "johndoe",
  "email": "john@example.com",
  "fullName": null
}
```

### Response Error (400 Bad Request)
```json
{
  "title": "One or more validation errors occurred",
  "errors": {
    "UserName": ["Tên ??ng nh?p ph?i t? 3-50 ký t?"],
    "Email": ["Email không h?p l?"],
    "Password": ["M?t kh?u ph?i có ít nh?t 6 ký t?"]
  }
}
```

---

## ?? User Flow

### 1. ??ng Ký (Register)
```
User nh?p form ??ng ký:
??? Tài kho?n: johndoe
??? Email: john@example.com
??? M?t kh?u: ********

FE g?i POST /api/auth/register
    ?
BE t?o user v?i:
??? UserName: "johndoe"      ?
??? Email: "john@example.com" ?
??? FullName: null           ? (ch?a có)
??? PhoneNumber: null        ? (ch?a có)
??? Dob: null                ? (ch?a có)
??? Avatar: null             ? (ch?a có)
??? Role: "Citizen"          ? (auto assign)
??? Status: Active           ?

BE tr? v?: "??ng ký thành công"
    ?
FE redirect to Login page
```

### 2. ??ng Nh?p (Login)
```
User ??ng nh?p v?i:
??? UserName: johndoe
??? Password: ********

FE g?i POST /api/auth/login
    ?
BE tr? v?: access_token, refresh_token
    ?
FE l?u token ? Redirect to Home
```

### 3. C?p Nh?t Thông Tin Cá Nhân (Sau Khi ??ng Nh?p)
```
User vào Profile page
    ?
User th?y form v?i các field:
??? Tài kho?n: johndoe (readonly)
??? Email: john@example.com (readonly)
??? H? tên: [Tr?ng - cho phép nh?p]    ? C?P NH?T
??? S? ?i?n tho?i: [Tr?ng - cho phép nh?p] ? C?P NH?T
??? Ngày sinh: [Tr?ng - cho phép ch?n]  ? C?P NH?T
??? Avatar: [Tr?ng - cho phép upload]   ? C?P NH?T

User nh?p và l?u
    ?
FE g?i PUT /api/users/{userId}
    ?
BE c?p nh?t: FullName, PhoneNumber, Dob, Avatar
    ?
User profile hoàn ch?nh! ?
```

---

## ?? Database Schema

### Sau khi ??ng ký (User m?i)
```sql
AspNetUsers:
??? Id: "guid-123"
??? UserName: "johndoe"
??? Email: "john@example.com"
??? PasswordHash: "hashed-password"
??? FullName: NULL                 ? Ch?a có
??? PhoneNumber: NULL              ? Ch?a có
??? Dob: NULL                      ? Ch?a có
??? AvatarUrl: NULL                ? Ch?a có
??? Status: Active
??? CreateDate: 2024-01-15 10:00:00

AspNetUserRoles:
??? UserId: "guid-123"
??? RoleId: "Citizen"
```

### Sau khi c?p nh?t profile
```sql
AspNetUsers:
??? Id: "guid-123"
??? UserName: "johndoe"
??? Email: "john@example.com"
??? PasswordHash: "hashed-password"
??? FullName: "John Doe"           ? ? ?ã c?p nh?t
??? PhoneNumber: "0123456789"      ? ? ?ã c?p nh?t
??? Dob: 1990-01-15                ? ? ?ã c?p nh?t
??? AvatarUrl: "/uploads/avatar.jpg" ? ? ?ã c?p nh?t
??? Status: Active
??? LastModifiedDate: 2024-01-15 11:00:00
```

---

## ?? Frontend Example

### React - Register Form
```jsx
import { useState } from 'react';

function RegisterForm() {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message); // "??ng ký thành công"
        window.location.href = '/login';
      } else {
        const error = await response.json();
        setErrors(error.errors || {});
      }
    } catch (error) {
      alert('L?i k?t n?i!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Tài kho?n *</label>
        <input
          type="text"
          value={formData.userName}
          onChange={(e) => setFormData({...formData, userName: e.target.value})}
          required
          minLength={3}
          maxLength={50}
        />
        {errors.UserName && <span className="error">{errors.UserName[0]}</span>}
      </div>

      <div>
        <label>Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        {errors.Email && <span className="error">{errors.Email[0]}</span>}
      </div>

      <div>
        <label>M?t kh?u *</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
          minLength={6}
        />
        {errors.Password && <span className="error">{errors.Password[0]}</span>}
      </div>

      <button type="submit">??ng ký</button>
    </form>
  );
}
```

### React - Profile Update Form (Sau khi login)
```jsx
import { useState, useEffect } from 'react';

function ProfileForm() {
  const [profile, setProfile] = useState({
    fullName: '',
    phoneNumber: '',
    dob: '',
    avatar: null
  });

  useEffect(() => {
    // Load current user data
    fetch('/api/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
      setProfile({
        fullName: data.fullName || '',
        phoneNumber: data.phoneNumber || '',
        dob: data.dob || ''
      });
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('FullName', profile.fullName);
    formData.append('PhoneNumber', profile.phoneNumber);
    formData.append('Dob', profile.dob);
    if (profile.avatar) {
      formData.append('Avatar', profile.avatar);
    }

    const response = await fetch('/api/users/me', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (response.ok) {
      alert('C?p nh?t thành công!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>H? tên</label>
        <input
          type="text"
          value={profile.fullName}
          onChange={(e) => setProfile({...profile, fullName: e.target.value})}
        />
      </div>

      <div>
        <label>S? ?i?n tho?i</label>
        <input
          type="tel"
          value={profile.phoneNumber}
          onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})}
        />
      </div>

      <div>
        <label>Ngày sinh</label>
        <input
          type="date"
          value={profile.dob}
          onChange={(e) => setProfile({...profile, dob: e.target.value})}
        />
      </div>

      <div>
        <label>Avatar</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfile({...profile, avatar: e.target.files[0]})}
        />
      </div>

      <button type="submit">L?u thông tin</button>
    </form>
  );
}
```

---

## ? Validation Summary

### ??ng Ký (Register)
| Field | Required | Validation | Error Message |
|-------|----------|------------|---------------|
| userName | ? Yes | 3-50 chars | "Tên ??ng nh?p ph?i t? 3-50 ký t?" |
| email | ? Yes | Valid email | "Email không h?p l?" |
| password | ? Yes | Min 6 chars | "M?t kh?u ph?i có ít nh?t 6 ký t?" |

### C?p Nh?t Profile
| Field | Required | Validation | Note |
|-------|----------|------------|------|
| fullName | ? No | - | Tùy ch?n |
| phoneNumber | ? No | Phone format | Tùy ch?n |
| dob | ? No | Valid date | Tùy ch?n |
| avatar | ? No | Image file | Tùy ch?n |

---

## ?? Test Cases

### Test 1: ??ng ký thành công
```bash
curl -X POST "https://localhost:7263/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "testuser",
    "email": "test@example.com",
    "password": "Test@123"
  }'

# Expected: 200 OK
# Response: { "message": "??ng ký thành công", ... }
```

### Test 2: Validation errors
```bash
curl -X POST "https://localhost:7263/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "ab",
    "email": "invalid",
    "password": "123"
  }'

# Expected: 400 Bad Request
# Errors: UserName (too short), Email (invalid), Password (too short)
```

### Test 3: Duplicate username
```bash
# L?n 1 - OK
curl -X POST ".../register" -d '{"userName":"john","email":"j1@e.com","password":"Pass123"}'

# L?n 2 - Fail
curl -X POST ".../register" -d '{"userName":"john","email":"j2@e.com","password":"Pass123"}'

# Expected: 400 Bad Request
# Error: "Username 'john' is already taken"
```

---

## ?? K?t Lu?n

? **Backend s?n sàng 100%**
- Register API ch? yêu c?u 3 tr??ng: userName, email, password
- FullName, PhoneNumber, Dob ?? null ? C?p nh?t sau
- Validation ??y ??
- Auto assign role Citizen
- Build successful

? **User Experience t?i ?u**
- Form ??ng ký ??n gi?n ? T? l? chuy?n ??i cao
- C?p nh?t profile sau ? Linh ho?t
- Không ép bu?c nh?p thông tin cá nhân ngay t? ??u

---

**Ready to use!** ??

Frontend ch? c?n g?i 3 tr??ng khi ??ng ký, các thông tin khác update sau ? profile page.
