# Cap M.Saleh - Workout Logging & Progress Tracking

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

Cap M.Saleh is a modern, full-stack web application designed to help users log their gym workouts, track their progress over time, and visualize their training data. It features user authentication, role-based access control (User/Admin), training level management, and a clean interface built with Next.js and Shadcn/UI. Admins have additional capabilities to manage users, training levels, and view aggregated workout data.

## Features ✨

*   **User Authentication:** Secure sign-up, sign-in, and session management using NextAuth.js with improved validation.
*   **Workout Logging:** Easily log new workouts, including exercises, sets, reps, and weight.
*   **Workout History:** View a detailed history of past workouts.
*   **Training Level Management:**
    *   Create, update, and delete training programs and levels.
    *   Assign users to specific training levels.
    *   Organize workouts by training level and workout day.
*   **Progress Tracking:** 
    *   Visualize workout volume and exercise progress over time.
    *   Training consistency charts and metrics.
    *   Support for different weight units.
*   **Admin Dashboard:**
    *   Manage users (add, delete, change roles, assign training levels).
    *   View all user workouts grouped by date and training level.
    *   (Admin data is excluded from admin views for privacy/clarity).
*   **Responsive Design:** User-friendly interface on both desktop and mobile devices.
*   **Dark/Light Mode:** Theme switching support using `next-themes`.
*   **Improved Loading States:** Integrated Suspense and loading indicators for better user experience.

## Tech Stack 🛠️

*   **Framework:** [Next.js](https://nextjs.org/) (v15+ with App Router & Turbopack)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/) (v5 Beta)
*   **Database:** [PostgreSQL](https://www.postgresql.org/) (via `pg`)
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **UI Components:** [Shadcn/UI](https://ui.shadcn.com/) including Dialog, Table, Separator
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

## Folder Structure 📁

```
gym-training/
├── .next/                # Next.js build output (generated)
├── node_modules/         # Project dependencies (generated)
├── app/                  # Next.js App Router pages, layouts, and components
│   ├── (auth)/           # Authentication routes (signin, error, etc.) - Grouped, no layout segment
│   ├── admin/            # Admin-specific pages (users, workouts)
│   ├── api/              # API routes (e.g., NextAuth callback)
│   ├── levels/           # Training level pages and level-specific workouts
│   ├── workout/          # Workout related pages (list, detail, new, edit)
│   ├── layout.tsx        # Root layout
│   ├── loading.tsx       # Global loading component
│   ├── page.tsx          # Main dashboard page ('/')
│   ├── globals.css       # Global styles
│   ├── not-found.tsx     # Custom 404 page
│   └── forbidden.tsx     # Custom 403 page
├── actions/              # Server Actions
│   ├── auth.ts           # Authentication actions
│   ├── dashboard.ts      # Dashboard data and metrics
│   ├── levels.ts         # Training level management
│   ├── userActions.ts    # User management actions
│   └── workouts.ts       # Workout management
├── components/           # Reusable UI components (mostly client-side)
│   ├── admin/            # Admin-specific components
│   │   ├── CreateLevelDialog.tsx  # Training level creation
│   │   ├── DeleteLevelDialog.tsx  # Training level deletion
│   │   ├── LevelChangeForm.tsx    # User level assignment
│   │   └── UpdateLevelDialog.tsx  # Training level updates
│   ├── auth/             # Authentication components (forms, buttons)
│   ├── dashboard/        # Dashboard-specific components
│   │   ├── ConsistencyChart.tsx   # Training consistency visualization
│   │   └── TrainingDaysInfo.tsx   # Training days metrics
│   ├── layout/           # Layout components (Navbar, ThemeToggle)
│   ├── levels/           # Level-specific components
│   │   └── ExerciseProgressChart.tsx  # Exercise progress visualization
│   ├── providers/        # Context providers (Theme, Session)
│   ├── ui/               # Shadcn/UI base components
│   │   ├── button.tsx    # Button component
│   │   ├── dialog.tsx    # Dialog component
│   │   ├── loading.tsx   # Loading indicators
│   │   ├── spinner.tsx   # Spinner component
│   │   ├── table.tsx     # Table component
│   │   ├── textarea.tsx  # Textarea component
│   │   └── ... other UI components
│   └── workout/          # Workout specific components (Card, Form, Filter)
├── lib/                  # Utility functions, Prisma client instance, validations
│   ├── generated/        # Prisma client output (generated)
│   ├── validations/      # Zod schemas
│   │   ├── auth.ts       # Authentication validation
│   │   ├── levels.ts     # Level management validation
│   │   ├── workout.ts    # Workout validation
│   │   └── ... other validation schemas
│   ├── prisma.ts         # Prisma client singleton
│   └── utils.ts          # General utility functions
├── prisma/               # Prisma configuration
│   ├── migrations/       # Database migration history (generated)
│   └── schema.prisma     # Database schema definition
├── public/               # Static assets (images, icons)
├── types/                # TypeScript type definitions
├── .env.example          # Example environment variables
├── .env.local            # Local environment variables (ignored by git)
├── .eslintrc.json        # ESLint configuration
├── .gitignore            # Files/folders ignored by git
├── components.json       # Shadcn/UI configuration
├── LICENSE               # Project license file (BSD 3-Clause)
├── next.config.mjs       # Next.js configuration
├── next-env.d.ts         # Next.js TypeScript declarations
├── package.json          # Project dependencies and scripts
├── pnpm-lock.yaml        # pnpm lockfile
├── postcss.config.mjs    # PostCSS configuration
├── README.md             # This file
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Deployment ☁️

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Ensure you set up the required environment variables (especially `DATABASE_URL` and `AUTH_SECRET`) in your Vercel project settings.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing 🤝

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `git checkout -b fix/your-bug-fix`.
3.  **Make your changes** and commit them with clear messages.
4.  **Push your branch** to your fork: `git push origin feature/your-feature-name`.
5.  **Open a pull request** to the main repository.

Please ensure your code adheres to the project's coding style and includes tests if applicable.

## License 📜

This project is licensed under the BSD 3-Clause License. See the [LICENSE](LICENSE) file for details.

---

*(Optional: Add sections for Contributing Guidelines, License, etc. here)*
