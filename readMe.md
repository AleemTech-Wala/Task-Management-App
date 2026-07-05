# 📋 Task Manager Application

A modern, fully-featured task management app built with **pure Vanilla JavaScript** — no frameworks, no libraries.

---

## 🚀 Live Demo

[View Live Demo]( https://aleemtech-wala.github.io/Task-Management-App/)

[View Live Demo] (https://task-manager92.netlify.app/)

---

## ✅ Features

### Core Functionality
- Add tasks with title, description, priority and due date
- Mark tasks complete / incomplete with checkbox
- Edit existing tasks via form
- Delete tasks with confirmation modal
- Real-time search across title and description
- Filter tasks — All, Active, Completed
- Sort tasks — Date (newest/oldest), Priority, Alphabetically
- Task counters — Total, Active, Completed
- localStorage persistence — data survives page refresh
- Clear all completed tasks at once

### UI / UX
- Modern gradient design
- Fully responsive — mobile, tablet, desktop
- Smooth animations — slide-in, slide-out on add/delete
- Form validation with inline error messages
- Character counter for description (warning at 250+)
- Empty state message when no tasks
- Keyboard shortcuts — `Enter`, `Escape`, `Ctrl+Enter`
- Hover effects on all interactive elements
- Priority color coding — 🔴 High, 🟡 Medium, 🟢 Low
- Overdue task highlighting
- Smart date formatting — Today, Tomorrow, In X days, X days ago

---

## 🛠️ Technologies

| Technology | Usage |
|---|---|
| HTML5 | Semantic structure |
| CSS3 | Flexbox, Grid, Animations |
| JavaScript ES6+ | All app logic |
| localStorage API | Data persistence |

---

## 📁 Project Structure

```
Task_Manager_App/
├── index.html      # App structure and markup
├── styles.css      # All styling and animations
├── app.js          # Complete app logic
└── readMe.md        # This documentation
```

---

## ⚙️ Technical Highlights

- **Vanilla JS** — no jQuery, no frameworks
- **Event Delegation** — single listener handles all task actions
- **XSS Prevention** — HTML escaping on all user input
- **Error Handling** — try/catch on all localStorage operations
- **Modular Functions** — each function does one job
- **Clean Code** — fully commented throughout

---

## 💻 Installation

```bash
# 1. Clone the repo
git clone https://github.com/AleemTech-Wala/task-manager.git

# 2. Open in browser
open index.html
```

No build step. No npm install. Just open and run.

---

## 👤 Author

**Aleem** — [@AleemTech-Wala](https://github.com/AleemTech-Wala)

---

## 📄 License

MIT License — free to use and modify.