import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { cardsApi } from "../api/cards";
import { useToast } from "../context/ToastContext";
import { useAsync } from "../hooks/useAsync";
import type { Card, CardRequestDto, CardStatus } from "../types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { Select } from "../components/ui/Select";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";

const emptyForm: CardRequestDto = {
  cardStatus: "ACTIVE",
  expiryDate: "",
};

function statusTone(status: CardStatus) {
  if (status === "ACTIVE") return "success";
  if (status === "BLOCKED") return "danger";
  return "warning";
}

export function CardsPage() {
  const { showSuccess, showError } = useToast();
  const { data, loading, error, reload } = useAsync(() => cardsApi.getAll());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Card | null>(null);
  const [form, setForm] = useState<CardRequestDto>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (card: Card) => {
    setEditing(card);
    setForm({
      cardStatus: card.cardStatus,
      expiryDate: card.expiryDate,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (editing) {
        await cardsApi.update(editing.id, form);
        showSuccess("Card updated successfully");
      } else {
        await cardsApi.create(form);
        showSuccess("Card created successfully");
      }
      closeModal();
      await reload();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to save card");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (card: Card) => {
    if (!window.confirm(`Delete card #${card.id}?`)) return;

    try {
      await cardsApi.remove(card.id);
      showSuccess("Card deleted successfully");
      await reload();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to delete card");
    }
  };

  return (
    <div>
      <PageHeader
        title="Library Cards"
        description="Issue and manage student library membership cards."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add Card
          </Button>
        }
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {!loading && !error && data?.length === 0 ? (
        <EmptyState
          title="No library cards"
          description="Create cards before registering students."
          action={<Button onClick={openCreate}>Add Card</Button>}
        />
      ) : null}

      {!loading && !error && data && data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((card) => (
            <article
              key={card.id}
              className="rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-muted">Card ID</p>
                  <p className="text-2xl font-bold text-text">#{card.id}</p>
                </div>
                <Badge tone={statusTone(card.cardStatus)}>
                  {card.cardStatus}
                </Badge>
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Expiry</dt>
                  <dd className="font-medium text-text">{card.expiryDate}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Books Issued</dt>
                  <dd className="font-medium text-text">
                    {card.books?.length ?? 0}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEdit(card)}
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(card)}
                >
                  <Trash2 className="size-4 text-red-600" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <Modal
        open={modalOpen}
        title={editing ? "Edit Card" : "Add Card"}
        onClose={closeModal}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" form="card-form" disabled={submitting}>
              {submitting
                ? "Saving..."
                : editing
                  ? "Update Card"
                  : "Create Card"}
            </Button>
          </>
        }
      >
        <form id="card-form" onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Status"
            value={form.cardStatus}
            onChange={(e) =>
              setForm({ ...form, cardStatus: e.target.value as CardStatus })
            }
            options={[
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
              { value: "BLOCKED", label: "Blocked" },
            ]}
          />
          <Input
            label="Expiry Date"
            required
            placeholder="YYYY-MM-DD"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
}
