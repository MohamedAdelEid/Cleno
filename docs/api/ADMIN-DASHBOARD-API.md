# Admin Dashboard — API Integration Guide

This document describes the backend APIs for the **Admin Dashboard** page: KPI stat cards, daily order volume chart, active drivers, alerts, recent orders table, and the latest updates activity feed.

---

## Base URL

| Environment | URL |
|-------------|-----|
| Local HTTP | `http://localhost:5244` |
| Local HTTPS | `https://localhost:7168` |
| Swagger | `/swagger` |

All dashboard routes are prefixed with:

```
/api/dashboard
```

---

## Authentication

Authorization attributes are currently **commented out** in development. When enabled, dashboard endpoints will require the **Admin** role and a valid JWT in:

```
Authorization: Bearer <token>
```

Optional localization header (if configured):

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
| `400` | Bad request / validation / business rule |
| `403` | Forbidden / unauthorized |
| `404` | Not found |

On success, read the payload from **`data`**.

---

## Dashboard page → API mapping

| UI section | Endpoint |
|------------|----------|
| 9 KPI stat cards (top grid) | `GET /api/dashboard/kpis` |
| Daily Order Volume chart | `GET /api/dashboard/order-volume` |
| Active Drivers list | `GET /api/dashboard/active-drivers` |
| Alerts widget | `GET /api/dashboard/alerts` |
| Recent Orders table | `GET /api/dashboard/recent-orders` |
| Latest Updates feed | `GET /api/dashboard/activity` |

---

## 1. KPI stat cards

```
GET /api/dashboard/kpis
```

No query parameters.

### Response `data`

```json
{
  "activeOrders":    { "count": 128, "deltaPercent": 12.4, "sparkline": [10,12,9,14,11,8,15,13,11] },
  "inLaundry":       { "count": 43,  "deltaPercent": 3.8,  "sparkline": [8,9,7,10,11,9,12,10,9] },
  "outstanding":     { "count": 6,   "deltaPercent": -4.2, "overdueCount": 2, "sparkline": [3,4,3,5,4,3,6,5,4] },
  "activeCustomers": { "count": 284, "deltaPercent": 5.2,  "sparkline": [20,22,21,24,23,22,25,24,23] },
  "bagsCirculating": { "count": 1420,"deltaPercent": 2.1,  "sparkline": [100,110,105,115,120,118,125,130,128] },
  "readyForPickup":  { "count": 18,  "deltaPercent": 6.1,  "sparkline": [2,3,2,4,3,2,5,4,3] },
  "outForDelivery":  { "count": 26,  "deltaPercent": 4.3,  "sparkline": [3,4,3,5,4,3,6,5,4] },
  "delayedOrders":   { "count": 7,   "deltaPercent": 1.8,  "criticalCount": 2, "sparkline": [1,2,1,3,2,1,4,3,2] },
  "openIncidents":   { "count": 3,   "deltaPercent": -25.0,"escalatedCount": 1, "sparkline": [1,1,2,1,2,1,3,2,1] }
}
```

### Card definitions

| Field | UI label | Description |
|-------|----------|-------------|
| `activeOrders` | Active Orders | Orders in statuses 1–4 (not delivered/cancelled) |
| `inLaundry` | In Laundry | Orders with status `InLaundry` (3) |
| `outstanding` | Outstanding | Orders with payment `Pending` or `Overdue`; `overdueCount` = `Overdue` only |
| `activeCustomers` | Active Customers | Distinct companies with active orders |
| `bagsCirculating` | Bags Circulating | Bags where status ≠ `Ready` |
| `readyForPickup` | Ready for Pickup | Orders with status `ReadyForDelivery` (4) |
| `outForDelivery` | Out for Delivery | Orders with status `PickedUp` (2) |
| `delayedOrders` | Delayed Orders | Active orders past pickup date; `criticalCount` = overdue ≥ 2 days |
| `openIncidents` | Open Incidents | All incidents; `escalatedCount` = DamagedBag / MissingItems |

### KPI card shape

```ts
interface DashboardKpiCard {
  count: number;
  deltaPercent: number;   // vs same metric 7 days ago
  sparkline: number[];    // last 9 days, oldest first
}

interface DashboardOutstandingKpi extends DashboardKpiCard {
  overdueCount: number;
}

interface DashboardDelayedKpi extends DashboardKpiCard {
  criticalCount: number;
}

interface DashboardIncidentsKpi extends DashboardKpiCard {
  escalatedCount: number;
}
```

Static UI subtext (e.g. `"currently in system"`, `"being processed"`) is **frontend-only** — not returned by the API.

---

## 2. Daily order volume

```
GET /api/dashboard/order-volume?period=last-14-days
```

### Query parameters

| Param | Type | Default | Values |
|-------|------|---------|--------|
| `period` | string | `last-14-days` | `last-week` (7 days), `last-14-days` (14 days), `last-month` (30 days) |

### Response `data`

```json
{
  "totalOrders": 809,
  "deltaPercent": 7.6,
  "avgPerDay": 58,
  "peakDay": "Sun",
  "peakCount": 77,
  "series": [
    { "label": "Tue", "date": "2026-06-16", "count": 45 },
    { "label": "Wed", "date": "2026-06-17", "count": 52 },
    { "label": "Mon", "date": "2026-06-29", "count": 77 }
  ]
}
```

| Field | UI usage |
|-------|----------|
| `totalOrders` | Large total number |
| `deltaPercent` | `+7.6% vs previous period` |
| `avgPerDay` | `Avg / day: 58` |
| `peakDay` + `peakCount` | `Peak day: Sun (77)` |
| `series` | Bar chart — one bar per day in the selected period |

`deltaPercent` compares the current window to the immediately preceding window of equal length.

---

## 3. Active drivers

```
GET /api/dashboard/active-drivers
```

No query parameters.

### Response `data`

```json
{
  "drivers": [
    {
      "slug": "khalid-hassan",
      "name": "Khalid Hassan",
      "photo": "https://localhost:7168/upload/...",
      "status": "OnDelivery",
      "currentOrderNumber": "ORD-2841",
      "currentOrderSlug": "ord-2841",
      "taskCount": 1
    },
    {
      "slug": "faisal-nasser",
      "name": "Faisal Nasser",
      "photo": null,
      "status": "Available",
      "currentOrderNumber": null,
      "currentOrderSlug": null,
      "taskCount": 0
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| `status` | `"OnDelivery"` if driver has ≥1 active order, else `"Available"` |
| `currentOrderNumber` / `currentOrderSlug` | Most recent active order (status `PickedUp` or `ReadyForDelivery`) |
| `taskCount` | Count of active orders assigned to the driver |

**View all** → use `GET /api/drivers/admin/all`.

---

## 4. Alerts

```
GET /api/dashboard/alerts?limit=10
```

### Query parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | int | `10` | Max alerts returned |

### Response `data`

Array of alert objects (newest first):

```json
[
  {
    "type": "DelayedOrder",
    "orderNumber": "ORD-2835",
    "orderSlug": "ord-2835",
    "message": "Past estimated delivery window by 2h 15m",
    "occurredAt": "2026-06-09T10:15:00Z"
  },
  {
    "type": "IssueReported",
    "orderNumber": "ORD-2820",
    "orderSlug": "ord-2820",
    "message": "Customer reported missing bag tag on pickup",
    "occurredAt": "2026-06-09T09:51:00Z"
  },
  {
    "type": "OpenIncident",
    "orderNumber": "ORD-2830",
    "orderSlug": "ord-2830",
    "message": "Damaged items claim — awaiting laundry review",
    "occurredAt": "2026-06-09T09:30:00Z"
  }
]
```

### Alert types

| `type` | Source |
|--------|--------|
| `DelayedOrder` | Active orders past pickup date |
| `IssueReported` | Incidents created in last 24h (stage `Incoming`) |
| `OpenIncident` | DamagedBag / MissingItems on non-delivered orders |

Format relative time (`"18 minutes ago"`) on the **frontend** from `occurredAt`.

---

## 5. Recent orders

```
GET /api/dashboard/recent-orders?limit=10
```

### Query parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | int | `10` | Number of latest orders |

### Response `data`

```json
[
  {
    "order": {
      "slug": "ord-2841",
      "number": "ORD-2841",
      "pickupDate": "2026-06-09",
      "expectedDeliveryDate": "2026-06-10",
      "status": 2,
      "statusLabel": "On the way to Laundry"
    },
    "customer": {
      "name": "Ahmed Al-Rashid"
    },
    "branch": {
      "slug": "downtown-branch",
      "name": "Downtown Branch"
    },
    "bags": {
      "count": 3
    },
    "driver": {
      "slug": "khalid-hassan",
      "name": "Khalid Hassan",
      "photo": null
    }
  },
  {
    "order": {
      "slug": "ord-2839",
      "number": "ORD-2839",
      "pickupDate": "2026-06-09",
      "expectedDeliveryDate": "2026-06-10",
      "status": 1,
      "statusLabel": "Order Created"
    },
    "customer": { "name": "Sara Mohammed" },
    "branch": { "slug": "marina-branch", "name": "Marina Branch" },
    "bags": { "count": 2 },
    "driver": null
  }
]
```

### Order status enum

| Value | `statusLabel` |
|-------|---------------|
| `1` | Order Created |
| `2` | On the way to Laundry |
| `3` | In Laundry |
| `4` | Ready for Delivery |
| `5` | Delivered |
| `6` | Cancelled |

`expectedDeliveryDate` = `pickupDate + 1 day`.

`bags.count` = distinct bags assigned via `OrderBagItems`.

### Row actions (frontend)

| Action | API |
|--------|-----|
| View order | `GET /api/orders/admin/{slug}` |
| View customer | `GET /api/Companies/{slug}` |
| Copy order ID | Client-side clipboard from `order.number` |

**View all / sorting** → `GET /api/orders/admin/all`.

---

## 6. Latest updates (activity feed)

```
GET /api/dashboard/activity?period=this-week&search=&limit=50
```

Powered by the global **`SystemActivities`** table (all system events, not company-only).

### Query parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | string | `this-week` | `today`, `yesterday`, `this-week` |
| `date` | DateOnly | — | e.g. `2026-06-15` — overrides `period` when set |
| `search` | string | — | Filters `title` and `description` (case-insensitive) |
| `module` | int | — | Filter by `SystemActivityModule` enum (see below) |
| `action` | int | — | Filter by `SystemActivityAction` enum (see below) |
| `limit` | int | `50` | Max items returned |

### Response `data`

```json
{
  "totalCount": 12,
  "items": [
    {
      "type": "OrderUpdated",
      "module": 1,
      "action": 4,
      "title": "Order Updated",
      "description": "Order ORD-2319 status changed to In Laundry",
      "occurredAt": "2026-06-29T08:15:00Z",
      "timeLabel": "08:15 AM"
    },
    {
      "type": "NewCustomerAdded",
      "module": 2,
      "action": 11,
      "title": "New Customer Added",
      "description": "Ahmed Hassan registered as a new client",
      "occurredAt": "2026-06-29T09:45:00Z",
      "timeLabel": "09:45 AM"
    },
    {
      "type": "SlaBreachRisk",
      "module": 10,
      "action": 16,
      "title": "SLA Breach Risk",
      "description": "Order ORD-2298 approaching delivery deadline",
      "occurredAt": "2026-06-29T08:15:00Z",
      "timeLabel": "08:15 AM"
    }
  ]
}
```

`totalCount` = all matching activities in the date window (before `limit`).

Use `type` for icon/color mapping on the frontend.

### Activity `type` values (dashboard UI keys)

| `type` | Typical event |
|--------|---------------|
| `NewCustomerAdded` | Company registered |
| `CompanyApproved` | Company approved |
| `CompanyRejected` | Company rejected |
| `BranchCreated` | Branch created |
| `OrderCreated` | New order |
| `OrderUpdated` | Order status changed |
| `OrderCompleted` | Order delivered |
| `StaffReassigned` | Driver assigned to order |
| `IssueReported` | Incident created / updated |
| `InvoiceGenerated` | Invoice generated on delivery |
| `PaymentReceived` | Payment received |
| `OrderNoteAdded` | Order note added |
| `UserCreated` / `UserUpdated` / `UserStatusChanged` / `UserDeleted` | User admin actions |
| `DriverCreated` / `DriverUpdated` / `DriverStatusChanged` / `DriverDeleted` | Driver admin actions |
| `BagCreated` / `BagUpdated` / `BagDeleted` | Bag admin actions |
| `LaundryItemCreated` / `LaundryItemUpdated` / `LaundryItemDeleted` | Catalog changes |
| `TimeSlotCreated` / `TimeSlotUpdated` | Time slot changes |
| `RoleCreated` / `RoleUpdated` / `RoleUserAssigned` / `RoleUserUnassigned` / `RoleDeleted` | Role admin actions |
| `SlaBreachRisk` | SLA breach warning |
| `Activity` | Fallback |

### SystemActivityModule enum

| Value | Name |
|-------|------|
| `1` | Orders |
| `2` | Companies |
| `3` | Drivers |
| `4` | Bags |
| `5` | Users |
| `6` | Incidents |
| `7` | LaundryItems |
| `8` | TimeSlots |
| `9` | Roles |
| `10` | System |

### SystemActivityAction enum

| Value | Name |
|-------|------|
| `1` | Created |
| `2` | Updated |
| `3` | Deleted |
| `4` | StatusChanged |
| `5` | Assigned |
| `6` | Unassigned |
| `7` | Approved |
| `8` | Rejected |
| `9` | Activated |
| `10` | Deactivated |
| `11` | Registered |
| `12` | NoteAdded |
| `13` | ReplyAdded |
| `14` | InvoiceGenerated |
| `15` | PaymentReceived |
| `16` | SlaBreachRisk |
| `17` | Completed |

---

## Recommended load sequence

For the dashboard page on mount:

```text
1. GET /api/dashboard/kpis
2. GET /api/dashboard/order-volume?period=last-14-days
3. GET /api/dashboard/active-drivers
4. GET /api/dashboard/alerts?limit=10
5. GET /api/dashboard/recent-orders?limit=10
6. GET /api/dashboard/activity?period=this-week&limit=50
```

All six calls are independent and can run in parallel.

When the user changes the order-volume filter:

```text
GET /api/dashboard/order-volume?period=last-week
```

When the user changes the activity period / search:

```text
GET /api/dashboard/activity?period=today
GET /api/dashboard/activity?date=2026-06-15
GET /api/dashboard/activity?period=this-week&search=ORD-2319
```

---

## Related endpoints (not under `/api/dashboard`)

| UI need | Endpoint |
|---------|----------|
| Full orders list + sorting | `GET /api/orders/admin/all` |
| Full drivers list | `GET /api/drivers/admin/all` |
| Order detail | `GET /api/orders/admin/{slug}` |
| Company profile | `GET /api/Companies/{slug}` |
| Company activity (company-scoped) | `GET /api/Companies/{slug}/activity` |
| Legacy orders dashboard chart | `GET /api/orders/admin/dashboard` (different shape — KPIs + fulfillment chart) |

---

## Company profile — activity changes (breaking)

The **SystemActivities** rollout also updates company-scoped activity on the company profile page. These are **not** under `/api/dashboard`, but frontend teams integrating the admin dashboard should be aware of them.

### Affected endpoints

| Endpoint | Field | Change |
|----------|-------|--------|
| `GET /api/Companies/{slug}` | `recentActivity[]` | Updated shape + new data source |
| `GET /api/Companies/{slug}/activity` | `items[]` | Updated shape + new data source |

### Unchanged company endpoints

The rest of the company profile API is **unchanged** (same keys):

- `GET /api/Companies/{slug}` — header, `stats`, `companyInfo`, `financialSummary`, `recentOrders`, `recentInvoices`
- `GET /api/Companies/{slug}/orders`
- `GET /api/Companies/{slug}/invoices`
- `GET /api/Companies/{slug}/branches`
- `GET /api/Companies/admin/all`, approve/reject, etc.

Command responses (POST/PUT/DELETE) for companies are also unchanged.

### Data source

| Before | After |
|--------|-------|
| `CompanyActivities` table | `SystemActivities` table |
| Filtered by `CompanyId` | Filtered by `CompanyId` (same behaviour) |

Existing `CompanyActivities` rows are **backfilled** into `SystemActivities` by the `AddSystemActivities` migration. New events are written only to `SystemActivities`.

### Updated activity item shape

Used in both `recentActivity[]` (profile overview) and `items[]` (activity tab):

```json
{
  "id": "guid",
  "type": "orders_created",
  "module": 1,
  "action": 1,
  "title": "Order Created",
  "description": "New order ORD-DEMO-2025-0001 created",
  "performedBy": "System",
  "entityType": 1,
  "entityId": "guid",
  "occurredAt": "2025-02-25T10:00:00Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | guid | Activity record ID |
| `type` | string | Snake-case key: `{module}_{action}` (see migration table below) |
| `module` | int | `SystemActivityModule` enum — **new field** |
| `action` | int | `SystemActivityAction` enum — **new field** |
| `title` | string | Display headline |
| `description` | string | Detail text |
| `performedBy` | string | User full name, or `"System"` |
| `entityType` | int | `SystemActivityEntityType` enum |
| `entityId` | guid? | Linked entity ID |
| `occurredAt` | datetime | UTC timestamp |

### `type` string migration (breaking)

Company activity uses **`{module}_{action}`** in snake_case (e.g. `orders_created`).

The admin dashboard activity feed (section 6) uses a separate **PascalCase UI key** in `type` (e.g. `OrderCreated`, `NewCustomerAdded`) via `ToDashboardTypeKey`. Do not reuse company `type` strings on the dashboard feed.

| Old `type` (deprecated) | New `type` | `module` | `action` |
|-------------------------|------------|----------|----------|
| `company_registered` | `companies_registered` | 2 | 11 |
| `company_approved` | `companies_approved` | 2 | 7 |
| `branch_created` | `companies_created` | 2 | 1 |
| `order_created` | `orders_created` | 1 | 1 |
| `driver_assigned` | `orders_assigned` | 1 | 5 |
| `order_picked_up` | `orders_statuschanged` | 1 | 4 |
| `order_in_laundry` | `orders_statuschanged` | 1 | 4 |
| `order_ready` | `orders_statuschanged` | 1 | 4 |
| `order_delivered` | `orders_completed` | 1 | 17 |
| `order_cancelled` | `orders_statuschanged` | 1 | 4 |
| `invoice_generated` | `orders_invoicegenerated` | 1 | 14 |
| `incident_reported` | `incidents_created` | 6 | 1 |
| `payment_received` | `orders_paymentreceived` | 1 | 15 |

**Frontend action:** update icon/color maps from the old single-event keys to the new `module` + `action` pair (or the new `type` string).

### `entityType` on company activity

Values **1–4 are unchanged** for company-scoped events:

| Value | Entity |
|-------|--------|
| `1` | Order |
| `2` | Incident |
| `3` | Company |
| `4` | Branch |

The full `SystemActivityEntityType` enum also defines Driver (5), Bag (6), User (7), etc., but those typically **do not appear** on company activity responses because those events have no `companyId`.

### Company activity tab (paginated)

```
GET /api/Companies/{slug}/activity?pageNumber=1&pageSize=20
```

| Query | Type | Default |
|-------|------|---------|
| `pageNumber` | int | `1` |
| `pageSize` | int | `20` |

Response uses standard pagination (`data.items[]` + `X-Pagination` header). Each item matches the activity shape above.

### Profile overview preview

`GET /api/Companies/{slug}` includes `recentActivity` — same item shape, limited to **5** most recent entries (no pagination).

### Example: activity tab response

```json
{
  "isSuccess": true,
  "data": {
    "items": [
      {
        "id": "guid",
        "type": "orders_assigned",
        "module": 1,
        "action": 5,
        "title": "Staff Reassigned",
        "description": "Driver Ahmed Al-Rashid assigned to ORD-DEMO-2025-0006",
        "performedBy": "Sara Al-Qahtani",
        "entityType": 1,
        "entityId": "guid",
        "occurredAt": "2026-06-27T09:00:00Z"
      }
    ]
  }
}
```

### Dashboard vs company activity — quick comparison

| | Admin dashboard feed | Company profile activity |
|--|----------------------|--------------------------|
| Endpoint | `GET /api/dashboard/activity` | `GET /api/Companies/{slug}/activity` |
| Scope | **All** system events | Events for **one company** (`companyId`) |
| `type` format | PascalCase UI key (`OrderUpdated`) | Snake-case (`orders_statuschanged`) |
| Extra fields | `timeLabel` | `performedBy`, `entityId` |
| Filters | `period`, `date`, `search`, `module`, `action`, `limit` | `pageNumber`, `pageSize` |

### What did NOT change elsewhere

No response key changes on:

- Orders, users, drivers, bags, incidents, laundry, roles, or time-slots **GET** endpoints
- Any existing command success payloads

System activity is **write-only** for those modules unless you read the global or company activity endpoints.

See also: [COMPANIES-PROFILE-API.md](./COMPANIES-PROFILE-API.md) (company page integration; activity section should use the shapes above).

---

## Database setup

Apply the `SystemActivities` migration before using the activity feed:

```bash
dotnet ef database update --project Cleno.Persistence --startup-project Cleno.API
```

Optional demo seed for extra system activities:

```
Cleno.Persistence/Seeders/Sql/10-system-activities.sql
```
