# The Great Soup Feast

A web app for organizing, voting on, and celebrating an annual soup competition. ~100 guests, ~25 soups, ranked-choice voting.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: PostgreSQL via Prisma ORM
- **Styling**: Tailwind CSS
- **Auth**: Password-based admin, token-based guest links

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and admin password
   ```

3. Set up the database:
   ```bash
   npx prisma db push
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Key Pages

| Route | Description |
|---|---|
| `/` | Landing page with countdown |
| `/admin` | Admin dashboard (password protected) |
| `/signup` | Cook soup registration |
| `/ideas` | Soup idea generator |
| `/rsvp` | Shared RSVP page |
| `/taste/:token` | Guided tasting experience |
| `/leaderboard` | Live leaderboard (add `?mode=tv` for big screen) |
| `/results` | Results reveal with RCV visualization |
| `/archive` | Past years |
