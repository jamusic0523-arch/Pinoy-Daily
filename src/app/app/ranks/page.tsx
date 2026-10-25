import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function RanksPage() {
  const me = await getCurrentUser();
  if (!me) return null;
  const users = await prisma.user.findMany({
    orderBy: [{ points: "desc" }, { createdAt: "asc" }],
    take: 20,
    select: { id: true, name: true, points: true },
  });
  const higher = await prisma.user.count({
    where: { points: { gt: me.points } },
  });

  return (
    <div className="card p-6">
      <h1 className="text-4xl" style={{ fontFamily: "var(--font-display)" }}>
        Ranking
      </h1>
      <p className="mt-2 text-muted">
        You are #{higher + 1} with {me.points} points. Use the tools every day
        to climb.
      </p>
      <ol className="mt-6 grid gap-2">
        {users.map((user, index) => (
          <li
            key={user.id}
            className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
              user.id === me.id ? "bg-leaf text-white" : "bg-paper"
            }`}
          >
            <span>
              <strong className="mr-3">#{index + 1}</strong>
              {user.name}
              {user.id === me.id ? " (you)" : ""}
            </span>
            <strong>{user.points} pts</strong>
          </li>
        ))}
      </ol>
    </div>
  );
}
