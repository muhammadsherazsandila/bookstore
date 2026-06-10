import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Bookmark,
  Plus,
  Search,
  Loader2,
  Library,
  DollarSign,
  UserRound,
  FolderHeart,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import BookCard from "@/components/BookCard";
import BookFormDialog from "@/components/BookFormDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBooks, removeBook, changePage } from "@/store/booksSlice";
import { bookService } from "@/services/bookService";
import toast from "react-hot-toast";
import type { Book } from "@/types";
import PlaylistsTab from "@/components/PlaylistsTab";
import EditProfileDialog from "@/components/EditProfileDialog";
import BookDetailsModal from "@/components/BookDetailsModal";
import AuthorProfileModal from "@/components/AuthorProfileModal";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { books, pagination, currentPage, isLoading } = useAppSelector(
    (state) => state.books
  );
  const { author } = useAppSelector((state) => state.auth);

  const [dashboardTab, setDashboardTab] = useState<"books" | "playlists">("books");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedBooks, setSavedBooks] = useState<Book[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [bookFormOpen, setBookFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingIsbn, setDeletingIsbn] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit profile state
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  // Details state
  const [detailsIsbn, setDetailsIsbn] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [authorEmail, setAuthorEmail] = useState<string | null>(null);
  const [authorOpen, setAuthorOpen] = useState(false);

  // Fetch books on mount or when page changes
  useEffect(() => {
    if (author?.role === "author") {
      dispatch(fetchBooks({ page: currentPage, limit: 6 }));
    }
  }, [author?.role, dispatch, currentPage]);

  const loadSavedBooks = async () => {
    setSavedLoading(true);
    try {
      setSavedBooks(await bookService.getSavedBooks());
    } catch {
      toast.error("Failed to load saved books");
    } finally {
      setSavedLoading(false);
    }
  };

  useEffect(() => {
    if (author?.role !== "user") return;
    loadSavedBooks();
  }, [author?.role]);

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
  const totalValue = pagination?.totalValue ?? books.reduce((sum, book) => sum + Number(book.price), 0);

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

      // Handle page shifting if current page becomes empty
      const isPageEmpty = books.length === 1 && currentPage > 1;
      const targetPage = isPageEmpty ? currentPage - 1 : currentPage;

      if (isPageEmpty) {
        dispatch(changePage(targetPage));
      } else {
        dispatch(fetchBooks({ page: targetPage, limit: 6 }));
      }
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to delete book");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormClose = (open: boolean) => {
    setBookFormOpen(open);
    if (!open) {
      setTimeout(() => setEditingBook(null), 200);
    }
  };

  const handleUnsave = async (isbn: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await bookService.unsaveBook(isbn);
      setSavedBooks((current) => current.filter((book) => book.isbn !== isbn));
      toast.success("Removed from saved books");
    } catch {
      toast.error("Failed to remove saved book");
    }
  };

  const handleBookClick = (isbn: string) => {
    setDetailsIsbn(isbn);
    setDetailsOpen(true);
  };

  const handleAuthorClick = (email: string) => {
    setAuthorEmail(email);
    setAuthorOpen(true);
  };

  // User Dashboard Role
  if (author?.role === "user") {
    const filteredSavedBooks = searchQuery.trim()
      ? savedBooks.filter((book) => {
          const query = searchQuery.toLowerCase();
          return (
            book.title.toLowerCase().includes(query) ||
            book.isbn.toLowerCase().includes(query) ||
            book.author_name?.toLowerCase().includes(query)
          );
        })
      : savedBooks;

    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
            
            {/* Header / Profile Info */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
              <div className="flex items-center gap-3">
                {author.avatar ? (
                  <img src={author.avatar} className="h-14 w-14 rounded-full object-cover border" alt={author.name} />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold border">
                    {author.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{author.name}</h1>
                  <p className="text-sm text-muted-foreground">{author.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditProfileOpen(true)}>
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b pb-3">
              <Button
                variant={dashboardTab === "books" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDashboardTab("books")}
                className="gap-1.5"
              >
                <Bookmark className="h-4 w-4" />
                Saved Books
              </Button>
              <Button
                variant={dashboardTab === "playlists" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDashboardTab("playlists")}
                className="gap-1.5"
              >
                <FolderHeart className="h-4 w-4" />
                Playlists / Groups
              </Button>
            </div>

            {dashboardTab === "books" ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold tracking-tight">My Saved Books</h2>
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search saved books..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {savedLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="mt-4 text-sm text-muted-foreground">Loading saved books...</p>
                  </div>
                ) : filteredSavedBooks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Bookmark className="h-12 w-12 text-muted-foreground/40" />
                    <h3 className="mt-4 text-lg font-semibold text-foreground">No saved books yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Open the catalog and save books you want to revisit.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredSavedBooks.map((book) => (
                      <Card
                        key={book.isbn}
                        onClick={() => handleBookClick(book.isbn)}
                        className="overflow-hidden border-border/50 cursor-pointer hover:border-primary/40 transition-colors"
                      >
                        {book.cover_image && (
                          <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                            <img
                              src={book.cover_image}
                              alt={`${book.title} cover`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="space-y-3 p-5">
                          <div>
                            <h2 className="line-clamp-2 font-semibold text-foreground">{book.title}</h2>
                            <p className="mt-1 font-mono text-xs text-muted-foreground">ISBN: {book.isbn}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <UserRound className="h-4 w-4" />
                            <span>{book.author_name ?? book.author_email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-foreground">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                              }).format(Number(book.price))}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={(e) => handleUnsave(book.isbn, e)}
                          >
                            <Bookmark className="h-4 w-4" />
                            Remove Saved
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <PlaylistsTab onBookClick={handleBookClick} />
            )}
          </div>
        </main>

        <EditProfileDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} />

        <BookDetailsModal
          isbn={detailsIsbn}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onAuthorClick={handleAuthorClick}
        />

        <AuthorProfileModal
          email={authorEmail}
          open={authorOpen}
          onOpenChange={setAuthorOpen}
          onBookClick={handleBookClick}
        />
      </div>
    );
  }

  // Author Dashboard Role
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          
          {/* Header Profile Info */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
            <div className="flex items-center gap-3">
              {author?.avatar ? (
                <img src={author.avatar} className="h-14 w-14 rounded-full object-cover border" alt={author.name} />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold border">
                  {author?.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{author?.name}</h1>
                <p className="text-sm text-muted-foreground">{author?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditProfileOpen(true)}>
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b pb-3">
            <Button
              variant={dashboardTab === "books" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDashboardTab("books")}
              className="gap-1.5"
            >
              <Library className="h-4 w-4" />
              My Books
            </Button>
            <Button
              variant={dashboardTab === "playlists" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDashboardTab("playlists")}
              className="gap-1.5"
            >
              <FolderHeart className="h-4 w-4" />
              Playlists / Groups
            </Button>
          </div>

          {dashboardTab === "books" ? (
            <div className="space-y-6">
              {/* Stats Section */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="card-glow border-border/50">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Library className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Books</p>
                      <p className="text-2xl font-bold text-foreground">{pagination?.totalBooks ?? books.length}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-glow border-border/50">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                      <DollarSign className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Collection Value</p>
                      <p className="text-2xl font-bold text-foreground">{formattedTotal}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search + Add */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="mt-4 text-sm text-muted-foreground">Loading your collection…</p>
                </div>
              ) : filteredBooks.length === 0 && searchQuery ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Search className="h-12 w-12 text-muted-foreground/40" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">No results found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No books match &ldquo;{searchQuery}&rdquo;. Try a different search.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                </div>
              ) : books.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5">
                    <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">No books yet</h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Start building your collection by adding your first book. It only takes a moment!
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
                <div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredBooks.map((book, index) => (
                      <div key={book.isbn} onClick={() => handleBookClick(book.isbn)} className="cursor-pointer">
                        <BookCard
                          book={book}
                          onEdit={(b) => {
                            // Don't trigger book click when editing
                            handleEdit(b);
                          }}
                          onDelete={(isbn) => {
                            // Don't trigger book click when deleting
                            handleDeleteClick(isbn);
                          }}
                          index={index}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-border/50 pt-6">
                      <div className="text-sm text-muted-foreground">
                        Showing page <span className="font-semibold text-foreground">{pagination.currentPage}</span> of{" "}
                        <span className="font-semibold text-foreground">{pagination.totalPages}</span> (
                        <span className="font-semibold text-foreground">{pagination.totalBooks}</span> books total)
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => dispatch(changePage(currentPage - 1))}
                          disabled={currentPage === 1}
                          className="h-8 transition-all duration-200"
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                            <Button
                              key={p}
                              variant={currentPage === p ? "default" : "outline"}
                              size="sm"
                              onClick={() => dispatch(changePage(p))}
                              className={`h-8 w-8 transition-all duration-200 ${
                                currentPage === p ? "shadow-md shadow-primary/20" : ""
                              }`}
                            >
                              {p}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => dispatch(changePage(currentPage + 1))}
                          disabled={currentPage === pagination.totalPages}
                          className="h-8 transition-all duration-200"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <PlaylistsTab onBookClick={handleBookClick} />
          )}
        </div>
      </main>

      {/* Dialogs & Modals */}
      <BookFormDialog open={bookFormOpen} onOpenChange={handleFormClose} book={editingBook} />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Book"
        description="Are you sure you want to delete this book? This action cannot be undone."
        isLoading={isDeleting}
      />

      <EditProfileDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} />

      <BookDetailsModal
        isbn={detailsIsbn}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onAuthorClick={handleAuthorClick}
      />

      <AuthorProfileModal
        email={authorEmail}
        open={authorOpen}
        onOpenChange={setAuthorOpen}
        onBookClick={handleBookClick}
      />
    </div>
  );
}
