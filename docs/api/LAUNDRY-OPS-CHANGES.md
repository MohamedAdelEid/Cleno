# Laundry Ops Changes

Summary of backend changes for laundry operations (notes, bags, dates, dropdown).

---

## 1. Order Notes — Laundry Board Response

### Problem
Notes could be saved via `POST /api/orders/{slug}/notes`, but were not returned in `GET /api/orders/laundry`.

### Changes

**New files**
- `Cleno.Application/Features/Orders/Admin/OrderNoteMapper.cs` — shared mapping for note DTOs and user resolution
- `Cleno.Application/Features/Orders/Admin/Queries/GetOrderNotes/OrderNoteUserDto.cs` — user object for note author/editor
- `Cleno.Application/Features/Orders/Admin/Commands/UpdateOrderNote/UpdateOrderNoteCommand.cs` — update note handler

**Modified files**
- `GetLaundryOrdersQuery.cs` — added `note` field on each order card
- `OrderNoteDto.cs` — added `UpdatedAt`, `LastModifiedBy`
- `GetOrderNotesQuery.cs` — returns `LastModifiedBy` user object
- `AddOrderNoteCommand.cs` — upsert behavior (creates if none exists, updates latest if one exists)
- `OrdersController.cs` — added `PUT /api/orders/{slug}/notes`

### API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orders/laundry` | Each item now includes `note` (or `null`) |
| `POST` | `/api/orders/{slug}/notes` | Create note, or update if one already exists |
| `PUT` | `/api/orders/{slug}/notes` | Update the latest note for the order |

### Response shape (`note` on laundry card)

```json
{
  "note": {
    "id": "guid",
    "content": "Handle with care...",
    "createdAt": "2026-06-24T22:30:00Z",
    "updatedAt": "2026-06-25T10:00:00Z",
    "authorName": "Sara Al-Harbi",
    "lastModifiedBy": {
      "id": "guid",
      "fullName": "Sara Al-Harbi",
      "email": "sara@example.com",
      "photo": { "path": "...", "url": "..." }
    }
  }
}
```

- `lastModifiedBy` = user who last wrote or edited the note (`UpdatedBy` if edited, otherwise `CreatedBy`).
- If multiple notes exist on an order, the latest one (by `UpdatedAt` or `CreatedAt`) is used.

---

## 2. Bag Quantity on Laundry Board

### Problem
`bags[]` on `GET /api/orders/laundry` had no quantity information.

### Changes

**Modified file**
- `GetLaundryOrdersQuery.cs` — added `quantity` to `LaundryOrderBagDto`

### Behavior
- `quantity` = sum of all assigned item quantities in that bag for the current tab stage.
- Incoming tab uses `Pickup` stage; other tabs use `Processing` stage.
- If a bag has multiple items (e.g. 10 duvets + 15 towels), `quantity` = `25`.

### Response shape

```json
{
  "bags": [
    {
      "bagId": "guid",
      "bagNumber": "PROC-2001",
      "stage": 2,
      "bagStatus": 3,
      "quantity": 25
    }
  ]
}
```

---

## 3. Pickup & Deliver By — Separate Date Fields

### Problem
`pickupTime` and `deliverByTime` returned time only (e.g. `"06:27 PM"`) with no date, so the order date was unclear.

### Changes

**Modified files**
- `GetLaundryOrdersQuery.cs` — added `pickupDate` and `deliverByDate`
- `LaundryOpsHelper.cs` — added `FormatDate()` and `GetDeliverByDate()`

### Response shape

```json
{
  "pickupDate": "2026-06-28",
  "pickupTime": "06:27 PM",
  "deliverByDate": "2026-06-29",
  "deliverByTime": "06:27 PM"
}
```

| Field | Description |
|-------|-------------|
| `pickupDate` | Pickup date (`yyyy-MM-dd`) |
| `pickupTime` | Pickup time |
| `deliverByDate` | Delivery date (pickup date + 1 day) |
| `deliverByTime` | Delivery time (same slot as pickup) |

---

## 4. Bags Dropdown

### Problem
No dropdown endpoint existed for selecting bags (e.g. in the Assign Bags modal).

### Changes

**New file**
- `Cleno.Application/Features/Bags/Queries/GetBagsDropdown/GetBagsDropdownQuery.cs`

**Modified file**
- `BagsController.cs` — added `GET /api/bags/dropdown` (registered before `{slug}` route)

### API

```
GET /api/bags/dropdown
GET /api/bags/dropdown?includeAll=true
```

### Query parameters

| Param | Default | Description |
|-------|---------|-------------|
| `includeAll` | `false` | If `false`, returns active bags with status `Ready` only. If `true`, returns all active bags regardless of status. |

### Response shape

```json
[
  {
    "id": "guid",
    "slug": "proc-2001",
    "number": "PROC-2001",
    "status": 1
  }
]
```

- Sorted by `number` ascending.
- Use `number` as `bagNumber` when calling `POST /api/orders/{slug}/bags`.

---

## Files Touched (Summary)

| File | Change |
|------|--------|
| `OrderNoteMapper.cs` | **New** |
| `OrderNoteUserDto.cs` | **New** |
| `UpdateOrderNoteCommand.cs` | **New** |
| `GetBagsDropdownQuery.cs` | **New** |
| `OrderNoteDto.cs` | Modified |
| `GetOrderNotesQuery.cs` | Modified |
| `AddOrderNoteCommand.cs` | Modified |
| `GetLaundryOrdersQuery.cs` | Modified |
| `LaundryOpsHelper.cs` | Modified |
| `OrdersController.cs` | Modified |
| `BagsController.cs` | Modified |
