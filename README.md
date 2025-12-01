# Vnghan Internal

A full-stack Next.js application for internal customer and inventory management.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Hono, Node.js
- **Database**: PostgreSQL (Neon Serverless) with Drizzle ORM
- **UI**: ShadCN UI (Radix UI), Tailwind CSS
- **State Management**: TanStack Query, React Hook Form
- **Authentication**: JWT
- **Internationalization**: Vietnamese & English

## Features

- Customer management (CRUD operations)
- Inventory management with screw/component types
- Excel import/export functionality
- Multi-role access control
- Real-time data updates
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

1. Clone the repository
```bash
git clone https://github.com/tuan908/vnghan-internal.git
cd vnghan-internal-fe
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
Create a `.env.local` file with:
```
DATABASE_URL="postgresql://username:password@hostname:5432/database"
JWT_SECRET="your-jwt-secret"
```

4. Push database schema
```bash
pnpm db:push
```

5. Start the development server
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Database

The project uses PostgreSQL (Neon Serverless) with Drizzle ORM. Schema is defined in `src/server/db/schema/`.

To generate migrations (if schema changes):
```bash
pnpm db:generate
```

To view database in browser:
```bash
pnpm db:studio
```

## Project Structure

```
vnghan-internal-fe/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (protected)/        # Protected routes
│   │   ├── api/               # API routes (handled by Hono)
│   │   └── auth/              # Authentication pages
│   ├── core/                  # Shared utilities & components
│   │   ├── components/ui/     # Reusable UI components
│   │   ├── constants/         # App constants
│   │   ├── i18n/             # Internationalization
│   │   ├── providers/        # React providers
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utility functions
│   │   └── validations/      # Zod schemas
│   ├── frontend/             # Frontend-specific modules
│   │   └── modules/          # Feature modules (customer, inventory, etc.)
│   └── server/               # Backend/server code
│       ├── db/               # Database schema & migrations
│       ├── lib/              # Server utilities
│       ├── middlewares/      # Hono middlewares
│       ├── models/           # Domain models
│       ├── repositories/     # Data access layer
│       ├── routes/           # API routes
│       └── services/         # Business logic
├── public/                   # Static assets
└── docs/                     # Documentation
```

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests (if available)

### Code Quality

The project uses:
- **Biome** for linting and formatting
- **TypeScript** for type safety
- **ESLint** for additional code quality checks

## API Documentation

The backend uses Hono for API routing. Routes are defined in `src/server/routes/`.

Example endpoints:
- `GET /api/customer/list` - List customers
- `POST /api/customer/` - Create customer
- `PUT /api/customer/:id` - Update customer

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

## License

This project is private and proprietary.
