# 📚 Bookstore

A modern, full-stack web application for authors to manage their book collections. Built with a robust Express.js backend and a sleek React frontend featuring a premium dark-mode design.

> **Live Demo**: Coming soon  
> **Developer**: [Muhammad Sheraz](https://muhammadsheraz.dev)

---

## ✨ Features

- **Author Authentication** — Secure registration and login with JWT-based auth
- **Book Management** — Full CRUD operations for managing your book collection
- **Dashboard Analytics** — At-a-glance stats showing total books and collection value
- **Search & Filter** — Instantly search books by title or ISBN
- **Responsive Design** — Seamless experience across mobile, tablet, and desktop
- **Dark Mode** — Premium dark theme with glassmorphism effects and smooth animations

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime |
| **Express.js v5** | Web framework |
| **TypeScript** | Type safety |
| **PostgreSQL** (Neon) | Database |
| **pg-promise** | Database client |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Vite 8** | Build tool & dev server |
| **Redux Toolkit** | State management |
| **React Router v7** | Client-side routing |
| **Tailwind CSS v4** | Styling |
| **Shadcn UI** | Component library |
| **Radix UI** | Accessible primitives |
| **Axios** | HTTP client |
| **Lucide React** | Icons |

---

## 📁 Project Structure

```
bookstore/
├── backend/
│   ├── config/          # Database & env configuration
│   ├── controllers/     # Route handlers (author, book)
│   ├── middlewares/      # JWT auth middleware
│   ├── migrations/       # Database migrations
│   ├── routes/           # API route definitions
│   ├── utils/            # JWT utility functions
│   ├── tests/            # API test suite
│   └── server.ts         # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   │   └── ui/       # Shadcn UI primitives
│   │   ├── pages/        # Route page components
│   │   ├── services/     # API service layer (Axios)
│   │   ├── store/        # Redux slices & store
│   │   ├── types/        # TypeScript type definitions
│   │   ├── lib/          # Utility functions
│   │   ├── App.tsx       # Root component with routing
│   │   └── main.tsx      # Entry point
│   └── index.html        # HTML template
│
└── project-guides.json   # Project specification
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **PostgreSQL** database (or a [Neon](https://neon.tech) account)
- **npm** package manager

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your configuration:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   PORT=3000
   JWT_SECRET=your_secret_key
   ORIGINS=http://localhost:5173
   ```

4. Run database migrations:
   ```bash
   npm run migrate:up
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   VITE_BACKEND_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`.

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/authors/register` | Register a new author |
| `POST` | `/api/authors/login` | Login and receive JWT |
| `DELETE` | `/api/authors/delete` | Delete author account (protected) |

### Books (All Protected)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/books/create-book` | Create a new book |
| `GET` | `/api/books/get-books` | Get all books for the authenticated author |
| `GET` | `/api/books/get-book/:isbn` | Get a specific book by ISBN |
| `PUT` | `/api/books/update-book/:isbn` | Update a book |
| `DELETE` | `/api/books/delete-book/:isbn` | Delete a book |

### Request/Response Examples

**Register:**
```json
// POST /api/authors/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}

// Response
{
  "message": "Author registered successfully",
  "author": { "name": "John Doe", "email": "john@example.com" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Create Book:**
```json
// POST /api/books/create-book
// Headers: Authorization: Bearer <token>
{
  "isbn": "978-3-16-148410-0",
  "title": "The Great Book",
  "price": 29.99,
  "published_date": "2024-01-15"
}
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

---

## 📝 Environment Variables

### Backend
| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `PORT` | Server port (default: 3000) | ❌ |
| `JWT_SECRET` | Secret key for JWT signing | ✅ |
| `ORIGINS` | Comma-separated allowed CORS origins | ❌ |

### Frontend
| Variable | Description | Required |
|---|---|---|
| `VITE_BACKEND_URL` | Backend API URL (default: http://localhost:3000) | ❌ |

---

## 👨‍💻 Developer

**Muhammad Sheraz**  
🌐 [Portfolio](https://muhammadsheraz.dev)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
