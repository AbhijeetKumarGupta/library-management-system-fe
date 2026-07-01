import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { booksApi } from '../api/books'
import { useToast } from '../context/ToastContext'
import { useAsync } from '../hooks/useAsync'
import type { Book, BookRequestDto } from '../types'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'

const emptyForm: BookRequestDto = {
  title: '',
  publisherName: '',
  publishedDate: '',
  pages: 1,
  availability: true,
  category: '',
  rackNo: 1,
}

export function BooksPage() {
  const { showSuccess, showError } = useToast()
  const { data, loading, error, reload } = useAsync(() => booksApi.getAll())
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Book | null>(null)
  const [form, setForm] = useState<BookRequestDto>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const filtered = useMemo(() => {
    if (!data) return []
    const query = search.trim().toLowerCase()
    if (!query) return data
    return data.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query) ||
        book.publisherName.toLowerCase().includes(query),
    )
  }, [data, search])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (book: Book) => {
    setEditing(book)
    setForm({
      title: book.title,
      publisherName: book.publisherName,
      publishedDate: book.publishedDate,
      pages: book.pages,
      availability: book.availability,
      category: book.category,
      rackNo: book.rackNo,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      if (editing) {
        await booksApi.update(editing.id, form)
        showSuccess('Book updated successfully')
      } else {
        await booksApi.create(form)
        showSuccess('Book created successfully')
      }
      closeModal()
      await reload()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save book')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (book: Book) => {
    if (!window.confirm(`Delete "${book.title}"?`)) return

    try {
      await booksApi.remove(book.id)
      showSuccess('Book deleted successfully')
      await reload()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete book')
    }
  }

  return (
    <div>
      <PageHeader
        title="Books"
        description="Manage the library catalog, availability, and shelf locations."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add Book
          </Button>
        }
      />

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, category, or publisher..."
            className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {!loading && !error && filtered.length === 0 ? (
        <EmptyState
          title="No books found"
          description={search ? 'Try a different search term.' : 'Add your first book to get started.'}
          action={!search ? <Button onClick={openCreate}>Add Book</Button> : undefined}
        />
      ) : null}

      {!loading && !error && filtered.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-muted text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Publisher</th>
                  <th className="px-4 py-3 font-medium">Rack</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((book) => (
                  <tr key={book.id} className="border-t border-border/70">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text">{book.title}</p>
                      <p className="text-xs text-text-muted">{book.pages} pages</p>
                    </td>
                    <td className="px-4 py-3">{book.category}</td>
                    <td className="px-4 py-3">{book.publisherName}</td>
                    <td className="px-4 py-3">#{book.rackNo}</td>
                    <td className="px-4 py-3">
                      <Badge tone={book.availability ? 'success' : 'warning'}>
                        {book.availability ? 'Available' : 'Issued'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(book)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(book)}>
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <Modal
        open={modalOpen}
        title={editing ? 'Edit Book' : 'Add Book'}
        onClose={closeModal}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" form="book-form" disabled={submitting}>
              {submitting ? 'Saving...' : editing ? 'Update Book' : 'Create Book'}
            </Button>
          </>
        }
      >
        <form id="book-form" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
          <Input
            label="Category"
            required
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
          />
          <Input
            label="Publisher"
            required
            value={form.publisherName}
            onChange={(event) => setForm({ ...form, publisherName: event.target.value })}
          />
          <Input
            label="Published Date"
            required
            value={form.publishedDate}
            onChange={(event) => setForm({ ...form, publishedDate: event.target.value })}
          />
          <Input
            label="Pages"
            type="number"
            min={1}
            required
            value={form.pages}
            onChange={(event) => setForm({ ...form, pages: Number(event.target.value) })}
          />
          <Input
            label="Rack Number"
            type="number"
            min={1}
            required
            value={form.rackNo}
            onChange={(event) => setForm({ ...form, rackNo: Number(event.target.value) })}
          />
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.availability}
              onChange={(event) => setForm({ ...form, availability: event.target.checked })}
              className="size-4 rounded border-border text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-text">Available for issue</span>
          </label>
        </form>
      </Modal>
    </div>
  )
}
