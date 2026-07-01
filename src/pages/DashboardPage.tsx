import { BookOpen, CreditCard, GraduationCap, Repeat2 } from "lucide-react";
import { Link } from "react-router-dom";
import { booksApi } from "../api/books";
import { cardsApi } from "../api/cards";
import { studentsApi } from "../api/students";
import { transactionsApi } from "../api/transactions";
import { Badge } from "../components/ui/Badge";
import { PageHeader } from "../components/ui/PageHeader";
import { ErrorState, LoadingState } from "../components/ui/States";
import { useAsync } from "../hooks/useAsync";

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  hint,
}: {
  label: string;
  value: number | string;
  icon: typeof BookOpen;
  href: string;
  hint?: string;
}) {
  return (
    <Link
      to={href}
      className="group rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold text-text">{value}</p>
          {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
        </div>
        <div className="rounded-xl bg-brand-50 p-3 text-brand-600 transition group-hover:bg-brand-100">
          <Icon className="size-5" />
        </div>
      </div>
    </Link>
  );
}

export function DashboardPage() {
  const { data, loading, error, reload } = useAsync(async () => {
    const [books, cards, studentsPage, transactions] = await Promise.all([
      booksApi.getAll(),
      cardsApi.getAll(),
      studentsApi.getAll({ pageSize: 1 }),
      transactionsApi.getAll(),
    ]);

    const availableBooks = books.filter((book) => book.availability).length;
    const activeCards = cards.filter(
      (card) => card.cardStatus === "ACTIVE",
    ).length;
    const borrows = transactions.filter(
      (tx) => tx.transactionType === "BORROW",
    ).length;

    return {
      books: books.length,
      availableBooks,
      students: studentsPage.totalElements,
      cards: cards.length,
      activeCards,
      transactions: transactions.length,
      borrows,
      recentTransactions: transactions.slice(-5).reverse(),
    };
  });

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error || !data)
    return (
      <ErrorState
        message={error ?? "Failed to load dashboard"}
        onRetry={reload}
      />
    );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your library catalog, members, and activity."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Books"
          value={data.books}
          icon={BookOpen}
          href="/books"
          hint={`${data.availableBooks} available`}
        />
        <StatCard
          label="Students"
          value={data.students}
          icon={GraduationCap}
          href="/students"
        />
        <StatCard
          label="Library Cards"
          value={data.cards}
          icon={CreditCard}
          href="/cards"
          hint={`${data.activeCards} active`}
        />
        <StatCard
          label="Transactions"
          value={data.transactions}
          icon={Repeat2}
          href="/transactions"
          hint={`${data.borrows} borrows`}
        />
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-text">Quick Start</h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: 1, label: "Create library cards", href: "/cards" },
            { step: 2, label: "Register students", href: "/students" },
            { step: 3, label: "Add books to catalog", href: "/books" },
            { step: 4, label: "Issue or return books", href: "/transactions" },
          ].map(({ step, label, href }) => (
            <Link
              key={step}
              to={href}
              className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {step}
              </span>
              <span className="text-sm font-medium text-text">{label}</span>
            </Link>
          ))}
        </ol>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">
            Recent Transactions
          </h2>
          <Link
            to="/transactions"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View all
          </Link>
        </div>

        {data.recentTransactions.length === 0 ? (
          <p className="text-sm text-text-muted">
            No transactions recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border text-text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-border/70 last:border-0"
                  >
                    <td className="px-3 py-3 font-medium">#{tx.id}</td>
                    <td className="px-3 py-3">
                      <Badge
                        tone={
                          tx.transactionType === "BORROW" ? "brand" : "success"
                        }
                      >
                        {tx.transactionType}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-text-muted">{tx.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
