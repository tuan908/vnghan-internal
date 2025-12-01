# DTO Naming Convention & Architecture Guide

## Executive Summary

This document establishes naming conventions and type architecture for entity DTOs across all application layers, ensuring type safety, clarity, and maintainability.

---

## 1. Layer Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Layer                                │
│   CustomerCreateRequest → CustomerResponse                      │
├─────────────────────────────────────────────────────────────────┤
│                      Service Layer                              │
│   CustomerCreate → Customer → CustomerDTO                       │
├─────────────────────────────────────────────────────────────────┤
│                    Repository Layer                             │
│   CustomerInsert → CustomerRow → CustomerRow                    │
├─────────────────────────────────────────────────────────────────┤
│                     Database Layer                              │
│   Drizzle Schema (customer table)                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Naming Convention Matrix

| Layer | Operation | Naming Pattern | Example |
|-------|-----------|----------------|---------|
| **Database** | Full row | `{Entity}Row` | `CustomerRow` |
| **Database** | Insert | `{Entity}Insert` | `CustomerInsert` |
| **Database** | Update | `{Entity}Update` | `CustomerUpdate` |
| **Service** | Domain model | `{Entity}` | `Customer` |
| **Service** | Create input | `{Entity}Create` | `CustomerCreate` |
| **Service** | Update input | `{Entity}Update` | `CustomerUpdate` |
| **Service** | Output DTO | `{Entity}DTO` | `CustomerDTO` |
| **API** | Request body | `{Entity}{Action}Request` | `CustomerCreateRequest` |
| **API** | Response body | `{Entity}Response` | `CustomerResponse` |
| **API** | List response | `{Entity}ListResponse` | `CustomerListResponse` |
| **Query** | Filters | `{Entity}Filter` | `CustomerFilter` |
| **Query** | Sort | `{Entity}Sort` | `CustomerSort` |

---

## 3. Complete Type Definitions

### 3.1 Database Layer Types

```typescript
// ============================================
// schema/customer.ts
// ============================================

import { pgTableWithAudit } from "./audit";
import { serial, text, integer } from "drizzle-orm/pg-core";
import { user } from "./user";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

export const customer = pgTableWithAudit("customer", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  nextMessageTime: text("next_message_time"),
  note: text("note"),
  money: text("money"),
  need: text("need").default(""),
  assignedTo: integer("assigned_to").references(() => user.id),
});

// ============================================
// Database-level types (Drizzle inferred)
// ============================================

/** Full row as stored in database (SELECT *) */
export type CustomerRow = InferSelectModel<typeof customer>;

/** Shape for INSERT operations */
export type CustomerInsert = InferInsertModel<typeof customer>;

/** Shape for UPDATE operations (all fields optional except id) */
export type CustomerUpdate = Partial<Omit<CustomerInsert, "id">> & { id: number };
```

---

### 3.2 Domain Layer Types

```typescript
// ============================================
// domain/customer.types.ts
// ============================================

import type { CustomerRow } from "@/schema/customer";

// ============================================
// Core Domain Model
// ============================================

/** Domain entity - represents a Customer in business logic */
export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  nextMessageTime: string | null;
  note: string | null;
  money: string | null;
  need: string;
  assignedTo: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Service Input Types
// ============================================

/** Input for creating a new customer */
export interface CustomerCreate {
  name: string;
  phone?: string | null;
  address?: string | null;
  nextMessageTime?: string | null;
  note?: string | null;
  money?: string | null;
  need?: string;
  assignedTo?: number | null;
}

/** Input for updating an existing customer */
export interface CustomerEdit {
  name?: string;
  phone?: string | null;
  address?: string | null;
  nextMessageTime?: string | null;
  note?: string | null;
  money?: string | null;
  need?: string;
  assignedTo?: number | null;
}

/** Input for patching specific fields */
export type CustomerPatch = Partial<CustomerEdit>;

// ============================================
// Service Output Types
// ============================================

/** DTO for external consumption (API responses, etc.) */
export interface CustomerDTO {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  nextMessageTime: string | null;
  note: string | null;
  money: string | null;
  need: string;
  assignedTo: number | null;
  createdAt: string; // ISO string for JSON serialization
  updatedAt: string;
}

/** DTO with related entities expanded */
export interface CustomerWithAssignee extends CustomerDTO {
  assignee: {
    id: number;
    name: string;
    email: string;
  } | null;
}

/** Summary DTO for lists/dropdowns */
export interface CustomerSummary {
  id: number;
  name: string;
  phone: string | null;
}
```

---

### 3.3 API Layer Types

```typescript
// ============================================
// api/customer.types.ts
// ============================================

import type { CustomerDTO, CustomerSummary, CustomerWithAssignee } from "@/domain/customer.types";
import type { PaginationMeta } from "@/types/pagination";

// ============================================
// Request Types
// ============================================

/** POST /customers - Create customer */
export interface CustomerCreateRequest {
  name: string;
  phone?: string;
  address?: string;
  nextMessageTime?: string;
  note?: string;
  money?: string;
  need?: string;
  assignedTo?: number;
}

/** PUT /customers/:id - Full update */
export interface CustomerUpdateRequest {
  name: string;
  phone?: string | null;
  address?: string | null;
  nextMessageTime?: string | null;
  note?: string | null;
  money?: string | null;
  need?: string;
  assignedTo?: number | null;
}

/** PATCH /customers/:id - Partial update */
export interface CustomerPatchRequest {
  name?: string;
  phone?: string | null;
  address?: string | null;
  nextMessageTime?: string | null;
  note?: string | null;
  money?: string | null;
  need?: string;
  assignedTo?: number | null;
}

// ============================================
// Query/Filter Types
// ============================================

/** GET /customers query parameters */
export interface CustomerListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  assignedTo?: number;
  sortBy?: CustomerSortField;
  sortOrder?: "asc" | "desc";
}

export type CustomerSortField = "name" | "createdAt" | "updatedAt";

/** Filter criteria for customer queries */
export interface CustomerFilter {
  search?: string;
  assignedTo?: number | null;
  hasPhone?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

// ============================================
// Response Types
// ============================================

/** Single customer response */
export interface CustomerResponse {
  data: CustomerDTO;
}

/** Single customer with relations */
export interface CustomerDetailResponse {
  data: CustomerWithAssignee;
}

/** Paginated list response */
export interface CustomerListResponse {
  data: CustomerDTO[];
  pagination: PaginationMeta;
}

/** Summary list (for dropdowns) */
export interface CustomerSummaryListResponse {
  data: CustomerSummary[];
}
```

---

### 3.4 Query Layer Types

```typescript
// ============================================
// repository/customer.types.ts
// ============================================

import type { CustomerRow } from "@/schema/customer";

/** Options for findMany query */
export interface CustomerQueryOptions {
  filter?: CustomerQueryFilter;
  sort?: CustomerQuerySort;
  pagination?: {
    page: number;
    pageSize: number;
  };
  include?: {
    assignee?: boolean;
  };
}

export interface CustomerQueryFilter {
  search?: string;
  assignedTo?: number | null;
  ids?: number[];
}

export interface CustomerQuerySort {
  field: keyof CustomerRow;
  direction: "asc" | "desc";
}

/** Result with total count for pagination */
export interface CustomerQueryResult {
  rows: CustomerRow[];
  totalCount: number;
}
```

---

## 4. Mappers / Transformers

```typescript
// ============================================
// mappers/customer.mapper.ts
// ============================================

import type { CustomerRow } from "@/schema/customer";
import type {
  Customer,
  CustomerDTO,
  CustomerSummary,
  CustomerCreate,
} from "@/domain/customer.types";
import type { CustomerInsert } from "@/schema/customer";
import type { CustomerCreateRequest } from "@/api/customer.types";

export const CustomerMapper = {
  // ============================================
  // Database → Domain
  // ============================================

  /** Map database row to domain entity */
  toDomain(row: CustomerRow): Customer {
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      address: row.address,
      nextMessageTime: row.nextMessageTime,
      note: row.note,
      money: row.money,
      need: row.need ?? "",
      assignedTo: row.assignedTo,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },

  /** Map multiple rows */
  toDomainList(rows: CustomerRow[]): Customer[] {
    return rows.map(CustomerMapper.toDomain);
  },

  // ============================================
  // Domain → DTO
  // ============================================

  /** Map domain entity to DTO (for API responses) */
  toDTO(customer: Customer): CustomerDTO {
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      nextMessageTime: customer.nextMessageTime,
      note: customer.note,
      money: customer.money,
      need: customer.need,
      assignedTo: customer.assignedTo,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  },

  toDTOList(customers: Customer[]): CustomerDTO[] {
    return customers.map(CustomerMapper.toDTO);
  },

  /** Map to summary (for lists/dropdowns) */
  toSummary(customer: Customer): CustomerSummary {
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
    };
  },

  toSummaryList(customers: Customer[]): CustomerSummary[] {
    return customers.map(CustomerMapper.toSummary);
  },

  // ============================================
  // Row → DTO (shortcut for read operations)
  // ============================================

  /** Direct row to DTO (skip domain for simple reads) */
  rowToDTO(row: CustomerRow): CustomerDTO {
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      address: row.address,
      nextMessageTime: row.nextMessageTime,
      note: row.note,
      money: row.money,
      need: row.need ?? "",
      assignedTo: row.assignedTo,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  },

  rowToDTOList(rows: CustomerRow[]): CustomerDTO[] {
    return rows.map(CustomerMapper.rowToDTO);
  },

  // ============================================
  // API Request → Service Input
  // ============================================

  /** Map API request to service input */
  fromCreateRequest(request: CustomerCreateRequest): CustomerCreate {
    return {
      name: request.name,
      phone: request.phone ?? null,
      address: request.address ?? null,
      nextMessageTime: request.nextMessageTime ?? null,
      note: request.note ?? null,
      money: request.money ?? null,
      need: request.need ?? "",
      assignedTo: request.assignedTo ?? null,
    };
  },

  // ============================================
  // Service Input → Database Insert
  // ============================================

  /** Map service input to database insert */
  toInsert(input: CustomerCreate): CustomerInsert {
    return {
      name: input.name,
      phone: input.phone,
      address: input.address,
      nextMessageTime: input.nextMessageTime,
      note: input.note,
      money: input.money,
      need: input.need,
      assignedTo: input.assignedTo,
    };
  },
};
```

---

## 5. Directory Structure

```
src/
├── schema/                     # Database schema (Drizzle)
│   ├── customer.ts            # Table definition + Row/Insert types
│   ├── user.ts
│   └── index.ts
│
├── domain/                     # Domain types
│   ├── customer.types.ts      # Customer, CustomerCreate, CustomerDTO
│   ├── user.types.ts
│   └── index.ts
│
├── api/                        # API layer types
│   └── types/
│       ├── customer.types.ts  # Request/Response types
│       ├── user.types.ts
│       └── index.ts
│
├── repository/                 # Data access
│   ├── customer.repository.ts
│   └── types/
│       └── customer.types.ts  # Query options, filters
│
├── services/                   # Business logic
│   └── customer.service.ts
│
├── mappers/                    # Type transformations
│   ├── customer.mapper.ts
│   └── index.ts
│
└── types/                      # Shared types
    ├── pagination.ts
    ├── result.ts
    └── index.ts
```

---

## 6. Naming Convention Rules

### 6.1 Suffix Glossary

| Suffix | Meaning | Layer | Example |
|--------|---------|-------|---------|
| `Row` | Database row (SELECT result) | Database | `CustomerRow` |
| `Insert` | Database insert shape | Database | `CustomerInsert` |
| `Update` | Database update shape | Database | `CustomerUpdate` |
| `Create` | Service-level create input | Service | `CustomerCreate` |
| `Edit` | Service-level edit input | Service | `CustomerEdit` |
| `Patch` | Partial update input | Service | `CustomerPatch` |
| `DTO` | Data Transfer Object (output) | Service/API | `CustomerDTO` |
| `Request` | API request body | API | `CustomerCreateRequest` |
| `Response` | API response wrapper | API | `CustomerResponse` |
| `Query` | URL query parameters | API | `CustomerListQuery` |
| `Filter` | Query filter criteria | Repository | `CustomerFilter` |
| `Sort` | Sort options | Repository | `CustomerSort` |
| `Summary` | Minimal DTO for lists | Service | `CustomerSummary` |
| `With{Relation}` | DTO with expanded relation | Service | `CustomerWithAssignee` |

---

### 6.2 Rules

1. **No prefix for domain model**: Use `Customer`, not `CustomerModel` or `CustomerEntity`

2. **Use `Create` not `New`**: `CustomerCreate` not `NewCustomer`

3. **Use `Edit` for updates at service layer**: Distinguishes from `Update` (database)

4. **Use `Patch` for partial updates**: HTTP PATCH semantics

5. **Suffix `Request`/`Response` only at API boundary**: Clear API contract

6. **`DTO` suffix for serializable output**: Always JSON-safe (dates as strings)

7. **`Row` suffix for database types**: Direct Drizzle inference

---

## 7. Usage Examples

### 7.1 Repository Layer

```typescript
// repository/customer.repository.ts

import { db } from "@/db";
import { customer, CustomerRow, CustomerInsert, CustomerUpdate } from "@/schema/customer";
import { CustomerQueryOptions, CustomerQueryResult } from "./types/customer.types";
import { Result } from "@/types/result";
import { eq } from "drizzle-orm";

export const CustomerRepository = {
  async findById(id: number): Promise<Result<CustomerRow | null, AppError>> {
    return Result.fromPromise(
      db.select().from(customer).where(eq(customer.id, id)).then(rows => rows[0] ?? null)
    );
  },

  async findMany(options: CustomerQueryOptions): Promise<Result<CustomerQueryResult, AppError>> {
    // Implementation
  },

  async insert(data: CustomerInsert): Promise<Result<CustomerRow, AppError>> {
    return Result.fromPromise(
      db.insert(customer).values(data).returning().then(rows => rows[0])
    );
  },

  async update(data: CustomerUpdate): Promise<Result<CustomerRow, AppError>> {
    const { id, ...values } = data;
    return Result.fromPromise(
      db.update(customer).set(values).where(eq(customer.id, id)).returning().then(rows => rows[0])
    );
  },

  async delete(id: number): Promise<Result<void, AppError>> {
    return Result.fromPromise(
      db.delete(customer).where(eq(customer.id, id)).then(() => undefined)
    );
  },
};
```

---

### 7.2 Service Layer

```typescript
// services/customer.service.ts

import { CustomerRepository } from "@/repository/customer.repository";
import { CustomerMapper } from "@/mappers/customer.mapper";
import type { CustomerCreate, CustomerEdit, CustomerDTO } from "@/domain/customer.types";
import { Result } from "@/types/result";

export const CustomerService = {
  async getById(id: number): Promise<Result<CustomerDTO, AppError>> {
    const result = await CustomerRepository.findById(id);

    return result.flatMap(row => {
      if (!row) {
        return Result.notFound(`Customer with id ${id} not found`);
      }
      return Result.ok(CustomerMapper.rowToDTO(row));
    });
  },

  async create(input: CustomerCreate): Promise<Result<CustomerDTO, AppError>> {
    const insertData = CustomerMapper.toInsert(input);
    const result = await CustomerRepository.insert(insertData);

    return result.map(CustomerMapper.rowToDTO);
  },

  async update(id: number, input: CustomerEdit): Promise<Result<CustomerDTO, AppError>> {
    const result = await CustomerRepository.update({ id, ...input });

    return result.map(CustomerMapper.rowToDTO);
  },

  async delete(id: number): Promise<Result<void, AppError>> {
    return CustomerRepository.delete(id);
  },
};
```

---

### 7.3 API Layer

```typescript
// api/routes/customer.routes.ts

import { Hono } from "hono";
import { CustomerService } from "@/services/customer.service";
import { CustomerMapper } from "@/mappers/customer.mapper";
import { ResultHttp } from "@/types/result";
import type { CustomerCreateRequest, CustomerResponse } from "@/api/types/customer.types";

const app = new Hono();

// GET /customers/:id
app.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const result = await CustomerService.getById(id);

  const response = ResultHttp.toResponse(result);
  return c.json(response.body, response.status);
});

// POST /customers
app.post("/", async (c) => {
  const request = await c.req.json<CustomerCreateRequest>();
  const input = CustomerMapper.fromCreateRequest(request);
  const result = await CustomerService.create(input);

  const response = ResultHttp.toCreatedResponse(result);
  return c.json(response.body, response.status);
});

export default app;
```

---

## 8. Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER TYPE CHEAT SHEET                    │
├─────────────────────────────────────────────────────────────────┤
│  DATABASE LAYER                                                 │
│    CustomerRow      → Full row from SELECT                      │
│    CustomerInsert   → Shape for INSERT                          │
│    CustomerUpdate   → Shape for UPDATE (partial + id)           │
├─────────────────────────────────────────────────────────────────┤
│  DOMAIN LAYER                                                   │
│    Customer         → Domain entity (business logic)            │
│    CustomerCreate   → Input for creating                        │
│    CustomerEdit     → Input for editing                         │
│    CustomerPatch    → Input for partial edit                    │
│    CustomerDTO      → Output (JSON-serializable)                │
│    CustomerSummary  → Minimal output for lists                  │
├─────────────────────────────────────────────────────────────────┤
│  API LAYER                                                      │
│    CustomerCreateRequest   → POST body                          │
│    CustomerUpdateRequest   → PUT body                           │
│    CustomerPatchRequest    → PATCH body                         │
│    CustomerListQuery       → GET query params                   │
│    CustomerResponse        → Single item response               │
│    CustomerListResponse    → Paginated list response            │
├─────────────────────────────────────────────────────────────────┤
│  QUERY LAYER                                                    │
│    CustomerFilter    → Where clause criteria                    │
│    CustomerSort      → Order by options                         │
│    CustomerQueryOptions → Combined query config                 │
└─────────────────────────────────────────────────────────────────┘
```

---

This document provides a complete, consistent naming convention that scales across your entire application. Want me to generate the actual files for your Customer entity, or extend this for other entities?