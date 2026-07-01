import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { booksApi } from "../api/books";
import { cardsApi } from "../api/cards";
import { transactionsApi } from "../api/transactions";
import { useToast } from "../context/ToastContext";
import { useAsync } from "../hooks/useAsync";
import type { TransactionRequestDto, TransactionType } from "../types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { Select } from "../components/ui/Select";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";

const emptyForm: TransactionRequestDto = {
  dueDate: "",
  transactionType: "BORROW",
  cardId: 0,
  bookId: 0,
};

export function TransactionsPage() {
  const { showSuccess, showError } = useToast();
  const { data, loading, error, reload } = useAsync(() =>
    transactionsApi.getAll(),
  );
  const { data: books, reload: reloadBooks } = useAsync(() =>
    booksApi.getAll(),
  );
  const { data: cards, reload: reloadCards } = useAsync(() =>
    cardsApi.getAll(),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<TransactionRequestDto>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const activeCards =
    cards?.filter((card) => card.cardStatus === "ACTIVE") ?? [];
  const availableBooks = books?.filter((book) => book.availability) ?? [];
  const issuedBooks = books?.filter((book) => !book.availability) ?? [];

  const bookOptions =
    form.transactionType === "BORROW"
      ? availableBooks
      : issuedBooks.filter((book) => {
          const card = cards?.find((c) => c.id === form.cardId);
          return card?.books?.some((issued) => issued.id === book.id);
        });

  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await transactionsApi.create(form);
      showSuccess(
        form.transactionType === "BORROW"
          ? "Book issued successfully"
          : "Book returned successfully",
      );
      closeModal();
      await Promise.all([reload(), reloadBooks(), reloadCards()]);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to record transaction",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="Issue books to cards or process returns."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New Transaction
          </Button>
        }
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {!loading && !error && data?.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          description="Issue a book to a student card to get started."
          action={<Button onClick={openCreate}>New Transaction</Button>}
        />
      ) : null}

      {!loading && !error && data && data.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-muted text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Txn Date</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {[...data].reverse().map((tx) => (
                  <tr key={tx.id} className="border-t border-border/70">
                    <td className="px-4 py-3 font-medium">#{tx.id}</td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          tx.transactionType === "BORROW" ? "brand" : "success"
                        }
                      >
                        {tx.transactionType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {tx.transactionDate
                        ? new Date(tx.transactionDate).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">{tx.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <Modal
        open={modalOpen}
        title="New Transaction"
        onClose={closeModal}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" form="transaction-form" disabled={submitting}>
              {submitting ? "Processing..." : "Submit"}
            </Button>
          </>
        }
      >
        <form
          id="transaction-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <Select
            label="Transaction Type"
            value={form.transactionType}
            onChange={(e) =>
              setForm({
                ...form,
                transactionType: e.target.value as TransactionType,
                bookId: 0,
              })
            }
            options={[
              { value: "BORROW", label: "Borrow (Issue Book)" },
              { value: "RETURN", label: "Return Book" },
            ]}
          />
          <Select
            label="Library Card"
            required
            value={String(form.cardId || "")}
            onChange={(e) =>
              setForm({ ...form, cardId: Number(e.target.value), bookId: 0 })
            }
            options={[
              { value: "", label: "Select a card" },
              ...activeCards.map((card) => ({
                value: String(card.id),
                label: `Card #${card.id}`,
              })),
            ]}
          />
          <Select
            label="Book"
            required
            value={String(form.bookId || "")}
            onChange={(e) =>
              setForm({ ...form, bookId: Number(e.target.value) })
            }
            options={[
              { value: "", label: "Select a book" },
              ...bookOptions.map((book) => ({
                value: String(book.id),
                label: book.title,
              })),
            ]}
          />
          <Input
            label="Due Date"
            required
            placeholder="YYYY-MM-DD"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
}
