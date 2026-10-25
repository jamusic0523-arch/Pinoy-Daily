# Pinoy Daily

Everyday Filipino tools in one web app: personal budget, to-do + habits, and gas / computer cost calculators. Create an account to earn points and climb the ranking.

## Run locally

1. Copy `.env.example` to `.env` if needed.
2. Install and set up the database:

```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000), create an account, and start using the tools.
