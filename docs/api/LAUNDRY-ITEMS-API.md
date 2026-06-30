# Laundry Items — Application Layer & API Reference

This document describes the **Laundry Items** catalog feature: admin CRUD, activation toggles, and the company-facing catalog used when placing orders.

Related docs:

- [TIME-SLOTS-API.md](./TIME-SLOTS-API.md) — Pickup time windows for order creation
- [ORDERS-ADMIN-API.md](./ORDERS-ADMIN-API.md) — Order flow that references laundry items
- [ADMIN-DASHBOARD-API.md](./ADMIN-DASHBOARD-API.md) — System activity feed (`LaundryItems` module)

---

## Application structure

```
Cleno.Application/Features/LaundryItems/
├── Commands/
│   ├── CreateLaundryItem/
│   │   └── CreateLaundryItemCommand.cs
│   ├── UpdateLaundryItem/
│   │   └── UpdateLaundryItemCommand.cs
│   ├── DeleteLaundryItem/
│   │   └── DeleteLaundryItemCommand.cs
│   └── ToggleLaundryItemActive/
│       └── ToggleLaundryItemActiveCommand.cs
└── Queries/
    ├── GetAll/
    │   └── GetAllLaundryItemsQuery.cs
    └── GetCatalog/
        └── GetLaundryItemsCatalogQuery.cs
```

Domain entities live in `Cleno.Domain/Entities/LaundryItem/`:

| Entity / Enum | File |
|---------------|------|
| `LaundryItem` | `LaundryItem.cs` |
| `LaundryItemCategory` | `LaundryItemCategory.cs` |

DbSet on `IApplicationDbContext`: `LaundryItems`

Controller: `Cleno.API/Controllers/LaundryItemsController.cs`

---

## Base URL

| Environment | URL |
|-------------|-----|
| Local HTTP | `http://localhost:5244` |
| Local HTTPS | `https://localhost:7168` |
| Swagger | `/swagger` |

All Laundry Items routes are prefixed with:

```
/api/laundry-items
```

---

## Authentication

Authorization attributes are currently commented out in the controller. When enabled, the intended roles are:

| Endpoint | Role |
|----------|------|
| `GET admin/all`, create, update, delete, toggle-active | **Admin** |
| `GET catalog` | **Company** (order placement) |

Protected routes require:

```
Authorization: Bearer <token>
```

Optional localization header (error messages may be localized):

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
| `409` | Conflict (duplicate name + category) |

On success, read the payload from **`data`**. On failure, read **`error.message`**.

---

## Pagination (admin list)

`GET /api/laundry-items/admin/all` adds metadata in the response header:

```
X-Pagination: {"currentPage":1,"totalPages":2,"pageSize":50,"totalCount":75,"hasPrevious":false,"hasNext":true}
```

List items are in **`data.items`**.

---

## Domain model

### LaundryItem

| Property | Type | Notes |
|----------|------|-------|
| `Id` | `Guid` | Primary key |
| `Slug` | `string` | Auto-generated from name (unique, max 200) |
| `Name` | `string` | Required, max 200 chars |
| `Category` | `LaundryItemCategory` | Required |
| `Price` | `decimal` | Precision 18,2; must be > 0 |
| `IsActive` | `bool` | Default `true`; inactive items hidden from catalog |
| Audit fields | — | `CreatedAt`, `CreatedBy`, etc. via `FullyAuditedBaseEntity` |

**Uniqueness rule:** `Name` + `Category` must be unique among non-deleted items.

**Delete behavior:** Soft delete (`IsDeleted = true`).

---

## Enums

### LaundryItemCategory

| Value | Name | UI label (EN) |
|------:|------|---------------|
| `1` | `Wash` | Wash |
| `2` | `Iron` | Iron |
| `3` | `WashAndIron` | Wash & Iron |

Send as integer in JSON request bodies and query strings.

---

## Recommended page load flow

### Admin catalog page

1. **On mount / filter / search / page change** → `GET /api/laundry-items/admin/all`
2. **Add item** → `POST /api/laundry-items/create`
3. **Edit row** → `PUT /api/laundry-items/{slug}`
4. **Deactivate / activate** → `POST /api/laundry-items/toggle-active`
5. **Delete selected** → `DELETE /api/laundry-items`

### Company order placement

1. **Load catalog** → `GET /api/laundry-items/catalog` (active items only)
2. **Create order** → `POST /api/orders/create` with `items[].laundryItemId` and `quantity`

---

## Endpoints

### 1. List laundry items (admin table)

```
GET /api/laundry-items/admin/all
```

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `pageNumber` | int | `1` | Page number |
| `pageSize` | int | `50` | Rows per page |
| `keyword` | string | — | Search by name or slug |
| `category` | int | — | `1` = Wash, `2` = Iron, `3` = Wash & Iron |
| `isActive` | bool | — | `true` = active, `false` = inactive |
| `sortBy` | string | `createdAt` | `name`, `category`, `price`, `createdAt` |
| `sortDirection` | string | `desc` | `asc` or `desc` |

**Example:**

```
GET /api/laundry-items/admin/all?pageNumber=1&pageSize=20&category=1&isActive=true&sortBy=price&sortDirection=asc
```

**Response `data`:**

```json
{
  "items": [
    {
      "id": "22222222-2222-4222-8222-000000000001",
      "slug": "bed-sheet-wash",
      "name": "Bed Sheet Wash",
      "category": 1,
      "price": 12.00,
      "isActive": true,
      "createdAt": "2025-06-30T10:00:00Z"
    }
  ]
}
```

**Table column mapping:**

| UI column | Field |
|-----------|-------|
| Name | `name` |
| Category | `category` (map via enum table) |
| Price | `price` |
| Status | `isActive` |
| Created | `createdAt` |
| Edit action | use `slug` in `PUT /api/laundry-items/{slug}` |
| Bulk actions | use `id` in toggle/delete bodies |

---

### 2. Get catalog (company order form)

```
GET /api/laundry-items/catalog
```

No query parameters. Returns **active items only**, sorted by name then category.

**Response `data`:** array of:

```json
[
  {
    "id": "22222222-2222-4222-8222-000000000001",
    "name": "Bed Sheet Wash",
    "category": 1,
    "price": 12.00
  }
]
```

**Notes:**

- No `slug` or `isActive` in this DTO — use `id` when building the create-order payload.
- Line total = `price × quantity` (computed on the client or from order response).

---

### 3. Create laundry item

```
POST /api/laundry-items/create
```

**Body:**

```json
{
  "name": "Bed Sheet Wash",
  "category": 1,
  "price": 12.00
}
```

**Validation:**

| Rule | Error (EN) |
|------|------------|
| Name required | `Item name is required.` |
| Price > 0 | `Price must be greater than zero.` |
| Unique name + category | `An item with this name and category already exists.` |

**Response `data`:** new item `Guid`

Records a system activity: `LaundryItems` / `Created`.

---

### 4. Update laundry item

```
PUT /api/laundry-items/{slug}
```

**Body:**

```json
{
  "name": "Bed Sheet Wash",
  "category": 1,
  "price": 14.00
}
```

`slug` in the URL identifies the item. Same validation rules as create.

When the name changes, the slug is regenerated automatically.

**Response `data`:** `true`

---

### 5. Toggle active status (bulk)

```
POST /api/laundry-items/toggle-active
```

Toggles `isActive` for each specified item (active → inactive, inactive → active).

**Body:**

```json
{
  "laundryItemIds": [
    "22222222-2222-4222-8222-000000000001",
    "22222222-2222-4222-8222-000000000002"
  ]
}
```

**Response `data`:** `true`

---

### 6. Delete laundry items (bulk, soft delete)

```
DELETE /api/laundry-items
```

**Body:**

```json
{
  "laundryItemIds": [
    "22222222-2222-4222-8222-000000000001"
  ]
}
```

**Response `data`:** `true`

Items are soft-deleted and no longer appear in admin list or catalog queries.

---

## Order integration

When a company creates an order, each line references a catalog item by id:

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

The handler validates that each `laundryItemId` exists and is active before creating `OrderItem` rows with a snapshot of name, category, unit price, and quantity.

---

## Seed data reference

See `Cleno.Persistence/Seeders/Sql/01-catalog.sql` for demo laundry items (Wash / Iron / Wash & Iron examples).

---

## Error messages (localized)

| Scenario | EN | AR |
|----------|----|----|
| Name missing | Item name is required. | اسم العنصر مطلوب. |
| Invalid price | Price must be greater than zero. | يجب أن يكون السعر أكبر من صفر. |
| Duplicate | An item with this name and category already exists. | عنصر بهذا الاسم والفئة موجود بالفعل. |
| Not found (update) | Laundry item not found. | العنصر غير موجود. |
| Empty bulk ids | At least one laundry item must be specified. | يجب تحديد عنصر واحد على الأقل. |
| Bulk not found | None of the specified laundry items were found. | لم يتم العثور على العناصر المحددة. |
