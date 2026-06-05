import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Loader2,
  Library,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import BookCard from "@/components/BookCard";
import BookFormDialog from "@/components/BookFormDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBooks, removeBook } from "@/store/booksSlice";
import toast from "react-hot-toast";
import type { Book } from "@/types";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { books, isLoading } = useAppSelector((state) => state.books);

  const [searchQuery, setSearchQuery] = useState("");
  const [bookFormOpen, setBookFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingIsbn, setDeletingIsbn] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch books on mount
  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  // Filtered books
  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const query = searchQuery.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query)
    );
  }, [books, searchQuery]);

  // Stats
  const totalValue = useMemo(
    () => books.reduce((sum, book) => sum + Number(book.price), 0),
    [books]
  );

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalValue);

  // Handlers
  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setBookFormOpen(true);
  };

  const handleDeleteClick = (isbn: string) => {
    setDeletingIsbn(isbn);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingIsbn) return;
    setIsDeleting(true);
    try {
      await dispatch(removeBook(deletingIsbn)).unwrap();
      toast.success("Book deleted successfully");
      setDeleteConfirmOpen(false);
      setDeletingIsbn(null);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to delete book");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormClose = (open: boolean) => {
    setBookFormOpen(open);
    if (!open) {
      // Small delay to avoid UI flicker
      setTimeout(() => setEditingBook(null), 200);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Stats Section */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="card-glow border-border/50">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Library className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Books
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {books.length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-glow border-border/50">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                  <DollarSign className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Collection Value
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formattedTotal}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search + Add */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title or ISBN…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                id="search-books"
              />
            </div>
            <Button
              onClick={() => {
                setEditingBook(null);
                setBookFormOpen(true);
              }}
              className="gap-2 font-medium"
              id="add-book-button"
            >
              <Plus className="h-4 w-4" />
              Add Book
            </Button>
          </div>

          {/* Content */}
          {isLoading && books.length === 0 ? (
            /* Loading state */
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">
                Loading your collection…
              </p>
            </div>
          ) : filteredBooks.length === 0 && searchQuery ? (
            /* No search results */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                No results found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No books match &ldquo;{searchQuery}&rdquo;. Try a different search.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </Button>
            </div>
          ) : books.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5">
                <BookOpen className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">
                No books yet
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Start building your collection by adding your first book. It only
                takes a moment!
              </p>
              <Button
                className="mt-6 gap-2"
                onClick={() => {
                  setEditingBook(null);
                  setBookFormOpen(true);
                }}
                id="add-first-book-button"
              >
                <Plus className="h-4 w-4" />
                Add Your First Book
              </Button>
            </div>
          ) : (
            /* Book grid */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book, index) => (
                <BookCard
                  key={book.isbn}
                  book={book}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Dialogs */}
      <BookFormDialog
        open={bookFormOpen}
        onOpenChange={handleFormClose}
        book={editingBook}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Book"
        description="Are you sure you want to delete this book? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
