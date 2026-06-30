# Frontend API Handoff — Recent Backend Changes

This document summarizes **new endpoints** and **breaking/behavior changes** from the latest backend work. Share with the frontend team for integration.

---

## Base URL

| Environment | URL |
|-------------|-----|
| Local HTTP | `http://localhost:5244` |
| Local HTTPS | `https://localhost:7168` |
| Swagger | `/swagger` |

Optional localization header (error messages may be localized):

```
Accept-Language: en | ar
```

Protected routes require:

```
Authorization: Bearer <token>
```

---

## 1. New endpoints

### Get company for edit form

Populates the **edit company** form using the same field names as create.

```
GET /api/Companies/{slug}/for-edit
```

**Response (`data`):**

```json
{
  "id": "guid",
  "slug": "al-faisal-hotel",
  "businessName": "Al Faisal Hotel",
  "mainContactPerson": "Faisal Al-Dosari",
  "phone": "+9665...",
  "photo": {
    "path": "uploads/...",
    "url": "https://.../uploads/..."
  },
  "email": "alfaisalhotel@demo.cleno.sa",
  "type": "Hotel",
  "address": "...",
  "googleMapLink": "https://maps.google.com/...",
  "commercialRegistration": "1010010001",
  "parentCompanyId": null
}
```

**Save:** `PUT /api/Companies/{slug}` with the same body shape as create (see section 4).

---

### Get permissions assigned to a role

Returns permissions **already linked** to a role, grouped by module (same shape as `GET /api/Permissions`).

```
GET /api/Roles/{slug}/permissions
```

**Response (`data`):**

```json
{
  "roleId": "guid",
  "roleSlug": "admin",
  "roleName": "Admin",
  "permissionGroups": [
    {
      "module": "Companies",
      "permissions": [
        {
          "id": "guid",
          "name": "View Companies",
          "action": "View"
        }
      ]
    }
  ]
}
```

**Related (existing):**

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/Permissions` | All permissions (for picker UI) |
| `POST` | `/api/Roles/{slug}/permissions` | Assign permissions — body: `["permissionGuid", ...]` |

---

## 2. Updated endpoints

### `GET /api/Roles/all`

Each role in `items[]` and each role in `stats.featuredRoles[]` now includes a **user preview list**.

```json
{
  "stats": {
    "totalRoles": 5,
    "activeRoles": 4,
    "inactiveRoles": 1,
    "featuredRoles": [
      {
        "id": "guid",
        "slug": "admin",
        "name": "Admin",
        "permissionsCount": 12,
        "usersCount": 8,
        "users": [
          {
            "id": "guid",
            "fullName": "Sara Al-Qahtani",
            "email": "ops.manager@demo.cleno.sa",
            "initials": "SA",
            "photo": {
              "path": "...",
              "url": "https://..."
            },
            "isActive": true
          }
        ],
        "remainingUsersCount": 5,
        "isActive": true,
        "displayOrder": 1
      }
    ]
  },
  "items": []
}
```

| Field | Notes |
|-------|-------|
| `users` | Up to **3** users per role |
| `remainingUsersCount` | `usersCount - users.length` (users not shown in preview) |

---

### `POST /api/Companies/create` — commercial registration optional

`commercialRegistration` is **optional** on admin create.

- Omit or send empty/whitespace → stored as `null`
- Duplicate check runs **only when a value is provided**

**Request body:**

```json
{
  "businessName": "...",
  "mainContactPerson": "...",
  "phone": "...",
  "photo": "uploads/photo.jpg",
  "email": "...",
  "password": "...",
  "type": "Hotel",
  "address": "...",
  "googleMapLink": "...",
  "commercialRegistration": null,
  "parentCompanyId": null
}
```

---

## 3. Breaking change — `photo` is now an object on reads

### TypeScript model

```typescript
interface ImageDto {
  path: string | null; // stored value — send this back on create/update
  url: string;          // full URL — use for display (<img src>)
}
```

### Write (create / update) — still a string

Send the **path** from upload (or `photo.path` when editing):

```json
{
  "photo": "uploads/companies/abc.jpg"
}
```

### Read (GET) — object

| Endpoint | Field |
|----------|--------|
| `GET /api/Companies/admin/all` | `photo` |
| `GET /api/Companies/{slug}` | `photo` |
| `GET /api/Companies/{slug}/for-edit` | `photo` |
| `GET /api/Drivers/admin/all` | `photo` |
| `GET /api/Drivers/admin/{slug}` | `photo` |
| `POST /api/Auth/login` | `user.photo` |
| `POST /api/Auth/google-login` | `user.photo` |
| `POST /api/Auth/refresh-token` | `user.photo` |
| `GET /api/Roles/all` | `items[].users[].photo`, `stats.featuredRoles[].users[].photo` |

### Frontend pattern

```typescript
// Display
<img src={user.photo?.url} alt="" />

// Edit form / save payload
form.photo = company.photo?.path ?? '';
```

Upload flow is unchanged: `POST /api/Upload/upload` → use returned path in create/update body.

---

## 4. Company field name reference

| Form label | API property | Notes |
|------------|--------------|-------|
| Business name | `businessName` | Create, for-edit, update |
| Main contact | `mainContactPerson` | |
| Phone | `phone` | |
| Photo | `photo` | String on write; `ImageDto` on read |
| Email | `email` | |
| Password | `password` | Create only |
| Type | `type` | |
| Address | `address` | |
| Google map | `googleMapLink` | |
| CR number | `commercialRegistration` | Optional on create |
| Parent company | `parentCompanyId` | Branch only |

**Note:** `GET /api/Companies/{slug}` (detail/view) still uses **`name`**, not `businessName`.

---

## 5. Demo data (testing)

Demo accounts use `@demo.cleno.sa`. Password for all: **`Demo@123`**.

| Email | Role |
|-------|------|
| `ops.manager@demo.cleno.sa` | Admin |
| `alfaisalhotel@demo.cleno.sa` | Company |
| `driver01@demo.cleno.sa` | Driver |
| `user01@demo.cleno.sa` | User |

Demo data is loaded via SQL scripts on the backend (not via API seeder).

---

## 6. Frontend checklist

- [ ] Edit company: `GET /api/Companies/{slug}/for-edit` → bind form → `PUT /api/Companies/{slug}`
- [ ] Display photos with `photo.url`; save with `photo.path`
- [ ] Create company: `commercialRegistration` can be empty/null
- [ ] Role permissions UI: `GET /api/Roles/{slug}/permissions`
- [ ] Roles list: use `users[]` + `remainingUsersCount` for avatar stacks
- [ ] Update TypeScript interfaces: replace `photo: string` with `photo: ImageDto | null` on all affected GET models
