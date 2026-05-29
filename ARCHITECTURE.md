# Kanban Task Manager — Architecture

## 1. Folder Architecture

```
kanban-task-manager/
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── seed.ts                  # Dev seed data
│   └── prisma.config.ts         # Prisma 7 CLI config
├── src/
│   ├── app/
│   │   ├── api/tasks/
│   │   │   ├── route.ts          # GET all, POST single
│   │   │   ├── [id]/route.ts     # PATCH update, DELETE
│   │   │   └── bulk-import/route.ts  # POST bulk
│   │   ├── error.tsx             # Client error boundary
│   │   ├── loading.tsx           # Skeleton loading state
│   │   ├── globals.css           # Tailwind v4 + dark theme
│   │   ├── layout.tsx            # Root layout (dark, Toaster)
│   │   └── page.tsx              # Main board page
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives
│   │   └── kanban/
│   │       ├── kanban-board.tsx   # DndContext, search, sort, compact
│   │       ├── kanban-column.tsx  # Droppable column, time totals
│   │       ├── kanban-card.tsx    # Draggable card, compact variant
│   │       ├── kanban-navbar.tsx  # Search, compact toggle, actions
│   │       ├── task-dialog.tsx    # Create/edit form (key-remount)
│   │       └── bulk-import-dialog.tsx  # Paste→preview flow
│   ├── lib/
│   │   ├── prisma.ts             # Lazy PrismaClient singleton
│   │   ├── db.ts                 # Type-safe CRUD with Prisma enums
│   │   ├── schemas.ts            # Shared Zod schemas
│   │   └── utils.ts              # cn(), formatMinutes, sortByPriority, filterTasks
│   ├── store/
│   │   └── use-board-store.ts    # Zustand + toast notifications
│   ├── types/
│   │   └── index.ts              # Task, Priority, Difficulty, Status, constants
│   └── generated/prisma/         # Prisma generated client (gitignored)
├── .prettierrc
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── ARCHITECTURE.md
```

## 2. Tech Stack

- **Next.js 16.2.6** (App Router, Turbopack)
- **TypeScript** (strict mode)
- **Tailwind CSS v4** (CSS-based config, no JS config)
- **shadcn/ui** (dark theme, glassmorphism)
- **Prisma 7.8.0** + MariaDB adapter (local MySQL)
- **Zod** (shared validation — server route handlers + client dialogs)
- **Zustand** (client state with selector subscriptions)
- **@dnd-kit** (drag-and-drop: core, sortable, modifiers)
- **sonner** (toast notifications)
- **Lucide** (icons)
- **ESLint** + **Prettier** (code quality)

## 3. Database Schema

Single `Task` table — no relations.

```prisma
model Task {
  id               String     @id @default(cuid())
  task             String
  priority         Priority   @default(MEDIUM)
  difficulty       Difficulty @default(MEDIUM)
  estimatedMinutes Int        @default(30) @map("estimated_minutes")
  status           Status     @default(BACKLOG)
  createdAt        DateTime   @default(now()) @map("created_at")
  updatedAt        DateTime   @updatedAt @map("updated_at")

  @@index([status])
  @@index([priority])
  @@index([status, priority])
}
```

## 4. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **No position field** | User spec: drag-and-drop updates only status |
| **Lazy PrismaClient** | `getPrisma()` avoids build-time crash on missing DATABASE_URL |
| **Shared Zod schemas** | `schemas.ts` imported by both server routes and client dialogs |
| **Zustand selectors** | Individual field subscriptions prevent unnecessary re-renders |
| **Column memo comparator** | Deep-equality on task content prevents stale renders |
| **Card ghost during drag** | `transform: undefined` on ghost; DragOverlay shows lifted clone |
| **Dialog key-remount** | `key={task?.id ?? 'new'}` avoids useEffect for form state reset |
| **Type-safe Prisma enums** | `db.ts` uses `PrismaPriority`/`PrismaDifficulty`/`PrismaStatus` literal types |
| **Two-step bulk import** | Paste → client-side safeParse preview → confirm; per-item validation |

## 5. State Flow

```
User Action → Zustand Action → fetch() → Route Handler → Zod parse → Prisma → MySQL
                                              ↓
                                         Response JSON
                                              ↓
                                     Zustand set() → React re-render
                                              ↓
                                     toast.success() / toast.error()
```

Optimistic update for `moveTask`: status updated immediately in store, rolled back on API failure.

## 6. UI Features

- **4 columns**: Backlog, Todo, In Progress, Done
- **Drag-and-drop**: PointerSensor (8px activation) + KeyboardSensor
- **Search**: Filters by task, priority, difficulty (case-insensitive)
- **Priority sorting**: Critical → High → Medium → Low within each column
- **Time totals**: Column header shows total estimated minutes (e.g., "3h 30m")
- **Compact mode**: Toggle for denser cards (single-char badges, less padding)
- **Empty states**: Per-column contextual messages ("No tasks queued", etc.) + board-level "no matches" for search
- **Toast notifications**: Success/error for create, update, delete, bulk import
- **Error boundary**: `src/app/error.tsx` with reset button
- **Loading skeleton**: Column skeleton placeholders in `loading.tsx`

## 7. Code Quality

- ESLint (Next.js core-web-vitals + TypeScript rules)
- Prettier (`.prettierrc`: semicolons off, single quotes, trailing commas)
- `npm run lint` — ESLint check
- `npm run format` — Prettier write
- `npm run format:check` — Prettier check

## 8. Development Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |
