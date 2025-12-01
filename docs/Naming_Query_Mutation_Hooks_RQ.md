# Naming Query & Mutation Hooks in React Query

## Core Principles

From a principal engineer perspective, naming conventions should optimize for **discoverability**, **consistency**, and **predictability** at scale.

---

## Recommended Patterns

### Queries

```typescript
// Pattern: use[Entity][Action?]Query
useUserQuery(userId)
useUsersQuery(filters)
useUserProfileQuery(userId)
useUserOrdersQuery(userId)
useOrderDetailsQuery(orderId)

// For infinite queries
useUsersInfiniteQuery(filters)
useOrdersInfiniteQuery()
```

### Mutations

```typescript
// Pattern: use[Action][Entity]Mutation
useCreateUserMutation()
useUpdateUserMutation()
useDeleteUserMutation()
useUploadAvatarMutation()
useBulkDeleteOrdersMutation()

// Alternative (verb-first, imperative style)
useCreateUser()
useUpdateUser()
useDeleteUser()
```

---

## Naming Decision Matrix

| Aspect | Recommendation | Rationale |
|--------|----------------|-----------|
| **Suffix `Query`/`Mutation`** | Optional but consistent | Explicit intent, helps onboarding. Drop if team prefers brevity |
| **Verb placement** | Verb-first for mutations | `useCreateUser` reads as action; `useUser` reads as data |
| **Plural vs singular** | Plural for collections | `useUsers` vs `useUser(id)` |
| **Nested resources** | Parent-first | `useUserOrders` not `useOrdersForUser` |

---

## File Structure at Scale

```
hooks/
├── queries/
│   ├── useUserQuery.ts
│   ├── useUsersQuery.ts
│   └── useOrdersQuery.ts
├── mutations/
│   ├── useCreateUser.ts
│   ├── useUpdateUser.ts
│   └── useDeleteUser.ts
└── index.ts  // barrel export
```

---

## Anti-Patterns to Avoid

```typescript
// ❌ Ambiguous
useUser()           // Query or mutation? Fetching what?
useUserData()       // Redundant "Data"

// ❌ Inconsistent verbs
useFetchUser()      // "fetch" is implementation detail
useGetUser()        // "get" is redundant for queries

// ❌ Wrong abstraction level
useUserAPI()        // Leaks implementation
useUserService()    // Not a hook concern
```

---

## Advanced: Factory Pattern for Large Codebases

```typescript
// queryKeys.ts - Single source of truth
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Filters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// useUserQuery.ts
export const useUserQuery = (userId: string) => {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => fetchUser(userId),
  })
}
```

This pattern ensures **cache invalidation is predictable** and **query keys are co-located**.

---

## TL;DR

- Queries: `use[Entity]Query` — noun-centric
- Mutations: `use[Verb][Entity]Mutation` — action-centric
- Be consistent > be clever
- Suffix optional, but pick one and enforce it