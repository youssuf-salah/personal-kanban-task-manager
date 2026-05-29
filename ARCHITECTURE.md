# Kanban Task Manager — Architecture

## 1. Folder Architecture

```
kanban-task-manager/
├── prisma/
│   └── schema.prisma            # Database schema
├── public/                       # Static assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── tasks/
│   │   │       ├── route.ts      # GET all, POST (single + bulk)
│   │   │       └── [id]/
│   │   │           └── route.ts  # PUT update, DELETE
│   │   ├── globals.css           # Tailwind v4 + dark theme vars
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Main board page (client component)
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── kanban-board.tsx      # Board container (DndContext)
│   │   ├── kanban-column.tsx     # Single column (SortableContext)
│   │   ├── kanban-card.tsx       # Task card (SortableItem)
│   │   ├── task-dialog.tsx       # Create/edit task dialog
│   │   └── bulk-import-dialog.tsx# Bulk JSON import dialog
│   ├── lib/
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── db.ts                 # Database query functions
│   │   └── utils.ts              # cn() helper, formatters
│   ├── store/
│   │   └── use-board-store.ts    # Zustand store
│   └── types/
│       └── index.ts              # Shared TypeScript types
├── .env                          # DATABASE_URL
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── ARCHITECTURE.md
```

## 2. Tech Architecture

**Full-stack Next.js App Router** — a single Next.js process serves both the API and the frontend. No separate backend.

- **Database**: Local MySQL via Prisma ORM
- **API**: Next.js Route Handlers (`src/app/api/tasks/`)
- **Frontend**: Client Components (React Server Components are not useful here since the board is highly interactive)
- **Styling**: Tailwind CSS v4 (CSS-based config, no JS config file)
- **UI Components**: shadcn/ui (Radix primitives + Tailwind)
- **Drag & Drop**: @dnd-kit (lightweight, React-first, accessible)
- **Client State**: Zustand (minimal, no boilerplate)

## 3. Database Schema

Single table — no relations needed for a single-user kanban.

```prisma
model Task {
  id               String   @id @default(cuid())
  title            String
  priority         Priority @default(MEDIUM)
  difficulty       Difficulty @default(MEDIUM)
  estimatedMinutes Int      @default(30)
  status           Status   @default(BACKLOG)
  position         Float    // for ordering within a column
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

enum Priority { CRITICAL HIGH MEDIUM LOW }
enum Difficulty { HARD MEDIUM EASY }
enum Status { BACKLOG TODO IN_PROGRESS DONE }
```

**Why `position` is a Float**: Allows inserting a card between two others by using the midpoint of their positions (e.g., position 3.5 between 3 and 4). Avoids re-indexing all siblings on every move.

## 4. State Management

**Zustand** — single store for client-side board state.

```
Store:
  tasks: Task[]                  // all tasks from server
  isLoading: boolean
  error: string | null

  Actions:
  fetchTasks()                   // GET /api/tasks → set tasks
  createTask(data)               // POST /api/tasks → add to tasks
  updateTask(id, data)           // PUT /api/tasks/[id] → update tasks
  deleteTask(id)                 // DELETE /api/tasks/[id] → remove from tasks
  moveTask(id, newStatus, newPos)// updateTask + reorder
  bulkImport(tasks[])            // POST /api/tasks (array) → replace tasks
```

**Data flow**: Server is the source of truth. All mutations go through the API. On success, the store updates optimistically or from the server response.

## 5. UI Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  [App Name]                     [+ New Task] [+ Import] │
├──────────┬──────────┬──────────┬────────────────────────┤
│ BACKLOG  │   TODO   │  IN PROG │   DONE                 │
│ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐              │
│ │ Card │ │ │ Card │ │ │ Card │ │ │ Card │              │
│ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘              │
│ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐              │
│ │ Card │ │ │ Card │ │ │ Card │ │ │ Card │              │
│ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘              │
│          │          │          │                        │
│ [+ Add]  │ [+ Add]  │ [+ Add]  │ [+ Add]               │
└──────────┴──────────┴──────────┴────────────────────────┘
```

- Full viewport height, no scrolling on the page body
- Each column scrolls independently when its cards overflow
- Cards are compact: title, priority badge, difficulty badge, time estimate, delete button
- Dialog overlay for create/edit with form fields
- Drag handle or long-press to reorder

## 6. Implementation Roadmap

| Step | What | Why |
|------|------|-----|
| 1 | Prisma schema + client setup | Foundation |
| 2 | TypeScript types | Shared contract |
| 3 | API routes (CRUD) | Server operations |
| 4 | Zustand store | Client state |
| 5 | shadcn/ui primitives | UI building blocks |
| 6 | KanbanBoard + column + card | Core UI |
| 7 | Drag & drop with @dnd-kit | Interaction |
| 8 | Task dialog (create/edit) | Data entry |
| 9 | Bulk import dialog | Power feature |
| 10 | Polish (theme, empty states, keyboard) | UX |

## 7. Dependency List

**Already installed:**
- next, react, react-dom, typescript, tailwindcss, postcss
- @tailwindcss/postcss, eslint-config-next

**To install:**
- `prisma` — ORM CLI
- `@prisma/client` — ORM runtime
- `@dnd-kit/core` — drag-and-drop primitives
- `@dnd-kit/sortable` — sortable preset
- `@dnd-kit/utilities` — utility functions
- `zustand` — state management
- `zod` — validation
- `class-variance-authority` — shadcn dependency
- `clsx` + `tailwind-merge` — cn() utility
- `lucide-react` — icons

**shadcn/ui components to add:**
- button, dialog, input, textarea, select, badge, card

## 8. Reasoning for Major Decisions

**Why not server components?** The board is 100% interactive (drag-and-drop, real-time reordering). Client components are simpler and avoid RSC serialization overhead for this use case.

**Why Zustand over Context/Redux?** Zustand has zero boilerplate, works outside React components (useful for the store), and doesn't cause unnecessary re-renders.

**Why @dnd-kit over react-beautiful-dnd?** react-beautiful-dnd is unmaintained. @dnd-kit is actively maintained, tree-shakeable, accessible, and works with React 18/19.

**Why Float position instead of integer order?** Midpoint insertion avoids re-indexing N siblings on every drag. Only when positions converge (gap < 0.001) do we normalize.

**Why shadcn/ui?** It's not a component library — it's copy-paste components built on Radix primitives. Full control over styling, no dependency lock-in, tree-shakeable by nature.

**Single table design:** A personal kanban has no users, no teams, no projects, no tags. A single `Task` table with an enum status column is the simplest correct design.

**No Docker:** MySQL is running natively. Docker would add complexity with no benefit for a local-only project.
