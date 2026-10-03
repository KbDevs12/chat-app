# Auth Service — API Test Cases

## Test Environment

- Base URL: `http://localhost:8080`
- Database: PostgreSQL
- Authentication: JWT
- Access Token: JWT
- Refresh Token: JWT + database persistence
- Content-Type: `application/json`

## Legend

| Symbol | Meaning                         |
| :----: | ------------------------------- |
| `[ ]`  | Belum dites / perlu dites ulang |
| `[v]`  | Lulus                           |
| `[x]`  | Gagal                           |

## Error Response Format

Error biasa (`BadRequest`, `Unauthorized`, `InternalServerError`, `DatabaseError`):

```json
{
  "error": "pesan error"
}
```

Error validasi (status `422`):

```json
{
  "error": "Validasi gagal",
  "details": {
    "email": ["Format email tidak valid"],
    "password": [
      "Password harus 8-64 karakter",
      "Password harus mengandung minimal 1 huruf besar, 1 angka, dan 1 karakter spesial"
    ]
  }
}
```

> Error dari database (`DatabaseError`) tidak boleh membocorkan detail internal ke client. Response selalu: `"Terjadi kesalahan internal pada server"`.

---

# 1. Register

## POST `/auth/register`

### Request

```json
{
  "email": "test@example.com",
  "password": "Password123!"
}
```

### Expected Response (`201`)

```json
{
  "id": "uuid",
  "email": "test@example.com",
  "created_at": "timestamp"
}
```

### 1.1 Success & duplicate

| ID      | Test Case                              | Input                                             | Expected Status | Result |
| ------- | -------------------------------------- | ------------------------------------------------- | --------------: | :----: |
| REG-001 | Register with valid credentials        | Valid email + password                            |           `201` |  [v]   |
| REG-002 | Register with existing email           | Existing email                                    |           `400` |  [v]   |
| REG-003 | Existing email, different letter case  | `TEST@EXAMPLE.COM` (sudah ada `test@example.com`) |           `400` |  [v]   |
| REG-004 | Email with leading/trailing whitespace | `"  user@example.com  "`                          |           `201` |  [v]   |
| REG-005 | Uppercase email (disimpan lowercase)   | `USER@EXAMPLE.COM`                                |           `201` |  [v]   |

### 1.2 Email validation

| ID      | Test Case            | Input              | Expected Status | Result |
| ------- | -------------------- | ------------------ | --------------: | :----: |
| REG-010 | Invalid email format | `invalid-email`    |           `422` |  [ ]   |
| REG-011 | Empty email          | `""`               |           `422` |  [ ]   |
| REG-012 | Email without domain | `user@`            |           `422` |  [ ]   |
| REG-013 | Email without `@`    | `user.example.com` |           `422` |  [ ]   |
| REG-014 | Email too long       | 256+ karakter      |           `422` |  [ ]   |

### 1.3 Password validation

| ID      | Test Case                      | Input                   | Expected Status | Result |
| ------- | ------------------------------ | ----------------------- | --------------: | :----: |
| REG-020 | Empty password                 | `""`                    |           `422` |  [ ]   |
| REG-021 | Password below minimum length  | `Ab1!` (4 karakter)     |           `422` |  [ ]   |
| REG-022 | Password above maximum length  | 65+ karakter            |           `422` |  [ ]   |
| REG-023 | No uppercase letter            | `password123!`          |           `422` |  [ ]   |
| REG-024 | No number                      | `Password!!!`           |           `422` |  [ ]   |
| REG-025 | No special character           | `Password123`           |           `422` |  [ ]   |
| REG-026 | Exactly minimum length (valid) | `Abcdef1!` (8 karakter) |           `201` |  [ ]   |
| REG-027 | Password with spaces (valid)   | `Pass word123!`         |           `201` |  [ ]   |

### 1.4 Multiple errors & request format

| ID      | Test Case                       | Input                                     | Expected Status | Result |
| ------- | ------------------------------- | ----------------------------------------- | --------------: | :----: |
| REG-030 | Email and password both invalid | `invalid-email` + `abc`                   |           `422` |  [ ]   |
| REG-031 | Missing `password` field        | `{ "email": "a@b.com" }`                  |           `422` |  [ ]   |
| REG-032 | Missing `email` field           | `{ "password": "Password123!" }`          |           `422` |  [ ]   |
| REG-033 | Malformed JSON                  | `{ "email": `                             |           `400` |  [ ]   |
| REG-034 | Missing `Content-Type` header   | Body JSON tanpa header                    |           `415` |  [ ]   |
| REG-035 | Wrong type (password is number) | `{ "email": "a@b.com", "password": 123 }` |           `422` |  [ ]   |

**REG-030 expected:** `details` memuat key `email` dan `password` sekaligus, dan nilai tiap key berupa array pesan.

### 1.5 Security checks

| ID      | Test Case                                 | Expected                                   | Result |
| ------- | ----------------------------------------- | ------------------------------------------ | :----: |
| REG-040 | Response tidak berisi field `password`    | Tidak ada `password` / hash di body        |  [ ]   |
| REG-041 | Error validasi tidak meng-echo password   | Body error tidak memuat nilai password     |  [ ]   |
| REG-042 | Password tersimpan sebagai hash Argon2    | Kolom `password` diawali `$argon2`         |  [ ]   |
| REG-043 | Dua user dengan password sama → hash beda | Hash berbeda (salt unik)                   |  [ ]   |
| REG-044 | SQL injection di email                    | `' OR '1'='1` → `422`, tabel tidak berubah |  [ ]   |
| REG-045 | Email dinormalisasi sebelum disimpan      | Di DB: lowercase, tanpa spasi              |  [ ]   |

---

# 2. Login

## POST `/auth/login`

### Request

```json
{
  "email": "test@example.com",
  "password": "Password123!"
}
```

### Expected Response (`200`)

```json
{
  "access_token": "jwt",
  "refresh_token": "jwt"
}
```

| ID      | Test Case                    | Input                       | Expected Status | Result |
| ------- | ---------------------------- | --------------------------- | --------------: | :----: |
| LOG-001 | Login with valid credentials | Email + password benar      |           `200` |  [ ]   |
| LOG-002 | Wrong password               | Email benar, password salah |           `401` |  [ ]   |
| LOG-003 | Unregistered email           | Email tidak ada             |           `401` |  [ ]   |
| LOG-004 | Uppercase email              | `TEST@EXAMPLE.COM`          |           `200` |  [ ]   |
| LOG-005 | Email with whitespace        | `"  test@example.com "`     |           `200` |  [ ]   |
| LOG-006 | Empty email / password       | `""`                        |     `400`/`422` |  [ ]   |
| LOG-007 | Missing field                | Tanpa `password`            |           `422` |  [ ]   |
| LOG-008 | Malformed JSON               | `{ "email": `               |           `400` |  [ ]   |

### 2.1 Token & security

| ID      | Test Case                                       | Expected                                  | Result |
| ------- | ----------------------------------------------- | ----------------------------------------- | :----: |
| LOG-020 | Pesan error LOG-002 dan LOG-003 identik         | Tidak membocorkan apakah email terdaftar  |  [ ]   |
| LOG-021 | Access token berisi claim `sub` dan `exp`       | `sub` = user id, `exp` di masa depan      |  [ ]   |
| LOG-022 | Refresh token tersimpan di database             | Ada baris baru di tabel refresh token     |  [ ]   |
| LOG-023 | Login berulang menghasilkan token berbeda       | Token berbeda tiap login                  |  [ ]   |
| LOG-024 | Login tidak menerapkan aturan kekuatan password | Password lama yang lemah tetap bisa login |  [ ]   |
| LOG-025 | Response tidak berisi password/hash             | Tidak ada field `password`                |  [ ]   |

---

# 3. Refresh Token

## POST `/auth/refresh`

### Request

```json
{
  "refresh_token": "jwt"
}
```

### Expected Response (`200`)

```json
{
  "access_token": "jwt"
}
```

| ID      | Test Case                          | Input                              | Expected Status | Result |
| ------- | ---------------------------------- | ---------------------------------- | --------------: | :----: |
| REF-001 | Refresh with valid token           | Refresh token valid                |           `200` |  [ ]   |
| REF-002 | Invalid / tampered token           | Token diubah sebagian              |           `401` |  [ ]   |
| REF-003 | Expired refresh token              | Token lewat `exp`                  |           `401` |  [ ]   |
| REF-004 | Token not found in database        | Token valid tapi tidak tersimpan   |           `401` |  [ ]   |
| REF-005 | Access token used as refresh token | Access token                       |           `401` |  [ ]   |
| REF-006 | Empty token                        | `""`                               |     `400`/`401` |  [ ]   |
| REF-007 | Token revoked after logout         | Token milik sesi yang sudah logout |           `401` |  [ ]   |

---

# 4. Logout

## POST `/auth/logout`

### Request

```json
{
  "refresh_token": "jwt"
}
```

| ID      | Test Case                           | Input                    | Expected Status | Result |
| ------- | ----------------------------------- | ------------------------ | --------------: | :----: |
| OUT-001 | Logout with valid refresh token     | Refresh token valid      |   `200` / `204` |  [ ]   |
| OUT-002 | Refresh token dihapus dari database | Cek tabel setelah logout |               - |  [ ]   |
| OUT-003 | Refresh setelah logout              | Token yang sama          |           `401` |  [ ]   |
| OUT-004 | Logout twice with the same token    | Token yang sama 2x       |   `200` / `401` |  [ ]   |
| OUT-005 | Logout with invalid token           | Token acak               |           `401` |  [ ]   |

---

# 6. Unit Tests (Rust)

Dijalankan dengan `cargo test`. Tidak butuh database.

| ID     | Module        | Test Case                                                   | Result |
| ------ | ------------- | ----------------------------------------------------------- | :----: |
| UT-001 | `utils::hash` | hash lalu verify dengan password benar → `true`             |  [ ]   |
| UT-002 | `utils::hash` | verify dengan password salah → `false`                      |  [ ]   |
| UT-003 | `utils::hash` | password sama menghasilkan hash berbeda (salt)              |  [ ]   |
| UT-004 | `utils::hash` | hasil hash berformat PHC (`$argon2...`)                     |  [ ]   |
| UT-005 | `utils::hash` | verify dengan format hash tidak valid → `Err`               |  [ ]   |
| UT-010 | validation    | payload valid lolos `validate()`                            |  [ ]   |
| UT-011 | validation    | email invalid ditolak, error ada di key `email`             |  [ ]   |
| UT-012 | validation    | password terlalu pendek / panjang ditolak                   |  [ ]   |
| UT-013 | validation    | tanpa huruf besar / angka / simbol ditolak                  |  [ ]   |
| UT-014 | validation    | dua field invalid → dua key di `field_errors()`             |  [ ]   |
| UT-020 | `error`       | status code tiap variant `AppError` sesuai                  |  [ ]   |
| UT-021 | `error`       | `Validation` → `422` + JSON `details`                       |  [ ]   |
| UT-022 | `error`       | `DatabaseError` tidak membocorkan detail internal           |  [ ]   |
| UT-023 | `error`       | `ValidationErrors` → `AppError::Validation` (map per field) |  [ ]   |
| UT-030 | `utils::jwt`  | token yang dibuat bisa diverifikasi, `sub` sama             |  [ ]   |
| UT-031 | `utils::jwt`  | token expired / signature salah → `Err`                     |  [ ]   |
