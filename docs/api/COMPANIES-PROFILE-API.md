# Company Profile Page — API Integration Guide

Full backend API for the **company detail / profile page** (header, KPI cards, Overview tab, and sub-tabs).

---

## Base URL

| Environment | URL |
|-------------|-----|
| Local HTTP | `http://localhost:5244` |
| Local HTTPS | `https://localhost:7168` |
| Swagger | `/swagger` |

All routes are prefixed with:

```
/api/Companies
```

---

## Authentication

Authorization is commented out in development. When enabled, admin JWT required:

```
Authorization: Bearer <token>
Accept-Language: en | ar
```

---

## Standard response envelope

```json
{
  "isSuccess": true,
  "data": { },
  "error": { "code": "", "message": "" },
  "status": "Success",
  "statusCode": "Success",
  "hasValue": true,
  "message": null
}
```

Paginated endpoints add `X-Pagination` header:

```json
{"currentPage":1,"totalPages":3,"pageSize":20,"totalCount":45,"hasPrevious":false,"hasNext":true}
```

---

## Endpoints

### 1. Company profile (Overview page)

```
GET /api/Companies/{slug}
```

**Parent companies only** — returns `404` if slug is a branch or unknown.

**Response `data`:**

```json
{
  "id": "guid",
  "slug": "al-faisal-hotel",
  "name": "Al Faisal Hotel",
  "type": "Hotel",
  "photo": { "path": "uploads/...", "url": "https://..." },
  "isActive": true,
  "status": 3,
  "alertsCount": 2,
  "stats": {
    "branchesCount": 2,
    "activeOrders": 5,
    "completedOrders": 3,
    "ordersThisMonth": 4,
    "outstandingBalance": 210.00,
    "totalRevenue": 156.00,
    "pendingInvoices": 3,
    "overdueInvoices": 1
  },
  "companyInfo": {
    "business": {
      "businessName": "Al Faisal Hotel",
      "businessType": "Hotel",
      "commercialRegistration": "1010010001"
    },
    "contact": {
      "mainContactPerson": "Faisal Al-Dosari",
      "phone": "+966512345678",
      "email": "alfaisalhotel@demo.cleno.sa"
    },
    "location": {
      "address": "412 King Fahd Rd, Riyadh",
      "googleMapLink": "https://maps.google.com/?q=Riyadh"
    },
    "status": {
      "isActive": true,
      "registrationDate": "2025-04-12T00:00:00Z"
    }
  },
  "financialSummary": {
    "invoiceCounts": { "total": 8, "paid": 3, "pending": 4, "overdue": 1 },
    "totals": {
      "totalBilled": 1200.00,
      "totalPaid": 156.00,
      "outstanding": 210.00,
      "collectionRate": 13.0
    },
    "recentInvoices": [
      {
        "id": "guid",
        "invoiceNumber": "INV-ORD-DEMO-2025-0004",
        "orderId": "guid",
        "orderNumber": "ORD-DEMO-2025-0004",
        "dueDate": "2026-07-14T00:00:00Z",
        "amount": 126.00,
        "paymentStatus": 1
      }
    ]
  },
  "recentOrders": [
    {
      "id": "guid",
      "slug": "ord-demo-2025-0001",
      "orderNumber": "ORD-DEMO-2025-0001",
      "branchName": "Al Faisal Hotel - Olaya Branch",
      "status": 5,
      "itemsCount": 14,
      "pickupAt": "2025-02-28T08:00:00Z"
    }
  ],
  "recentActivity": [
    {
      "id": "guid",
      "type": "order_created",
      "title": "Order Created",
      "description": "New order ORD-DEMO-2025-0001 created",
      "performedBy": "System",
      "entityType": 1,
      "entityId": "guid",
      "occurredAt": "2025-02-25T10:00:00Z"
    }
  ]
}
```

**Preview limits:** `recentOrders` = 5, `recentActivity` = 5, `recentInvoices` = 4.

---

### 2. Activity tab

```
GET /api/Companies/{slug}/activity?pageNumber=1&pageSize=20
```

**`data.items[]`:**

```json
{
  "id": "guid",
  "type": "driver_assigned",
  "title": "Driver Assigned",
  "description": "Driver Ahmed Al-Rashid assigned to ORD-DEMO-2025-0006",
  "performedBy": "Sara Al-Qahtani",
  "entityType": 1,
  "entityId": "guid",
  "occurredAt": "2026-06-27T09:00:00Z"
}
```

Sorted by `occurredAt` descending.

---

### 3. Orders tab

```
GET /api/Companies/{slug}/orders?pageNumber=1&pageSize=20&status=4&sortBy=createdAt&sortDirection=desc
```

| Query | Type | Notes |
|-------|------|-------|
| `status` | int? | Order status enum filter |
| `sortBy` | string | `createdAt`, `orderNumber`, `status`, `pickupAt` |
| `sortDirection` | string | `asc` / `desc` |

**`data.items[]`:**

```json
{
  "id": "guid",
  "slug": "ord-demo-2025-0004",
  "orderNumber": "ORD-DEMO-2025-0004",
  "branchName": "Riyadh Fitness Club - King Fahd Branch",
  "status": 3,
  "itemsCount": 10,
  "totalAmount": 126.00,
  "paymentStatus": 1,
  "pickupAt": "2026-06-13T08:00:00Z",
  "createdAt": "2026-06-11T08:00:00Z"
}
```

---

### 4. Invoices tab

Invoices are **derived from orders** (no separate Invoice table).

```
GET /api/Companies/{slug}/invoices?pageNumber=1&pageSize=20&paymentStatus=1
```

**`data.items[]`:**

```json
{
  "id": "guid",
  "invoiceNumber": "INV-ORD-DEMO-2025-0004",
  "orderId": "guid",
  "orderNumber": "ORD-DEMO-2025-0004",
  "branchName": "Riyadh Fitness Club - King Fahd Branch",
  "amount": 126.00,
  "paymentStatus": 1,
  "dueDate": "2026-07-11T00:00:00Z",
  "orderStatus": 3,
  "createdAt": "2026-06-11T08:00:00Z"
}
```

- **Invoice number:** `INV-{orderNumber}`
- **Due date:** `order.createdAt + 30 days`
- Overdue status auto-applied before listing (same as company orders API)

---

### 5. Branches tab

```
GET /api/Companies/{slug}/branches?pageNumber=1&pageSize=20
```

**`data.items[]`:**

```json
{
  "id": "guid",
  "slug": "al-faisal-hotel-olaya-branch",
  "name": "Al Faisal Hotel - Olaya Branch",
  "email": "alfaisalhotel-br1@demo.cleno.sa",
  "phone": "+966508901234",
  "address": "45 Olaya, Riyadh",
  "isActive": true,
  "activeOrders": 2,
  "createdAt": "2025-05-01T00:00:00Z"
}
```

---

## Related endpoints (unchanged)

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/Companies/{slug}/for-edit` | Edit form (same fields as create) |
| `PUT` | `/api/Companies/{slug}` | Update company |

---

## Enums

### Company `status`

| Value | Meaning |
|-------|---------|
| 1 | PendingEmailVerification |
| 2 | PendingAdminApproval |
| 3 | Approved |
| 4 | Rejected |
| 5 | Suspended |

### Order `status`

| Value | UI label |
|-------|----------|
| 1 | Order Created |
| 2 | Picked Up |
| 3 | In Laundry |
| 4 | Ready |
| 5 | Delivered |
| 6 | Cancelled |

### `paymentStatus`

| Value | Label |
|-------|-------|
| 1 | Pending |
| 2 | Paid |
| 3 | Overdue |

### Activity `type` (string)

`company_registered` | `company_approved` | `branch_created` | `order_created` | `driver_assigned` | `order_picked_up` | `order_in_laundry` | `order_ready` | `order_delivered` | `order_cancelled` | `invoice_generated` | `incident_reported` | `payment_received`

### Activity `entityType`

| Value | Entity |
|-------|--------|
| 1 | Order |
| 2 | Incident |
| 3 | Company |
| 4 | Branch |

---

## Activity logging (backend)

Events are written to `CompanyActivities` when:

- Order created, driver assigned, status changed
- Incident reported
- Company approved, branch created, company registered

`performedBy` resolves from the current user; shows `"System"` when no user context.

---

## Database migration

Run after pulling:

```bash
dotnet ef database update --project Cleno.Persistence --startup-project Cleno.API
```

For demo SQL data, run `08-company-activity.sql` after scripts `01`–`07`.

---

## Frontend checklist

- [ ] Profile page: `GET /api/Companies/{slug}`
- [ ] Activity tab: `GET /api/Companies/{slug}/activity`
- [ ] Orders tab: `GET /api/Companies/{slug}/orders`
- [ ] Invoices tab: `GET /api/Companies/{slug}/invoices`
- [ ] Branches tab: `GET /api/Companies/{slug}/branches`
- [ ] Map activity `type` → icon/color
- [ ] Use `photo.url` for display; edit via `/for-edit`
