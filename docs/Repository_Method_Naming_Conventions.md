# Repository Method Naming Conventions

## Core Principle

> **Name methods by WHAT they return, not HOW they work.**

---

## The Naming System

### Prefix Meanings (Pick One Convention, Stick To It)

| Prefix | Returns | Throws if not found? | Use case |
|--------|---------|---------------------|----------|
| `get` | Single item | ✅ Yes | When absence is an error |
| `find` | Single item or `undefined` | ❌ No | When absence is valid |
| `list` | Array (can be empty) | ❌ No | Multiple items |
| `exists` | `boolean` | ❌ No | Existence check |
| `count` | `number` | ❌ No | Counting |

```typescript
// Examples
getById(id: number): Promise<Customer>        // Throws if not found
findById(id: number): Promise<Customer | undefined>  // Returns undefined
listAll(): Promise<Customer[]>                // Returns [] if none
existsById(id: number): Promise<boolean>      // true/false
countByStatus(status: Status): Promise<number> // 0 if none
```

---

### Suffix Patterns

| Pattern | Meaning | Example |
|---------|---------|---------|
| `By{Field}` | Filter by single field | `findByEmail(email)` |
| `By{Field}And{Field}` | Multiple fields (max 2) | `findByEmailAndTenant(email, tenantId)` |
| `With{Relation}` | Include related data | `listWithPlatforms()` |
| `For{Context}` | Scoped/contextual query | `listForUser(userId)` |

---

## Recommended Naming by Operation

### Single Record Operations

```typescript
export const customerRepo = {
  // Retrieve
  getById: (id: number) => Promise<Customer>,              // Throws if missing
  findById: (id: number) => Promise<Customer | undefined>, // Safe
  findByEmail: (email: string) => Promise<Customer | undefined>,

  // Mutate
  create: (data: NewCustomer) => Promise<Customer>,
  update: (id: number, data: UpdateCustomer) => Promise<Customer>,
  delete: (id: number) => Promise<void>,

  // Soft delete (be explicit)
  softDelete: (id: number) => Promise<void>,
  restore: (id: number) => Promise<void>,
};
```

### Multiple Record Operations

```typescript
export const customerRepo = {
  // List variants
  list: (options?: ListOptions) => Promise<Customer[]>,
  listByStatus: (status: Status) => Promise<Customer[]>,
  listForUser: (userId: number) => Promise<Customer[]>,
  listWithPlatforms: () => Promise<CustomerWithPlatform[]>,

  // Batch operations
  createMany: (data: NewCustomer[]) => Promise<Customer[]>,
  updateMany: (ids: number[], data: UpdateCustomer) => Promise<number>, // returns count
  deleteMany: (ids: number[]) => Promise<number>,
};
```

### Query/Check Operations

```typescript
export const customerRepo = {
  existsById: (id: number) => Promise<boolean>,
  existsByEmail: (email: string) => Promise<boolean>,
  count: () => Promise<number>,
  countByStatus: (status: Status) => Promise<number>,
};
```

---

## Complete Example for Your CRM

```typescript
// src/modules/customer/repository.ts

export const customerRepo = {
  // === Queries (Read) ===

  /** Get by ID - throws if not found */
  getById: async (id: number): Promise<Customer> => {
    const customer = await customerRepo.findById(id);
    if (!customer) throw new NotFoundError(`Customer ${id} not found`);
    return customer;
  },

  /** Find by ID - returns undefined if not found */
  findById: async (id: number): Promise<Customer | undefined> => {
    const db = getDb();
    const [row] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, id), isNull(customers.deletedAt)));
    return row;
  },

  /** Find by phone number */
  findByPhone: async (phone: string): Promise<Customer | undefined> => {
    // ...
  },

  /** List all customers (with optional filters) */
  list: async (options: ListOptions = {}): Promise<Customer[]> => {
    // ...
  },

  /** List customers assigned to a specific user */
  listForUser: async (userId: number): Promise<Customer[]> => {
    // ...
  },

  /** List customers needing contact today */
  listDueForContact: async (date: Date = new Date()): Promise<Customer[]> => {
    // ...
  },

  /** List with platform info joined */
  listWithPlatforms: async (): Promise<CustomerWithPlatform[]> => {
    // ...
  },

  /** Check if customer exists */
  existsByPhone: async (phone: string): Promise<boolean> => {
    const db = getDb();
    const [row] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.phone, phone))
      .limit(1);
    return !!row;
  },

  /** Count customers by status */
  countByAssignee: async (userId: number): Promise<number> => {
    // ...
  },

  // === Mutations (Write) ===

  /** Create new customer */
  create: async (data: NewCustomer): Promise<Customer> => {
    const db = getDb();
    const [created] = await db.insert(customers).values(data).returning();
    return created;
  },

  /** Create multiple customers (for import) */
  createMany: async (data: NewCustomer[]): Promise<Customer[]> => {
    const db = getDb();
    return db.insert(customers).values(data).returning();
  },

  /** Update customer by ID */
  update: async (id: number, data: UpdateCustomer): Promise<Customer> => {
    const db = getDb();
    const [updated] = await db
      .update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    if (!updated) throw new NotFoundError(`Customer ${id} not found`);
    return updated;
  },

  /** Soft delete customer */
  softDelete: async (id: number): Promise<void> => {
    const db = getDb();
    await db
      .update(customers)
      .set({ deletedAt: new Date() })
      .where(eq(customers.id, id));
  },

  /** Restore soft-deleted customer */
  restore: async (id: number): Promise<void> => {
    const db = getDb();
    await db
      .update(customers)
      .set({ deletedAt: null })
      .where(eq(customers.id, id));
  },

  /** Permanently delete (use with caution) */
  hardDelete: async (id: number): Promise<void> => {
    const db = getDb();
    await db.delete(customers).where(eq(customers.id, id));
  },
};
```

---

## Anti-Patterns to Avoid

| ❌ Don't | ✅ Do | Why |
|----------|-------|-----|
| `getCustomers()` | `list()` | "get" implies single item |
| `fetchAllCustomers()` | `list()` | Redundant; context is clear from module |
| `findCustomerById(id)` | `findById(id)` | "Customer" is redundant in `customerRepo` |
| `getCustomerOrNull()` | `findById()` | "OrNull" is what "find" means |
| `getAllActiveCustomers()` | `listActive()` or `list({ status: 'active' })` | Shorter |
| `selectCustomersByUserId()` | `listForUser(userId)` | "select" is implementation detail |
| `queryCustomers()` | `list()` or `search()` | "query" is vague |
| `fetchData()` | `list()` | "Data" is meaningless |
| `doUpdate()` | `update()` | "do" adds nothing |

---

## Special Cases

### Search vs List vs Find

```typescript
// list - Returns all matching a simple filter
listByStatus: (status: Status) => Promise<Customer[]>

// search - Full-text or complex query with pagination
search: (query: SearchQuery) => Promise<PaginatedResult<Customer>>

// find - Single item lookup
findByEmail: (email: string) => Promise<Customer | undefined>
```

### Upsert Operations

```typescript
// Clear naming for upsert
upsertByEmail: async (email: string, data: NewCustomer): Promise<Customer> => {
  // INSERT ... ON CONFLICT
}

// Or split into explicit methods
createOrUpdate: async (data: NewCustomer): Promise<Customer>
```

### Domain-Specific Actions

When CRUD doesn't capture intent:

```typescript
export const customerRepo = {
  // Instead of: update(id, { status: 'archived' })
  archive: async (id: number): Promise<void> => { /* ... */ },

  // Instead of: update(id, { assignedTo: userId })
  assignTo: async (id: number, userId: number): Promise<Customer> => { /* ... */ },

  // Instead of: findBy({ nextMessageTime: today })
  listDueForContact: async (date: Date): Promise<Customer[]> => { /* ... */ },

  // Instead of: update(id, { nextMessageTime })
  scheduleNextContact: async (id: number, date: Date): Promise<void> => { /* ... */ },
};
```

---

## Quick Reference Cheatsheet

```
┌─────────────────────────────────────────────────────────┐
│                  NAMING FORMULA                         │
├─────────────────────────────────────────────────────────┤
│  {action}{By|For|With}{Qualifier}                       │
│                                                         │
│  ACTIONS:                                               │
│    get    → single, throws if missing                   │
│    find   → single, returns undefined                   │
│    list   → array                                       │
│    count  → number                                      │
│    exists → boolean                                     │
│    create → insert                                      │
│    update → modify                                      │
│    delete → remove (soft by default)                    │
│                                                         │
│  QUALIFIERS:                                            │
│    ById, ByEmail, ByPhone    → filter field             │
│    ForUser, ForTenant        → scoped context           │
│    WithPlatforms, WithNotes  → joined relations         │
│    Active, Archived, Deleted → status filter            │
│    Many                      → batch operation          │
│                                                         │
│  EXAMPLES:                                              │
│    findById, listForUser, listWithPlatforms,            │
│    countByStatus, existsByEmail, createMany             │
└─────────────────────────────────────────────────────────┘
```

This system scales because it's predictable—any engineer can guess the method name without checking docs.