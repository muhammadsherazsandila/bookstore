import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  BookOpen,
  Calendar,
  ChevronDown,
  DollarSign,
  Library,
  Loader2,
  Search,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
  Heart,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/authService";
import { bookService } from "@/services/bookService";
import { useAppSelector } from "@/store/hooks";
import toast from "react-hot-toast";
import type { Author, Book } from "@/types";
import BookDetailsModal from "@/components/BookDetailsModal";
import AuthorProfileModal from "@/components/AuthorProfileModal";

const CATEGORIES = [
  "All",
  "Fiction",
  "Sci-Fi",
  "Fantasy",
  "Mystery",
  "Biography",
  "History",
  "Tech",
  "Science",
  "Romance",
  "Self-Help",
  "Kids",
  "Other",
];

/* ─── Intersection Observer hook for scroll-triggered animations ──────────── */

function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
}

/* ─── Animated Counter ────────────────────────────────────────────────────── */

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, isInView } = useInView();

  useEffect(() => {
    if (!isInView || target === 0) return;
    let start = 0;
    const startTime = performance.now();
    const step = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      start = Math.floor(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count}</span>;
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */

export default function CatalogPage() {
  const { token } = useAppSelector((state) => state.auth);
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [savedBooks, setSavedBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [detailsIsbn, setDetailsIsbn] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [authorEmail, setAuthorEmail] = useState<string | null>(null);
  const [authorOpen, setAuthorOpen] = useState(false);

  const catalogRef = useRef<HTMLDivElement>(null);

  const loadCatalog = async () => {
    setIsLoading(true);
    try {
      const categoryParam = selectedCategory === "All" ? undefined : selectedCategory;
      const [bookData, authorData, savedData] = await Promise.all([
        bookService.getPublicBooks(1, 24, categoryParam),
        authService.getAuthors(),
        token ? bookService.getSavedBooks() : Promise.resolve([]),
      ]);
      setBooks(bookData.books);
      setAuthors(authorData);
      setSavedBooks(savedData);
    } catch {
      toast.error("Failed to load catalog");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [token, selectedCategory]);

  const savedIsbns = useMemo(
    () => new Set(savedBooks.map((book) => book.isbn)),
    [savedBooks]
  );

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const query = searchQuery.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query) ||
        book.author_name?.toLowerCase().includes(query)
    );
  }, [books, searchQuery]);

  const handleSaveToggle = async (book: Book) => {
    if (!token) {
      toast.error("Sign in to save books");
      return;
    }

    try {
      if (savedIsbns.has(book.isbn)) {
        await bookService.unsaveBook(book.isbn);
        setSavedBooks((current) => current.filter((saved) => saved.isbn !== book.isbn));
        toast.success("Removed from saved books");
      } else {
        await bookService.saveBook(book.isbn);
        setSavedBooks((current) => [book, ...current]);
        toast.success("Book saved");
      }
    } catch {
      toast.error("Could not update saved books");
    }
  };

  const handleAuthorDetails = (email: string) => {
    setAuthorEmail(email);
    setAuthorOpen(true);
  };

  const handleBookDetails = (isbn: string) => {
    setDetailsIsbn(isbn);
    setDetailsOpen(true);
  };

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar />

      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border/30">
        {/* Animated glow orbs */}
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-glow hero-glow-3" />

        {/* Noise texture */}
        <div className="noise-overlay absolute inset-0" />

        {/* Grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.8 0 0 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.8 0 0 / 0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          {/* Pill badge */}
          <div
            className="glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-muted-foreground"
            style={{ animation: "fade-in-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Discover your next favorite read</span>
          </div>

          {/* Main heading */}
          <h1
            className="max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ animation: "fade-in-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both" }}
          >
            Your Personal{" "}
            <span className="gradient-text">Book Collection</span>{" "}
            Awaits
          </h1>

          {/* Subtitle */}
          <p
            className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl"
            style={{ animation: "fade-in-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both" }}
          >
            Browse curated collections from talented authors, save your favorites,
            and build a library that inspires you.
          </p>

          {/* CTA Buttons */}
          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
            style={{ animation: "fade-in-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both" }}
          >
            <Button
              size="lg"
              className="gap-2 bg-primary px-8 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
              onClick={scrollToCatalog}
            >
              <BookOpen className="h-4 w-4" />
              Browse Catalog
            </Button>
            {!token && (
              <Button asChild variant="outline" size="lg" className="gap-2 px-8">
                <Link to="/register">
                  <UserRound className="h-4 w-4" />
                  Create Account
                </Link>
              </Button>
            )}
          </div>

          {/* Scroll indicator */}
          <button
            onClick={scrollToCatalog}
            className="mt-16 flex flex-col items-center gap-2 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
            style={{ animation: "fade-in 1s ease-out 0.8s both" }}
          >
            <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </button>
        </div>

        {/* Floating decorative books */}
        <div className="pointer-events-none absolute left-[8%] top-[20%] hidden opacity-20 lg:block" style={{ animation: "float 6s ease-in-out infinite" }}>
          <div className="h-24 w-16 rounded-md bg-gradient-to-br from-primary/40 to-primary/10 shadow-lg" />
        </div>
        <div className="pointer-events-none absolute right-[10%] top-[30%] hidden opacity-15 lg:block" style={{ animation: "float 6s ease-in-out 2s infinite" }}>
          <div className="h-20 w-14 rounded-md bg-gradient-to-br from-pink-500/30 to-purple-500/10 shadow-lg" />
        </div>
        <div className="pointer-events-none absolute bottom-[15%] left-[15%] hidden opacity-10 lg:block" style={{ animation: "float 7s ease-in-out 1s infinite" }}>
          <div className="h-16 w-12 rounded-md bg-gradient-to-br from-amber-500/30 to-orange-500/10 shadow-lg" />
        </div>
      </section>

      {/* ─── Stats Bar ────────────────────────────────────────────────── */}
      <section className="relative z-10 border-b border-border/30 bg-muted/30">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-4 sm:px-6 lg:px-8">
          <StatItem icon={<Library className="h-5 w-5" />} value={books.length} label="Books Available" />
          <StatItem icon={<Users className="h-5 w-5" />} value={authors.length} label="Authors" />
          <StatItem icon={<Bookmark className="h-5 w-5" />} value={savedBooks.length} label="Saved Books" />
          <StatItem icon={<TrendingUp className="h-5 w-5" />} value={books.length > 0 ? Math.round(books.reduce((s, b) => s + Number(b.price), 0) / books.length) : 0} label="Avg. Price ($)" />
        </div>
      </section>

      {/* ─── Catalog Section ──────────────────────────────────────────── */}
      <main ref={catalogRef} className="flex-1 scroll-mt-16">
        {/* Search bar area */}
        <section className="border-b border-border/30 bg-background/50">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Book Catalog
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredBooks.length} {filteredBooks.length === 1 ? "book" : "books"} available
              </p>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search books, ISBN, or author..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10 bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-colors"
                id="catalog-search"
              />
            </div>
          </div>
        </section>

        {/* Category Pill Filters */}
        <section className="border-b border-border/10 bg-background/10 py-4 overflow-x-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex gap-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="rounded-full shrink-0 text-xs transition-all"
              >
                {cat}
              </Button>
            ))}
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
          <div className="space-y-6">
            {/* Book grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
                  <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
                </div>
                <p className="mt-6 text-sm text-muted-foreground">Loading catalog...</p>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
                  <BookOpen className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">No books found</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Try a different search or check back after authors publish books.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredBooks.map((book, index) => (
                  <CatalogBookCard
                    key={book.isbn}
                    book={book}
                    index={index}
                    isSaved={savedIsbns.has(book.isbn)}
                    onSaveToggle={handleSaveToggle}
                    onAuthorDetails={handleAuthorDetails}
                    onBookDetails={handleBookDetails}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Authors sidebar */}
          <aside className="space-y-5">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">Authors</h2>
            </div>
            <div className="space-y-3">
              {authors.map((author, i) => (
                <div
                  key={author.email}
                  className="glass-card gradient-border rounded-xl p-4"
                  style={{ animation: `fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.1 * i}s both` }}
                >
                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {author.avatar ? (
                        <img src={author.avatar} className="h-9 w-9 rounded-full object-cover shrink-0 border" alt={author.name} />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {author.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{author.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {author.book_count ?? 0} books
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAuthorDetails(author.email)}
                      className="shrink-0 text-primary hover:text-primary/80 hover:bg-primary/10"
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
              {authors.length === 0 && !isLoading && (
                <p className="text-sm text-muted-foreground py-4 text-center">No authors yet</p>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-border/30 bg-muted/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Bookstore</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Bookstore. Built with passion for readers.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <BookDetailsModal
        isbn={detailsIsbn}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onAuthorClick={handleAuthorDetails}
      />

      <AuthorProfileModal
        email={authorEmail}
        open={authorOpen}
        onOpenChange={setAuthorOpen}
        onBookClick={handleBookDetails}
      />
    </div>
  );
}

/* ─── Stat Item ───────────────────────────────────────────────────────────── */

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-2 text-center">
      <div className="text-primary/70">{icon}</div>
      <span className="text-2xl font-bold tracking-tight text-foreground">
        <AnimatedCounter target={value} />
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

/* ─── Catalog Book Card ───────────────────────────────────────────────────── */

type CatalogBookCardProps = {
  book: Book;
  index: number;
  isSaved: boolean;
  onSaveToggle: (book: Book) => void;
  onAuthorDetails: (email: string) => void;
  onBookDetails: (isbn: string) => void;
};

function CatalogBookCard({ book, index, isSaved, onSaveToggle, onAuthorDetails, onBookDetails }: CatalogBookCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(book.price));

  const formattedDate = new Date(book.published_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Generate a pseudo-random hue based on the ISBN for accent color variety
  const hueFromISBN = book.isbn.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360;

  return (
    <div
      onClick={() => onBookDetails(book.isbn)}
      className="glass-card group relative overflow-hidden rounded-xl cursor-pointer hover:border-primary/40 transition-colors duration-300"
      style={{
        animation: `fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${Math.min(index * 0.06, 0.6)}s both`,
      }}
    >
      {/* Top accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-[2px] opacity-60 transition-opacity group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, oklch(0.7 0.18 ${hueFromISBN}), transparent)`,
        }}
      />

      {book.cover_image && (
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
          <img
            src={book.cover_image}
            alt={`${book.title} cover`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      <div className="relative z-10 p-5">
        {/* Category + Title + ISBN */}
        <div className="mb-4">
          <div className="flex justify-between items-start gap-2">
            {book.category && <Badge className="bg-primary/20 text-primary hover:bg-primary/30 h-5 text-[10px]">{book.category}</Badge>}
            <Badge variant="secondary" className="w-fit text-[10px] font-mono tracking-wider opacity-70">
              {book.isbn}
            </Badge>
          </div>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors duration-300 mt-2">
            {book.title}
          </h3>
        </div>

        {/* Meta info */}
        <div className="space-y-2.5">
          <button
            className="flex items-center gap-2 text-left text-sm text-primary/80 hover:text-primary transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onAuthorDetails(book.author_email);
            }}
            type="button"
          >
            <UserRound className="h-3.5 w-3.5" />
            <span className="truncate">{book.author_name ?? book.author_email}</span>
          </button>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400/80" />
              <span className="font-semibold text-foreground">{formattedPrice}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs">{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-current" />
              <span>{book.likes_count || 0}</span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="mt-4 pt-4 border-t border-border/30">
          <Button
            variant={isSaved ? "default" : "outline"}
            className={`w-full gap-2 transition-all duration-300 ${
              isSaved
                ? "bg-primary/90 hover:bg-primary shadow-md shadow-primary/15"
                : "hover:border-primary/50 hover:text-primary hover:bg-primary/5"
            }`}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSaveToggle(book);
            }}
          >
            <Bookmark className={`h-3.5 w-3.5 transition-transform ${isSaved ? "fill-current scale-110" : ""}`} />
            {isSaved ? "Saved" : "Save Book"}
          </Button>
        </div>
      </div>
    </div>
  );
}
