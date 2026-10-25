import Link from "next/link";

const tools = [
  {
    title: "Budget & gastos",
    body: "Set a monthly budget in pesos, log expenses, and see where the money actually goes.",
  },
  {
    title: "To-do & habits",
    body: "A smart list for today plus habits you can check off. Completing them earns ranking points.",
  },
  {
    title: "Pinoy gas & PC calc",
    body: "Estimate commute fuel cost in PHP/liter, and PC build plus Meralco-style electricity.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 py-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-leaf font-bold text-white">
            PD
          </span>
          <strong>Pinoy Daily</strong>
        </div>
        <div className="flex gap-2">
          <Link href="/login" className="btn btn-ghost">
            Log in
          </Link>
          <Link href="/register" className="btn btn-primary">
            Create account
          </Link>
        </div>
      </header>

      <section className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-leaf">
            PARA SA ARAW-ARAW
          </p>
          <h1
            className="mt-3 max-w-xl text-5xl leading-[1.05] text-ink sm:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Everyday money, habits, and Pinoy costs — in one place.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">
            Create an account, earn points for using the tools, and climb the
            ranking with other people building better days.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/register" className="btn btn-primary">
              Start free — 50 welcome points
            </Link>
            <Link href="/login" className="btn btn-ghost">
              I already have an account
            </Link>
          </div>
        </div>
        <div className="card p-6">
          <p className="text-sm font-semibold text-muted">How you earn points</p>
          <ul className="mt-4 grid gap-3">
            {[
              ["+50", "Welcome bonus when you create an account"],
              ["+10", "Daily login"],
              ["+5", "Log an expense"],
              ["+15", "Finish a to-do"],
              ["+20", "Keep a habit today"],
              ["+8", "Use the gas or PC calculator"],
            ].map(([pts, label]) => (
              <li
                key={label}
                className="flex items-center justify-between rounded-2xl bg-paper px-4 py-3"
              >
                <span>{label}</span>
                <strong className="text-leaf">{pts}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-3">
        {tools.map((tool) => (
          <article key={tool.title} className="card p-6">
            <h2
              className="text-2xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {tool.title}
            </h2>
            <p className="mt-3 text-muted">{tool.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
