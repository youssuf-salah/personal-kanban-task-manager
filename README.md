# Kanban Task Manager

A local-first Kanban board for tracking AI engineering learning tasks. Built with Next.js, designed to run on your own machine with no cloud dependencies, accounts, or subscriptions.

![Screenshot placeholder](./public/screenshot.png)

---

## Features

- **Four-column Kanban board** — Backlog → Todo → In Progress → Done
- **Drag and drop** — Move tasks between columns and priority folders
- **Priority folders** — Tasks are grouped by priority (Critical, High, Medium, Low) inside each column
- **Create / Edit / Delete tasks** — Full CRUD via a clean dialog window
- **Bulk import** — Paste multiple tasks at once with a preview step
- **Search and filter** — Find tasks by name across the entire board
- **Compact mode** — Toggle a denser card layout to see more tasks at once
- **Time estimates** — Each task has an estimated duration; totals shown per column
- **Dark theme** — Professional glassmorphism styling, easy on the eyes
- **Keyboard accessible** — Full keyboard navigation for drag-and-drop

---

## Screenshots

*(Add screenshots here)*

| View | Preview |
|------|---------|
| Full board | ![](./public/screenshots/board.png) |
| Task dialog | ![](./public/screenshots/dialog.png) |
| Bulk import | ![](./public/screenshots/bulk-import.png) |

---

## Tech Stack

| Technology | What it does |
|------------|-------------|
| **Next.js** | The web framework that runs the app and serves pages |
| **TypeScript** | Adds type safety to JavaScript (catches mistakes before running) |
| **Tailwind CSS** | A utility CSS framework for styling (no separate CSS files to manage) |
| **Prisma** | Talks to the database — lets the app read/write tasks using JavaScript code |
| **MySQL** | The database where all your tasks are stored |
| **shadcn/ui** | A collection of pre-built UI components (buttons, dialogs, inputs, etc.) |
| **Zustand** | Manages the app's state (which tasks are loaded, which column they're in) |
| **@dnd-kit** | Handles the drag-and-drop interactions |
| **Zod** | Validates data before saving it to the database |
| **Sonner** | Shows toast notifications (the small pop-up messages) |

---

## Prerequisites

Before you start, install these three things:

### 1. Node.js (includes npm)

Node.js lets you run JavaScript on your computer. npm installs the project's dependencies.

**Download:** https://nodejs.org/ (get the **LTS** version)

**Verify it installed:**
Open a terminal (Command Prompt, PowerShell, or Terminal) and run:

```bash
node --version
```

Expected output: something like `v20.11.0` or higher.

```bash
npm --version
```

Expected output: something like `10.2.4` or higher.

### 2. MySQL

MySQL is the database that stores your tasks.

**Download:** https://dev.mysql.com/downloads/installer/

Choose **MySQL Installer for Windows** (if on Windows). During installation:

- Choose **Developer Default**
- Set a **root password** — write it down, you'll need it soon
- Keep the default port **3306**
- Make sure **MySQL Server** is selected

**Verify it installed:**

```bash
mysql --version
```

Expected output: something like `mysql Ver 9.7.0`.

### 3. MySQL Workbench (optional but recommended)

A visual tool to manage your MySQL database.

**Download:** https://dev.mysql.com/downloads/workbench/

Install it and connect to your local MySQL server using root and the password you set.

---

## Setup Instructions

### Step 1: Create the database

**Using MySQL Workbench:**

1. Open MySQL Workbench
2. Click on your local connection (localhost:3306)
3. In the query editor, paste the SQL block from Step 2
4. Click the lightning bolt icon (Execute) to run it

**Using the command line:**

Open a terminal and run:

```bash
mysql -u root -p
```

Enter your root password when prompted. Then paste and run the SQL block from Step 2.

### Step 2: Run the SQL migration

This creates the database and the table that stores your tasks. Copy and run this entire block:

```sql
CREATE DATABASE IF NOT EXISTS kanban_task_manager
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE kanban_task_manager;

CREATE TABLE IF NOT EXISTS `Task` (
    `id` VARCHAR(30) NOT NULL,
    `task` VARCHAR(191) NOT NULL,
    `priority` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') NOT NULL DEFAULT 'MEDIUM',
    `difficulty` ENUM('HARD', 'MEDIUM', 'EASY') NOT NULL DEFAULT 'MEDIUM',
    `estimated_minutes` INT NOT NULL DEFAULT 30,
    `status` ENUM('BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE') NOT NULL DEFAULT 'BACKLOG',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `Task_status_idx` (`status`),
    INDEX `Task_priority_idx` (`priority`),
    INDEX `Task_status_priority_idx` (`status`, `priority`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
```

> ✅ **Expected outcome:** MySQL creates a database called `kanban_task_manager` and a table called `Task`. You can verify this in MySQL Workbench by expanding the database list.

### Step 3: Clone or download the project

If you have Git installed:

```bash
git clone <repository-url>
cd kanban-task-manager
```

If you downloaded a ZIP file, extract it and open a terminal in the extracted folder.

### Step 4: Configure the environment file

In the project folder, create a file named `.env` (no extension, just `.env`). Add this line:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/kanban_task_manager"
```

Replace `YOUR_PASSWORD` with the root password you set during MySQL installation.

> ⚠️ **Important:** Use your actual MySQL password. If your password contains special characters like `$`, `@`, `!`, or `#`, they need special handling — wrap the entire URL in double quotes as shown above.

**Examples:**

```
Password: mypassword123
DATABASE_URL="mysql://root:mypassword123@localhost:3306/kanban_task_manager"

Password: DevQezcsasdw120$@
DATABASE_URL="mysql://root:DevQezcsasdw120$@@localhost:3306/kanban_task_manager"
```

### Step 5: Install dependencies

Still in the project folder, run:

```bash
npm install
```

This downloads all the libraries the project needs. Expected output: a progress bar, then a success message.

> ⚠️ **Troubleshooting:** If you see errors, make sure you're in the right folder (the one containing `package.json`). Run `dir` (Windows) or `ls` (Mac/Linux) to check.

### Step 6: Generate the Prisma client

```bash
npm run db:generate
```

This creates the code that lets the app talk to your database. Expected output:

```
✔ Generated Prisma Client (v7.x.x) to .\src\generated\prisma
```

### Step 7: (Optional) Seed the database with sample tasks

```bash
npm run db:seed
```

This adds 5 sample tasks so you can see the board with data right away. Expected output: a success message.

> 💡 **Tip:** You can skip this if you want to start with an empty board.

### Step 8: Start the development server

```bash
npm run dev
```

Expected output:

```
▲ Next.js x.x.x
- Local: http://localhost:3000
```

### Step 9: Open the app

Open your browser and go to:

```
http://localhost:3000
```

You should see the Kanban board. If you ran the seed command, it will have sample tasks. Otherwise, click the **New Task** button to add your first task.

> ⚠️ **Tip:** If you see a blank page or connection errors, make sure MySQL is running. See the troubleshooting section below.

---

## How to Use

### Creating a Task

1. Click **New Task** in the top navigation bar
2. Fill in the task name, priority, difficulty, and estimated time
3. Click **Save**

The task appears in the Backlog column.

### Editing a Task

1. Click on any task card
2. The dialog opens with the task details pre-filled
3. Make your changes and click **Save**

### Deleting a Task

1. Click on a task to open the edit dialog
2. Click the **Delete** button at the bottom
3. Confirm deletion

### Moving Tasks with Drag and Drop

1. Click and hold the **grip handle** (the six dots icon) on the left side of a task card
2. Drag it to another column or priority folder
3. Release to drop it

The task updates automatically in the database.

### Using Priority Folders

Each column has four expandable folders: Critical, High, Medium, and Low.

- Click a folder header to expand or collapse it
- Drag tasks into a specific folder to set their priority
- The folder colors hint at the priority level:
  - **Critical** — Red accent
  - **High** — Orange accent
  - **Medium** — Blue accent
  - **Low** — Zinc (gray) accent

### Bulk Importing Tasks

1. Click **Import** in the top navigation bar
2. Paste a list of tasks. Each task on its own line, formatted as:
   ```
   Task name | Priority | Difficulty | Minutes
   ```
   Example:
   ```
   Learn about transformers | Medium | Hard | 120
   Build a RAG pipeline | High | Medium | 90
   Watch attention mechanism video | Low | Easy | 45
   ```
3. Click **Preview** to validate your entries
4. Fix any errors (shown inline in red)
5. Click **Import** to add all valid tasks at once

### Searching Tasks

Type in the search bar at the top. The board filters to show only matching tasks.

### Compact Mode

Click the compact toggle button (next to the search bar) to switch between normal and compact card layouts. Compact mode shows smaller badges and less padding, fitting more tasks on screen.

---

## Project Structure

```
kanban-task-manager/
├── prisma/
│   ├── schema.prisma       Database model definition
│   ├── seed.ts             Sample data for development
│   └── prisma.config.ts    Prisma configuration
├── public/
│   └── screenshots/        (add screenshots here)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── tasks/      REST API routes (backend endpoints)
│   │   ├── globals.css     Global styles and theme
│   │   ├── layout.tsx      Root layout (HTML shell)
│   │   ├── page.tsx        Home page (the board)
│   │   ├── loading.tsx     Loading skeleton animation
│   │   └── error.tsx       Error page with reset button
│   ├── components/
│   │   └── kanban/
│   │       ├── kanban-board.tsx       Main board with drag-and-drop
│   │       ├── kanban-column.tsx      Individual column
│   │       ├── priority-folder.tsx    Priority group inside a column
│   │       ├── kanban-card.tsx        Single task card
│   │       ├── kanban-navbar.tsx      Top navigation bar
│   │       ├── task-dialog.tsx        Create/edit task dialog
│   │       └── bulk-import-dialog.tsx Bulk import dialog
│   ├── lib/
│   │   ├── db.ts            Database read/write functions
│   │   ├── prisma.ts        Database connection setup
│   │   ├── schemas.ts       Data validation rules (Zod)
│   │   └── utils.ts         Helper functions
│   ├── store/
│   │   └── use-board-store.ts  App state management (Zustand)
│   └── types/
│       └── index.ts         TypeScript type definitions
├── .env                     (your database connection string)
├── .prettierrc              Code formatting rules
├── package.json             Project metadata and scripts
├── tsconfig.json            TypeScript configuration
└── README.md                This file
```

---

## Available Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start the development server (http://localhost:3000) |
| `npm run build` | Build the app for production |
| `npm run start` | Start the production server (after `npm run build`) |
| `npm run lint` | Check for code quality issues |
| `npm run format` | Auto-format your code |
| `npm run db:generate` | Generate the Prisma client after schema changes |
| `npm run db:seed` | Fill the database with sample tasks |

---

## Troubleshooting

### "Can't connect to MySQL server"

**Cause:** MySQL is not running.

**Fix:**
- **Windows:** Open Services (search for "Services" in Start), find "MySQL" or "MySQL80", right-click and select **Start**
- **Mac:** Run `brew services start mysql` in Terminal
- **Linux:** Run `sudo systemctl start mysql`

### "Access denied for user 'root'"

**Cause:** Wrong password or the database doesn't exist yet.

**Fix:**
1. Double-check your password in `.env`
2. Make sure you ran the SQL migration (Step 2 above) to create the database
3. Verify MySQL is running (see above)

### "Authentication plugin 'caching_sha2_password' cannot be loaded"

**Cause:** MySQL 9.x uses a newer authentication method.

**Fix:** The app already handles this automatically. Make sure you're using MySQL 9.x or later. If you're on an older MySQL version, update or add `?auth_plugin_name=mysql_native_password` to your DATABASE_URL.

### "Port 3306 already in use"

**Cause:** Another MySQL instance is running, or something else is using port 3306.

**Fix:**
1. Run `netstat -ano | findstr :3306` to see what's using the port
2. Stop the conflicting service, or change MySQL's port in the MySQL configuration

### "npm install fails"

**Cause:** Network issues or missing build tools.

**Fix:**
1. Run `npm cache clean --force` and try again
2. Make sure you have an internet connection
3. If you're behind a corporate proxy, configure npm: `npm config set proxy http://proxy:port`

### "Prisma client not found"

**Cause:** You haven't generated the Prisma client after setting up the project.

**Fix:** Run `npm run db:generate`

### "Module not found: Can't resolve '...'"

**Cause:** Dependencies weren't installed correctly.

**Fix:** Delete `node_modules` and `package-lock.json`, then run `npm install` again.

### "Blank page at localhost:3000"

**Cause:** The database connection failed silently, or a build error occurred.

**Fix:**
1. Check the terminal where `npm run dev` is running for error messages
2. Make sure MySQL is running and the database exists
3. Verify your `.env` file is correct

### "Drag-and-drop doesn't update the task"

**Cause:** A browser refresh might be needed, or there was a database error.

**Fix:**
1. Refresh the page (F5 or Cmd+R)
2. Check the terminal for error messages
3. Open your browser's developer console (F12) and look for red error messages

### "Dialog won't close"

**Cause:** This was a known bug that has been fixed.

**Fix:** Make sure you're on the latest version of the code. If the issue persists, refresh the page.

---

## Future Improvements

- [ ] Task due dates and calendar view
- [ ] Subtasks / checklist within a task
- [ ] Tags and labels (beyond priority)
- [ ] Markdown support in task descriptions
- [ ] Dark/light theme toggle
- [ ] Export board to JSON or CSV
- [ ] Undo/redo for drag-and-drop moves
- [ ] Column customization (add/rename/remove columns)
- [ ] Task archives (instead of permanent delete)
- [ ] Keyboard shortcuts for common actions
- [ ] PWA support (install as a desktop app)

---

## License

MIT
