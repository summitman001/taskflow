# TaskFlow

A Trello-inspired Kanban board for small teams.

🚧 Work in progress.

## Stack
- Next.js 15 (App Router)
- Prisma + PostgreSQL (Neon)
- Clerk (auth)
- TanStack Query + Zustand
- dnd-kit
- Tailwind + shadcn/ui

## Local Development
```bash
npm install
cp .env.example .env.local  # fill in values
npx prisma db push
npm run dev
```