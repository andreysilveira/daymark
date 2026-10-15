# Daymark — Desktop To-Do Application

**Daymark** is a personal, local-first desktop task manager designed for everyday focus and clarity. Inspired by the editorial polish of Things 3 and Linear, Daymark provides an offline-first productivity tool with instant interactions, keyboard-driven navigation, and zero cloud dependencies.

---

## Features

- **Local-First & Offline**: All tasks, projects, and settings reside in a local SQLite database on your machine. No accounts, telemetry, or server dependencies.
- **Fast Task Management**:
  - Quick-add tasks with `Ctrl+N` or inline inputs.
  - Inline title editing with Enter to confirm, Escape to cancel.
  - Rich task details with optional multi-line descriptions, due dates, and project assignments.
  - Immediate visual feedback on task completion and reopening.
- **Contextual Views**:
  - **Today**: Incomplete tasks due today as well as overdue tasks that remain visible until completed or rescheduled.
  - **Upcoming**: Incomplete future tasks grouped chronologically by date headings.
  - **Inbox**: Incomplete tasks without a due date.
  - **Completed**: Log of finished tasks with one-click reopening.
  - **Projects**: Dedicated project views with custom color indicators.
- **Safe Project Organization**:
  - Create, rename, archive, and delete projects.
  - Foreign key enforcement (`ON DELETE SET NULL`) ensures tasks are never deleted when a project is removed or archived.
- **Instant Search (`Ctrl+K`)**:
  - Local search querying titles and descriptions across all active and completed tasks.
- **Adaptive Theming**:
  - **Light** (soft neutral palette), **Dark** (layered graphite surfaces), and **System** (dynamically reacts to OS appearance changes).
  - Choice persisted in SQLite.
- **Keyboard-Driven Workflow**:
  - `Ctrl/Cmd + N`: Create new task.
  - `Ctrl/Cmd + K`: Open local search.
  - `Enter`: Confirm valid task creation or inline edit.
  - `Escape`: Close modals or cancel active editing.
  - `Space`: Toggle completion when a task item is focused (safely disabled inside text inputs).

---

## Technology Stack

- **Desktop Framework**: [Tauri 2](https://v2.tauri.app/) (Rust native backend)
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with CSS design tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **Persistence**: SQLite via official `@tauri-apps/plugin-sql` and `tauri-plugin-sql`
- **Testing**: [Vitest](https://vitest.dev/) with Happy-DOM

---

## Architecture & Code Structure

```text
daymark/
├── src/
│   ├── components/
│   │   ├── layout/          # Sidebar, Header
│   │   ├── projects/        # ProjectModal
│   │   ├── tasks/           # TaskList, TaskItem, TaskQuickAdd, TaskDetailModal
│   │   └── ui/              # Button, Input, Modal, SearchModal
│   ├── database/
│   │   ├── db.ts            # Centralized DB loader & Tauri plugin wrapper
│   │   ├── migrations.ts    # Schema migrations & runner
│   │   ├── inMemoryDb.ts    # In-memory SQLite simulator for tests & web preview
│   │   └── types.ts         # Database abstraction interfaces
│   ├── hooks/
│   │   ├── useTheme.ts      # Theme state, OS sync, SQLite persistence
│   │   ├── useTasks.ts      # Tasks state, view filtering, CRUD mutations
│   │   ├── useProjects.ts   # Projects state, active/archived separation
│   │   └── useKeyboardShortcuts.ts # Global keyboard shortcuts
│   ├── services/
│   │   ├── tasks.ts         # Task validation, parameterized SQL queries, search
│   │   ├── projects.ts      # Project CRUD, archiving, safe deletion
│   │   └── settings.ts      # Theme preference persistence in SQLite
│   ├── types/               # TypeScript interfaces & types
│   ├── utils/
│   │   └── date.ts          # Calendar date logic (YYYY-MM-DD) preventing timezone shifts
│   ├── App.tsx              # Application shell & root coordinator
│   ├── main.tsx             # Entry point
│   └── index.css            # Design tokens & theme definitions
├── src-tauri/
│   ├── capabilities/        # Tauri 2 permission capabilities (`sql:default`, etc.)
│   ├── src/                 # Rust main & lib registering plugins
│   ├── Cargo.toml           # Tauri 2 & tauri-plugin-sql dependencies
│   └── tauri.conf.json      # Window settings (1000x700 viewport)
├── tests/
│   ├── date.test.ts         # Unit tests for date calculations & formatting
│   ├── validation.test.ts   # Unit tests for input validations
│   ├── filtering.test.ts    # Unit tests for view categorization
│   └── services.test.ts     # Integration tests for tasks, projects, migrations, search
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+) and `npm`
- [Rust](https://www.rust-lang.org/) (cargo toolchain)
- Platform dependencies for Tauri 2 (Visual Studio C++ Build Tools and WebView2 on Windows)

---

## Installation & Setup

1. Clone or open the repository:
   ```bash
   cd daymark
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## Available Commands

### Development

- **Run Desktop App (Tauri + Vite Dev)**:
  ```bash
  npm run tauri dev
  ```
- **Run Frontend Dev Server**:
  ```bash
  npm run dev
  ```

### Testing

- **Run Automated Test Suite (Vitest)**:
  ```bash
  npm test
  ```
- **Run Tests in Watch Mode**:
  ```bash
  npm run test:watch
  ```

### Build & Typecheck

- **TypeScript Typecheck**:
  ```bash
  npx tsc --noEmit
  ```
- **Frontend Production Build**:
  ```bash
  npm run build
  ```
- **Tauri Desktop Release Build**:
  ```bash
  npm run tauri build
  ```

---

## Database Location & Persistence Behavior

- **Database file**: `daymark.db`
- **Location**: In Tauri desktop runtime, the database is stored in the operating system's standard application data folder:
  - **Windows**: `%APPDATA%\com.yerdna.daymark\daymark.db`
  - **macOS**: `~/Library/Application Support/com.yerdna.daymark/daymark.db`
  - **Linux**: `~/.config/com.yerdna.daymark/daymark.db`
- **Integrity**: SQLite migrations execute on startup. Foreign key enforcement (`PRAGMA foreign_keys = ON;`) ensures data consistency. Deleting a project safely unlinks tasks (`ON DELETE SET NULL`) rather than deleting them.
- **Testing Isolation**: Automated tests execute using an isolated in-memory database instance, guaranteeing test runs never overwrite or modify user data.

---

## Current Limitations

- Natural language date parsing (e.g. "meeting next Friday at 3pm") is reserved for future releases; tasks currently support direct date pickers and presets (Today, Tomorrow).
- Single-window desktop experience tailored for personal use.
