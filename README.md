# GymTrack - Workout Logging & Progress Tracking

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#environment-variables">Environment Variables</a> •
  <a href="#folder-structure">Folder Structure</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## Overview

GymTrack is a modern, full-stack web application designed to help users log their gym workouts, track their progress over time, and visualize their training data. It features user authentication, role-based access control (User/Admin), and a clean interface built with Next.js and Shadcn/UI. Admins have additional capabilities to manage users and view aggregated workout data.

## Features ✨

*   **User Authentication:** Secure sign-up, sign-in, and session management using NextAuth.js.
*   **Workout Logging:** Easily log new workouts, including exercises, sets, reps, and weight.
*   **Workout History:** View a detailed history of past workouts.
*   **Progress Tracking:** Visualize workout volume and other metrics over time (future enhancement).
*   **Admin Dashboard:**
    *   Manage users (add, delete, change roles).
    *   View all user workouts grouped by date.
    *   (Admin data is excluded from admin views for privacy/clarity).
*   **Responsive Design:** User-friendly interface on both desktop and mobile devices.
*   **Dark/Light Mode:** Theme switching support using `next-themes`.

## Tech Stack 🛠️

*   **Framework:** [Next.js](https://nextjs.org/) (v15+ with App Router & Turbopack)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/) (v5 Beta)
*   **Database:** [PostgreSQL](https://www.postgresql.org/) (via `pg`)
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **UI Components:** [Shadcn/UI](https://ui.shadcn.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v4)
*   **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
*   **Charting:** [Recharts](https://recharts.org/)
*   **Icons:** [Lucide React](https://lucide.dev/)

## Getting Started 🚀

Follow these instructions to set up the project locally for development.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   [pnpm](https://pnpm.io/) (or npm/yarn/bun)
*   [PostgreSQL](https://www.postgresql.org/download/) Database

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/gym-training.git # Replace with your repo URL
    cd gym-training
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up Environment Variables:**
    *   Copy the example environment file:
        ```bash
        cp .env.example .env.local
        ```
    *   Fill in the required values in `.env.local` (see [Environment Variables](#environment-variables) section below).

4.  **Database Setup:**
    *   Ensure your PostgreSQL server is running.
    *   Push the Prisma schema to your database. This will create the necessary tables.
        ```bash
        pnpm prisma db push
        ```
    *   *(Optional)* You can seed the database if you have seed scripts:
        ```bash
        # pnpm prisma db seed (if you create a seed script)
        ```

5.  **Run the development server:**
    ```bash
    pnpm dev
    ```

    The application should now be running at [http://localhost:3000](http://localhost:3000).

## Environment Variables 🔑

Make sure to create a `.env.local` file in the root directory and add the following variables:

```env
# Database Connection (Prisma)
# Example: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="your_postgresql_connection_string"

# NextAuth.js Configuration
# Generate a secret: openssl rand -base64 32
AUTH_SECRET="your_super_secret_auth_secret"
AUTH_URL="http://localhost:3000" # Your base app URL

# Optional: Add OAuth Provider Credentials (e.g., Google, GitHub)
# GOOGLE_CLIENT_ID="..."
# GOOGLE_CLIENT_SECRET="..."
# GITHUB_ID="..."
# GITHUB_SECRET="..."
```

*   `DATABASE_URL`: Your full PostgreSQL connection string.
*   `AUTH_SECRET`: A random string used to encrypt JWTs and session data. Use `openssl rand -base64 32` to generate one.
*   `AUTH_URL`: The base URL of your application.
*   Add credentials for any OAuth providers you configure in `auth.ts`.

## Folder Structure 📁 (Simplified)

```
gym-training/
├── app/                  # Next.js App Router pages and layouts
│   ├── (auth)/           # Authentication routes (signin, etc.)
│   ├── admin/            # Admin-specific pages
│   ├── api/              # API routes (e.g., NextAuth)
│   ├── workout/          # Workout related pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main dashboard page
├── actions/              # Server Actions for mutations/data fetching
├── components/           # Reusable UI components
│   ├── admin/            # Admin-specific components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── layout/           # Layout components (Navbar, etc.)
│   ├── providers/        # Context providers (Theme, Session)
│   └── ui/               # Shadcn/UI components
├── lib/                  # Utility functions, Prisma client, etc.
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma     # Database schema definition
├── public/               # Static assets
├── styles/               # Global styles
├── types/                # TypeScript type definitions
├── .env.local            # Local environment variables (ignored by git)
├── next.config.mjs       # Next.js configuration
├── package.json          # Project dependencies and scripts
└── README.md             # This file
```

## Deployment ☁️

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Ensure you set up the required environment variables (especially `DATABASE_URL` and `AUTH_SECRET`) in your Vercel project settings.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

*(Optional: Add sections for Contributing Guidelines, License, etc. here)*
