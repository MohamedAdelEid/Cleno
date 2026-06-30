# Operational Bags Page — API Integration Guide

This document describes the backend APIs for the **Operational Bags** admin page (KPI cards, table, create/edit/delete, and bag details). Use it for frontend integration.

---

## Base URL

| Environment | URL |
|-------------|-----|
| Local HTTP | `http://localhost:5244` |
| Local HTTPS | `https://localhost:7168` |
| Swagger | `/swagger` |

All Bags routes are prefixed with:

```
/api/Bags
```

---

## Authentication

All Bags endpoints require the **Admin** role and a valid JWT:

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
| `400` | Bad request / validation / business rule / conflict |
| `403` | Forbidden (not Admin or invalid token) |
| `404` | Resource not found |

On success, read the payload from **`data`**. On failure, read **`error.message`**.

---

## Pagination (table endpoint)

`GET /api/Bags/admin/all` adds metadata in the response header:

```
X-Pagination: {"currentPage":1,"totalPages":2,"pageSize":8,"totalCount":12,"hasPrevious":false,"hasNext":true}
```

The response body uses the `Result<T>` shape; list items are in **`data.items`**.

---

## Enums

### BagStatus (Operational status)

Used in filters, table badges, and update requests as **`operationalStatus`** (list/details) or **`status`** (update body).

| Value | Name | UI label (EN) | Badge color (from design) |
|------:|------|---------------|---------------------------|
| `1` | Ready | Ready | Green |
| `2` | Assigned | Assigned | Light blue |
| `3` | Processing | Processing | Purple |
| `4` | OnTheWay | On the way | Blue |
| `5` | InTransit | In transit | Yellow |
| `6` | Missing | Missing | Red |

### System status

Not an enum — use **`isActive`** (`boolean`):

| Value | UI label |
|-------|----------|
| `true` | Active |
| `false` | Inactive |

### OrderStatus (bag details — current order only)

| Value | Name |
|------:|------|
| `1` | OrderCreated |
| `2` | PickedUp |
| `3` | InLaundry |
| `4` | ReadyForDelivery |
| `5` | Delivered |
| `6` | Cancelled |

---

## Recommended page load flow

The stats cards and table are **separate endpoints** so you can load them independently:

1. **On page mount** → `GET /api/Bags/admin/stats` (KPI cards + sparklines)
2. **On mount / filter / search / page change** → `GET /api/Bags/admin/all` (table)
3. **View details action** → `GET /api/Bags/{slug}`
4. **Create bag button** → `POST /api/Bags/create`
5. **Edit action** → `PUT /api/Bags/{slug}`
6. **Delete action** → `DELETE /api/Bags/{slug}`

---

## Endpoints

### 1. KPI stats (Inventory + Operations cards)

```
GET /api/Bags/admin/stats
```

No query parameters.

**Response `data`:**

```json
{
  "totalBags":    { "count": 12, "trend": [0, 1, 0, 2, 1, 0, 1] },
  "activeBags":   { "count": 10, "trend": [0, 1, 0, 2, 1, 0, 0] },
  "inactiveBags": { "count": 2,  "trend": [0, 0, 0, 0, 0, 1, 1] },
  "assignedBags": { "count": 2,  "trend": [0, 0, 1, 1, 0, 0, 0] },
  "processingBags": { "count": 2, "trend": [0, 0, 0, 1, 1, 0, 0] },
  "missingBags":  { "count": 2,  "trend": [0, 0, 0, 0, 1, 0, 1] },
  "readyBags":    { "count": 4,  "trend": [1, 0, 0, 0, 1, 1, 0] }
}
```

**UI mapping:**

| Card (design) | Response field |
|---------------|----------------|
| Total bags | `totalBags` |
| Active bags | `activeBags` |
| Inactive bags | `inactiveBags` |
| Assigned bags | `assignedBags` |
| Processing | `processingBags` |
| Missing bags | `missingBags` |
| Ready bags | `readyBags` |

**Trend array (`trend`):**

- Length is always **7**
- `trend[0]` = 6 days ago, `trend[6]` = today
- Use for sparkline charts on each card
- `totalBags.trend` = new bags created per day
- All other trends = bags in that category updated on that day

---

### 2. List bags (table)

```
GET /api/Bags/admin/all
```

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `pageNumber` | int | `1` | Page number |
| `pageSize` | int | `50` | Rows per page |
| `keyword` | string | — | Search by bag number, order number, or customer name |
| `isActive` | bool | — | System status filter: `true` = Active, `false` = Inactive |
| `operationalStatus` | int | — | Operational status filter (`1`–`6`, see BagStatus table) |
| `sortBy` | string | `createdAt` | `number`, `status`, `weight`, `createdAt`, `updatedAt` |
| `sortDirection` | string | `desc` | `asc` or `desc` |

**Example:**

```
GET /api/Bags/admin/all?pageNumber=1&pageSize=8&keyword=Gulf&isActive=true&operationalStatus=2&sortBy=updatedAt&sortDirection=desc
```

**Response `data`:**

```json
{
  "items": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "slug": "bag-001",
      "number": "BAG-001",
      "notes": "Handle with care",
      "weight": 2.5,
      "isActive": true,
      "operationalStatus": 2,
      "updatedAt": "2026-06-26T00:05:00Z",
      "currentOrder": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "slug": "ord-1025",
        "name": "ORD-1025"
      },
      "companyName": "Gulf Hospitality Group"
    }
  ]
}
```

**Table column mapping:**

| UI column | Field |
|-----------|-------|
| Bag ID | `number` (link using `slug`) |
| Current order | `currentOrder.name` (link using `currentOrder.slug`); show `—` if `currentOrder` is null |
| Customer | `companyName`; show `—` if empty |
| System status | `isActive` → Active / Inactive badge |
| Operational status | `operationalStatus` → BagStatus label |
| Last updated | `updatedAt` (format as relative time in UI) |

**Filter dropdown mapping:**

| UI filter | Query param |
|-----------|-------------|
| System status: All | omit `isActive` |
| System status: Active | `isActive=true` |
| System status: Inactive | `isActive=false` |
| Operational status: All | omit `operationalStatus` |
| Operational status: Ready / Assigned / … | `operationalStatus=1` … `6` |

---

### 3. Get bag details

```
GET /api/Bags/{slug}
```

**Path:** `slug` — bag slug (e.g. `bag-001`)

**Response `data`:**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "slug": "bag-001",
  "number": "BAG-001",
  "notes": "Handle with care",
  "weight": 2.5,
  "isActive": true,
  "operationalStatus": 2,
  "createdAt": "2026-01-01T10:00:00Z",
  "updatedAt": "2026-06-26T00:05:00Z",
  "currentOrder": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "slug": "ord-1025",
    "orderNumber": "ORD-1025",
    "companyName": "Gulf Hospitality Group",
    "orderStatus": 2
  },
  "assignmentHistory": [
    {
      "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "orderSlug": "ord-1020",
      "orderNumber": "ORD-1020",
      "companyName": "Novotel Business Bay",
      "assignedAt": "2026-06-20T08:00:00Z"
    }
  ]
}
```

**Errors:**

| Status | When |
|--------|------|
| `404` | Bag slug not found |

---

### 4. Create bag

```
POST /api/Bags/create
Content-Type: application/json
```

**Request body:**

```json
{
  "number": "BAG-013",
  "notes": "Fragile",
  "weight": 1.5
}
```

| Field | Required | Rules |
|-------|----------|-------|
| `number` | Yes | Non-empty, max 100 chars, unique |
| `notes` | No | Free text |
| `weight` | No | Must be > 0 if provided |

The backend sets **`isActive: true`** and **`operationalStatus: Ready (1)`** automatically.

**Response `data`:** `Guid` — ID of the new bag

**Errors:**

| Status | When |
|--------|------|
| `400` | Empty number or duplicate bag number |

---

### 5. Update bag

```
PUT /api/Bags/{slug}
Content-Type: application/json
```

**Path:** `slug` — bag slug

**Request body:**

```json
{
  "number": "BAG-001",
  "notes": "Updated notes",
  "weight": 3.0,
  "isActive": false,
  "status": 6
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `number` | Yes | Bag number (unique) |
| `notes` | No | Notes |
| `weight` | No | Weight (> 0 if set) |
| `isActive` | Yes | System status |
| `status` | Yes | Operational status (`1`–`6`); use `6` for Missing |

**Response `data`:** `true`

**Errors:**

| Status | When |
|--------|------|
| `404` | Bag not found |
| `400` | Duplicate number or validation error |

---

### 6. Delete bag

```
DELETE /api/Bags/{slug}
```

**Path:** `slug` — bag slug

Performs a **soft delete**. Blocked if the bag is assigned to an active order.

**Response `data`:** `true`

**Errors:**

| Status | When |
|--------|------|
| `404` | Bag not found |
| `400` | Bag is assigned to an active order |

Example error message:

```json
{
  "isSuccess": false,
  "error": {
    "message": "Cannot delete a bag that is currently assigned to an active order."
  },
  "statusCode": "Conflict"
}
```

---

## TypeScript types (reference)

```typescript
export enum BagOperationalStatus {
  Ready = 1,
  Assigned = 2,
  Processing = 3,
  OnTheWay = 4,
  InTransit = 5,
  Missing = 6,
}

export interface ApiResult<T> {
  isSuccess: boolean;
  data: T;
  error: { code?: string; message?: string };
  statusCode: string;
  hasValue: boolean;
  message?: string | null;
}

export interface BagStatCard {
  count: number;
  trend: number[]; // length 7
}

export interface BagsStatsResponse {
  totalBags: BagStatCard;
  activeBags: BagStatCard;
  inactiveBags: BagStatCard;
  assignedBags: BagStatCard;
  processingBags: BagStatCard;
  missingBags: BagStatCard;
  readyBags: BagStatCard;
}

export interface CurrentOrderForBag {
  id: string;
  slug: string;
  name: string;
}

export interface BagListItem {
  id: string;
  slug: string;
  number: string;
  notes?: string | null;
  weight?: number | null;
  isActive: boolean;
  operationalStatus: BagOperationalStatus;
  updatedAt?: string | null;
  currentOrder?: CurrentOrderForBag | null;
  companyName: string;
}

export interface BagsListResponse {
  items: BagListItem[];
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface BagDetailsCurrentOrder {
  id: string;
  slug: string;
  orderNumber: string;
  companyName: string;
  orderStatus: number;
}

export interface BagAssignmentHistory {
  orderId: string;
  orderSlug: string;
  orderNumber: string;
  companyName: string;
  assignedAt?: string | null;
}

export interface BagDetails {
  id: string;
  slug: string;
  number: string;
  notes?: string | null;
  weight?: number | null;
  isActive: boolean;
  operationalStatus: BagOperationalStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
  currentOrder?: BagDetailsCurrentOrder | null;
  assignmentHistory: BagAssignmentHistory[];
}

export interface CreateBagRequest {
  number: string;
  notes?: string | null;
  weight?: number | null;
}

export interface UpdateBagRequest {
  number: string;
  notes?: string | null;
  weight?: number | null;
  isActive: boolean;
  status: BagOperationalStatus;
}
```

---

## Example fetch calls

### Stats (page load)

```typescript
const res = await fetch(`${baseUrl}/api/Bags/admin/stats`, {
  headers: { Authorization: `Bearer ${token}` },
});
const json: ApiResult<BagsStatsResponse> = await res.json();
```

### Table with filters

```typescript
const params = new URLSearchParams({
  pageNumber: '1',
  pageSize: '8',
  sortBy: 'updatedAt',
  sortDirection: 'desc',
});
if (keyword) params.set('keyword', keyword);
if (systemStatus !== 'all') params.set('isActive', String(systemStatus === 'active'));
if (operationalStatus !== 'all') params.set('operationalStatus', String(operationalStatus));

const res = await fetch(`${baseUrl}/api/Bags/admin/all?${params}`, {
  headers: { Authorization: `Bearer ${token}` },
});
const pagination: PaginationMeta = JSON.parse(res.headers.get('X-Pagination') ?? '{}');
const json: ApiResult<BagsListResponse> = await res.json();
```

### Create bag

```typescript
const res = await fetch(`${baseUrl}/api/Bags/create`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ number: 'BAG-013', notes: 'Fragile', weight: 1.5 }),
});
```

---

## Notes for frontend

1. **Slug vs number:** Use `slug` in URLs (`/bags/{slug}`). Display `number` (e.g. `BAG-001`) in the UI.
2. **Operational status auto-updates:** When bags are assigned to orders or order status changes in the laundry flow, operational status is updated by the backend. Manual override is only needed for cases like marking a bag **Missing** via the edit form.
3. **Refresh after mutations:** After create, update, or delete, refresh both **stats** and **table** (or at least the table + stats if counts may change).
4. **Empty states:** `currentOrder` and `companyName` may be null/empty when the bag is not linked to an active order — show `—` as in the design.
5. **Date formatting:** All dates are UTC ISO strings; format `updatedAt` as relative time (“6 minutes ago”) in the table.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-26 | Initial Operational Bags API — stats split from list, trends, dual status model |
