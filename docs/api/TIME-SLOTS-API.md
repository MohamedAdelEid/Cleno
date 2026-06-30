# Time Slots — Application Layer & API Reference

This document describes **Time Slots**: admin-managed pickup/delivery windows, the company-facing available-slots list for order creation, and how slots relate to orders.

Related docs:

- [LAUNDRY-ITEMS-API.md](./LAUNDRY-ITEMS-API.md) — Catalog items for order lines
- [ORDERS-ADMIN-API.md](./ORDERS-ADMIN-API.md) — Order management
- [ADMIN-DASHBOARD-API.md](./ADMIN-DASHBOARD-API.md) — System activity feed (`TimeSlots` module)

---

## Application structure

```
Cleno.Application/Features/TimeSlots/
├── Commands/
│   ├── CreateTimeSlot/
│   │   └── CreateTimeSlotCommand.cs
│   ├── UpdateTimeSlot/
│   │   └── UpdateTimeSlotCommand.cs
│   └── ToggleTimeSlotActive/
│       └── ToggleTimeSlotActiveCommand.cs
└── Queries/
    ├── GetAll/
    │   └── GetAllTimeSlotsQuery.cs
    └── GetForEdit/
        └── GetTimeSlotForEditQuery.cs
```

Company order flow reuses the active-only list via:

```
Cleno.Application/Features/Orders/Company/Queries/GetAvailableTimeSlots/
└── GetAvailableTimeSlotsQuery.cs   → delegates to GetAllTimeSlotsQuery { ActiveOnly = true }
```

Domain entity: `Cleno.Domain/Entities/TimeSlot/TimeSlot.cs`

DbSet on `IApplicationDbContext`: `TimeSlots`

Controllers:

| Controller | Routes |
|------------|--------|
| `TimeSlotsController` | `/api/time-slots/*` |
| `OrdersController` | `GET /api/orders/available-time-slots` |

---

## Base URL

| Environment | URL |
|-------------|-----|
| Local HTTP | `http://localhost:5244` |
| Local HTTPS | `https://localhost:7168` |
| Swagger | `/swagger` |

Time slot admin routes:

```
/api/time-slots
```

Company available slots (order form):

```
/api/orders/available-time-slots
```

---

## Authentication

Authorization attributes are currently commented out in the controllers. When enabled, the intended roles are:

| Endpoint | Role |
|----------|------|
| `GET all`, `GET {slug}/for-edit`, create, update, toggle-active | **Admin** |
| `GET /api/orders/available-time-slots` | **Company** |
| `GET /api/time-slots/all` (without admin-only restriction) | Any authenticated user |

Protected routes require:

```
Authorization: Bearer <token>
```

Optional localization header:

```
Accept-Language: en | ar
```

---

## Standard response envelope

All endpoints return a `Result<T>` wrapper:

```json
{
  "isSuccess": true,
  "data": { },
  "error": {
    "code": "",
    "message": ""
  },
  "status": "Success",
  "statusCode": "Success",
  "hasValue": true,
  "message": null
}
```

| HTTP status | Meaning |
|-------------|---------|
| `200` | Success |
| `400` | Bad request / validation |
| `403` | Forbidden |
| `404` | Resource not found |

On success, read the payload from **`data`**. On failure, read **`error.message`**.

---

## Domain model

### TimeSlot

| Property | Type | Notes |
|----------|------|-------|
| `Id` | `Guid` | Primary key |
| `Slug` | `string` | Auto-generated from label |
| `StartTime` | `TimeOnly` | Required |
| `EndTime` | `TimeOnly` | Required; must be after `StartTime` |
| `Label` | `string` | Auto-generated on create/update, max 100 chars |
| `IsActive` | `bool` | Default `true`; inactive slots hidden from company list |
| `DisplayOrder` | `int` | Sort order in lists |
| Audit fields | — | `CreatedAt`, `CreatedBy`, etc. via `AuditableBaseEntity` |

### Label format

On **create** and **update**, the backend sets:

```
{StartTime:hh:mm tt} to {EndTime:hh:mm tt}
```

Example: `"08:00 AM to 12:00 PM"`

Seed data in `01-catalog.sql` may use custom labels (e.g. `"Morning Pickup"`); new slots created via the API always use the time-based format above.

---

## Recommended page load flow

### Admin time slots page

1. **On mount** → `GET /api/time-slots/all` (include inactive for admin UI)
2. **Edit form preload** → `GET /api/time-slots/{slug}/for-edit`
3. **Add slot** → `POST /api/time-slots/create`
4. **Save edit** → `PUT /api/time-slots/{slug}`
5. **Activate / deactivate** → `POST /api/time-slots/toggle-active`

### Company order placement

1. **Load pickup windows** → `GET /api/orders/available-time-slots` (active only)
2. **Create order** → `POST /api/orders/create` with `timeSlotId`

---

## Endpoints

### 1. List all time slots

```
GET /api/time-slots/all
```

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `activeOnly` | bool | `false` | When `true`, returns only `isActive: true` slots |

**Example (admin — show all):**

```
GET /api/time-slots/all
```

**Example (active only):**

```
GET /api/time-slots/all?activeOnly=true
```

**Response `data`:** array sorted by `displayOrder`, then `startTime`:

```json
[
  {
    "id": "11111111-1111-4111-8111-000000000001",
    "slug": "morning-pickup",
    "startTime": "08:00:00",
    "endTime": "12:00:00",
    "label": "Morning Pickup",
    "isActive": true,
    "displayOrder": 1
  }
]
```

**Time serialization:** `startTime` and `endTime` are `TimeOnly` values (`HH:mm:ss`).

**Table column mapping:**

| UI column | Field |
|-----------|-------|
| Label | `label` |
| Start | `startTime` |
| End | `endTime` |
| Order | `displayOrder` |
| Status | `isActive` |
| Edit | use `slug` in `GET .../for-edit` and `PUT .../{slug}` |
| Bulk toggle | use `id` in toggle body |

---

### 2. Get time slot for edit form

```
GET /api/time-slots/{slug}/for-edit
```

**Response `data`:**

```json
{
  "id": "11111111-1111-4111-8111-000000000001",
  "slug": "morning-pickup",
  "startTime": "08:00:00",
  "endTime": "12:00:00",
  "displayOrder": 1,
  "isActive": true
}
```

Does not return `label` — the UI can display a formatted range from `startTime` / `endTime`, or show the label from the list endpoint.

**404:** `Time slot not found.`

---

### 3. Create time slot

```
POST /api/time-slots/create
```

**Body:**

```json
{
  "startTime": "08:00:00",
  "endTime": "12:00:00",
  "displayOrder": 1
}
```

**Validation:**

| Rule | Error (EN) |
|------|------------|
| `endTime` > `startTime` | `End time must be after start time.` |

**Response `data`:** new slot `Guid`

The server sets `label`, `slug`, and `isActive: true` automatically.

Records a system activity: `TimeSlots` / `Created`.

---

### 4. Update time slot

```
PUT /api/time-slots/{slug}
```

**Body:**

```json
{
  "startTime": "09:00:00",
  "endTime": "13:00:00",
  "displayOrder": 2
}
```

Same validation as create. Label (and slug if label changed) are recalculated server-side.

**Response `data`:** `true`

---

### 5. Toggle active status (bulk)

```
POST /api/time-slots/toggle-active
```

Toggles `isActive` for each specified slot.

**Body:**

```json
{
  "timeSlotIds": [
    "11111111-1111-4111-8111-000000000001",
    "11111111-1111-4111-8111-000000000002"
  ]
}
```

**Response `data`:** `true`

Inactive slots are excluded from `GET /api/orders/available-time-slots`.

---

### 6. Available time slots (company order form)

```
GET /api/orders/available-time-slots
```

No query parameters. Equivalent to `GET /api/time-slots/all?activeOnly=true`.

**Response `data`:** same array shape as the list endpoint (`TimeSlotDto`).

Use `id` as `timeSlotId` in the create-order payload.

---

## Order integration

```
POST /api/orders/create
```

```json
{
  "branchId": "guid",
  "pickupDate": "2026-07-01",
  "timeSlotId": "11111111-1111-4111-8111-000000000001",
  "additionalNotes": "Optional",
  "items": [
    {
      "laundryItemId": "22222222-2222-4222-8222-000000000001",
      "quantity": 10
    }
  ]
}
```

The handler validates that `timeSlotId` refers to an **active** time slot before creating the order.

---

## Seed data reference

`Cleno.Persistence/Seeders/Sql/01-catalog.sql` seeds six demo slots:

| Slug | Label | Start | End | DisplayOrder |
|------|-------|-------|-----|--------------|
| `morning-pickup` | Morning Pickup | 08:00 | 12:00 | 1 |
| `midday-pickup` | Midday Pickup | 12:00 | 16:00 | 2 |
| `afternoon-pickup` | Afternoon Pickup | 16:00 | 20:00 | 3 |
| `evening-pickup` | Evening Pickup | 18:00 | 22:00 | 4 |
| `early-morning` | Early Morning | 06:00 | 10:00 | 5 |
| `late-evening` | Late Evening | 20:00 | 23:59 | 6 |

---

## Error messages (localized)

| Scenario | EN | AR |
|----------|----|----|
| End before start | End time must be after start time. | وقت النهاية يجب أن يكون بعد وقت البداية. |
| Not found | Time slot not found. | الفترة الزمنية غير موجودة. |
| Empty bulk ids | At least one time slot must be specified. | يجب تحديد فترة زمنية واحدة على الأقل. |
| Bulk not found | None of the specified time slots were found. | لم يتم العثور على الفترات الزمنية المحددة. |

---

## Frontend notes

- **Display time range:** format `startTime`–`endTime` for dropdowns; show `label` in admin tables when present.
- **Sort order:** respect `displayOrder` from the API — do not re-sort client-side unless adding a user preference.
- **No delete endpoint:** slots are deactivated via `toggle-active` rather than removed, preserving order history references.
- **Overlap:** the API does not prevent overlapping time ranges; validate in the UI if business rules require non-overlapping windows.
