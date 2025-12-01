## JStack

Ship high-performance Next.js apps for extremely cheap

## Project Structure

```
vnghan-internal-fe/
├── .gitignore
├── biome.jsonc
├── bun.lock
├── components.json
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
├── tsconfig.json
├── public/
│   ├── favicon.ico
│   └── noise.svg
└── src/
    ├── proxy.ts
    ├── app/
    │   ├── actions.ts
    │   ├── global-error.tsx
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── loading.tsx
    │   ├── not-found.tsx
    │   ├── (routes)/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── customers/
    │   │   │   └── page.tsx
    │   │   └── import/
    │   │       └── page.tsx
    │   ├── api/
    │   │   └── [[...route]]/
    │   └── auth/
    │       └── signin/
    │           └── page.tsx
    ├── backend/
    │   ├── error.handler.ts
    │   ├── index.ts
    │   ├── db/
    │   │   └── schema/
    │   │       └── index.ts
    │   ├── lib/
    │   │   ├── api-response.ts
    │   │   └── cache.ts
    │   ├── middlewares/
    │   │   ├── cache.middleware.ts
    │   │   ├── db.middleware.ts
    │   │   ├── index.ts
    │   │   ├── jwt.middleware.ts
    │   │   └── rate-limit.middleware.ts
    │   ├── models/
    │   │   ├── config.model.ts
    │   │   ├── customer.model.ts
    │   │   └── ... (additional model files)
    │   ├── repositories/
    │   │   ├── customer.repository.ts
    │   │   ├── interfaces/
    │   │   └── ... (additional repository files)
    │   ├── routes/
    │   │   ├── index.ts
    │   │   ├── v1/
    │   │   │   ├── auth.route.ts
    │   │   │   ├── customer.route.ts
    │   │   │   └── ... (additional v1 route files)
    │   │   └── v2/
    │   │       └── screw.route.ts
    │   ├── services/
    │   │   ├── import.service.ts
    │   │   └── interfaces/
    │   │       └── import-service.interface.ts
    │   └── types/
    │       └── index.ts
    ├── frontend/
    │   ├── components/
    │   │   ├── features/
    │   │   │   ├── admin/
    │   │   │   ├── customer/
    │   │   │   ├── dialog/
    │   │   │   ├── excel/
    │   │   │   ├── home/
    │   │   │   └── navbar/
    │   │   └── ui/
    │   │       ├── button.tsx
    │   │       └── ... (additional UI components)
    │   ├── hooks/
    │   │   ├── useCreateCustomer.ts
    │   │   └── ... (additional hook files)
    │   └── providers/
    │       ├── AdminConfigProvider.tsx
    │       └── ... (additional providers)
    ├── infrastructure/
    │   └── db/
    │       ├── base/
    │       │   ├── auditable.ts
    │       │   └── helpers.ts
    │       ├── migrations/
    │       │   ├── 0000_black_rogue.sql
    │       │   ├── 0001_dry_champions.sql
    │       │   └── ... (additional migration files)
    │       └── schema/
    │           └── index.ts
    ├── modules/
    │   └── auth/
    │       └── components/
    └── core/
        ├── constants/
        │   ├── index.ts
        │   └── roles.ts
        ├── i18n/
        │   └── locales/
        │       ├── en/
        │       └── vi/
        ├── providers/
        │   ├── index.tsx
        │   └── react-query.tsx
        ├── types/
        │   ├── file-system-access.d.ts
        │   └── index.ts
        ├── utils/
        │   ├── date.ts
        │   ├── get-query-client.ts
        │   ├── hono-client.ts
        │   ├── http-client.ts
        │   ├── index.ts
        │   └── session.ts
        └── validations/
            └── index.ts
```
