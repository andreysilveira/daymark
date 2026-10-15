# ✦ Daymark

### A quieter way to get things done.

A modern, local-first desktop task manager built for everyday focus. Organize your day, manage projects, and track your progress through a clean interface designed to stay out of your way.

**Offline-first · SQLite-powered · Privacy-focused**

<p align="center">

  <img src="https://img.shields.io/badge/Tauri-2-24C8DB?style=flat-square&logo=tauri&logoColor=white" alt="Tauri 2" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Rust-Powered-DEA584?style=flat-square&logo=rust&logoColor=black" alt="Rust" />
  <img src="https://img.shields.io/badge/SQLite-Local%20Storage-003B57?style=flat-square&logo=sqlite&logoColor=white" alt="SQLite" />

</p>

---

## ✨ Features

### 📝 Effortless task management

- **Quick capture** — create tasks without unnecessary steps.
- **Inline editing** — update task titles directly in the list.
- **Task details** — add descriptions, due dates, and project assignments.
- **Completion tracking** — complete and reopen tasks instantly.
- **Safe deletion** — remove tasks with clear, intentional interactions.

### 🗓️ Your day, organized

- **Today** — see tasks due today and overdue tasks that remain unfinished.
- **Upcoming** — organize future tasks chronologically.
- **Inbox** — keep undated tasks in one place.
- **Completed** — revisit finished tasks and reopen them when needed.
- **Projects** — organize tasks with project names and color indicators.

### 🎨 A workspace that feels right

- **Light theme** — a soft, neutral color palette.
- **Dark theme** — layered graphite surfaces and subtle accents.
- **System theme** — automatically follow the operating system's appearance.
- **Persistent preferences** — remember your selected theme between sessions.

### ⚡ Keyboard-first workflow

| Shortcut       | Action                                   |
| -------------- | ---------------------------------------- |
| `Ctrl/Cmd + N` | Create a task                            |
| `Ctrl/Cmd + K` | Search tasks                             |
| `Enter`        | Confirm creation or inline editing       |
| `Escape`       | Close dialogs or cancel editing          |
| `Space`        | Toggle completion when a task is focused |

### 🔒 Local-first by design

- Tasks, projects, and settings are stored in a local SQLite database.
- Core functionality works offline.
- No accounts or cloud services are required.
- No analytics or telemetry.
- Database migrations maintain schema consistency.
- Removing a project does not delete its associated tasks.

---

## 🛠️ Tech Stack

| Technology                                    | Purpose                              |
| --------------------------------------------- | ------------------------------------ |
| [Tauri 2](https://v2.tauri.app/)              | Desktop application framework        |
| [React 19](https://react.dev/)                | User interface                       |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe application logic          |
| [Vite](https://vite.dev/)                     | Development server and build tooling |
| [Tailwind CSS](https://tailwindcss.com/)      | Styling and design system            |
| [Rust](https://www.rust-lang.org/)            | Native desktop integration           |
| [SQLite](https://www.sqlite.org/)             | Local data persistence               |
| [Vitest](https://vitest.dev/)                 | Automated testing                    |
| [Lucide](https://lucide.dev/)                 | Interface icons                      |

---

## 🚀 Getting Started

### Prerequisites

Install the following tools before running the application:

- [Node.js](https://nodejs.org/) and npm.
- [Rust](https://www.rust-lang.org/tools/install) and Cargo.
- [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for your operating system.

On Windows, this includes the required Microsoft C++ Build Tools and WebView2 runtime.

### Installation

Clone the repository and enter the project directory:

```bash
git clone <repository-url>
cd daymark
```

Install dependencies:

```bash
npm install
```

### Development

Launch the desktop application:

```bash
npm run tauri dev
```

Run only the frontend development server:

```bash
npm run dev
```

### Testing and Quality

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Check TypeScript:

```bash
npx tsc --noEmit
```

### Production Build

Build the frontend:

```bash
npm run build
```

Build the desktop application:

```bash
npm run tauri build
```

The resulting installer and application bundles are generated according to the configured Tauri build targets.

---

## 🗄️ Data & Persistence

Daymark uses SQLite to persist tasks, projects, and application preferences.

The database is stored in the operating system's application data directory rather than inside the installation directory.

| Platform | Typical location                                              |
| -------- | ------------------------------------------------------------- |
| Windows  | `%APPDATA%\com.yerdna.daymark\daymark.db`                     |
| macOS    | `~/Library/Application Support/com.yerdna.daymark/daymark.db` |
| Linux    | `~/.config/com.yerdna.daymark/daymark.db`                     |

The exact location depends on the configured Tauri application identifier and database initialization.

### Data integrity

- Database migrations initialize and evolve the schema.
- Foreign-key enforcement protects relational integrity.
- Deleting a project unlinks its tasks rather than deleting them.
- Automated tests use an isolated in-memory database to protect real user data.

**Note:** Back up the application database before manually modifying or migrating it.

---

## 🧱 Architecture

Daymark separates its user interface, application logic, persistence layer, and native desktop integration.

```text
daymark/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── projects/
│   │   ├── tasks/
│   │   └── ui/
│   ├── database/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── src-tauri/
│   ├── capabilities/
│   ├── src/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── tests/
├── package.json
└── vite.config.ts
```

### Design principles

- **Simplicity** — keep the architecture proportional to the application's needs.
- **Separation of concerns** — distinguish presentation, application logic, and persistence.
- **Type safety** — use TypeScript to make data contracts explicit.
- **Data ownership** — keep persistent application data under local control.
- **Testability** — validate core business rules and database operations independently.

---

## 🗺️ Current Limitations

- Natural-language date parsing is not included.
- The application is designed primarily for individual desktop use.
- Cloud synchronization and multi-device collaboration are outside the current scope.

---

## 📌 Project Status

Daymark is a personal desktop productivity project focused on a minimal, polished, offline-first experience.

The initial goal is to deliver reliable task management, project organization, adaptive theming, and local persistence before considering additional features.

---

## 📄 License

This project is licensed under the MIT License.
