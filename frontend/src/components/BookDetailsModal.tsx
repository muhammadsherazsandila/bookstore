import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/store/hooks";
import { featuresService } from "@/services/featuresService";
import type { Book, Review, Playlist } from "@/types";
import { Heart, Star, MessageSquare, Plus, Trash2, Calendar, DollarSign, ListPlus } from "lucide-react";
import toast from "react-hot-toast";

interface BookDetailsModalProps {
  isbn: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthorClick: (email: string) => void;
}

export default function BookDetailsModal({
  isbn,
  open,
  onOpenChange,
  onAuthorClick,
}: BookDetailsModalProps) {
  const { token, author } = useAppSelector((state) => state.auth);
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!open || !isbn) return;

    const loadBookData = async () => {
      setIsLoading(true);
      try {
        const [bookData, reviewData] = await Promise.all([
          featuresService.getLikes(isbn).then((likeData) =>
            // Fallback: we fetch detail or use likeInfo
            // Wait, we have a public getBookByISBN we can use
            import("@/services/bookService").then(({ bookService }) =>
              bookService.getPublicBookByISBN(isbn)
            )
          ),
          featuresService.getReviews(isbn),
        ]);
        setBook(bookData);
        setReviews(reviewData);

        if (token) {
          const userPlaylists = await featuresService.getCollections();
          setPlaylists(userPlaylists);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load book details");
        onOpenChange(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookData();
  }, [isbn, open, token]);

  const handleLikeToggle = async () => {
    if (!token) {
      toast.error("Please log in to like books");
      return;
    }
    if (!book) return;

    try {
      const res = await featuresService.toggleLike(book.isbn);
      setBook((prev) =>
        prev
          ? {
              ...prev,
              user_liked: res.liked,
              likes_count: res.likes_count,
            }
          : null
      );
      toast.success(res.liked ? "Liked book" : "Unliked book");
    } catch {
      toast.error("Failed to update like");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please log in to review books");
      return;
    }
    if (!book || !comment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const newReview = await featuresService.addReview(book.isbn, rating, comment.trim());
      setReviews((prev) => [newReview, ...prev]);
      setComment("");
      setRating(5);
      toast.success("Review submitted!");
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await featuresService.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const handleAddToPlaylist = async (playlistId: number) => {
    if (!book) return;
    try {
      await featuresService.addBookToCollection(playlistId, book.isbn);
      toast.success("Added to playlist!");
    } catch {
      toast.error("Failed to add to playlist (maybe already exists)");
    }
  };

  if (!open || !isbn) return null;

  const formattedPrice = book
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(book.price))
    : "";

  const formattedDate = book
    ? new Date(book.published_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex h-60 items-center justify-center">
            <span className="animate-pulse text-muted-foreground">Loading details...</span>
          </div>
        ) : (
          book && (
            <div className="space-y-6">
              {/* Cover Image & Primary info */}
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="mx-auto w-40 shrink-0 overflow-hidden rounded-lg border bg-muted shadow-md md:mx-0">
                  <img
                    src={book.cover_image || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60"}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-3 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    {book.category && <Badge className="bg-primary/20 text-primary">{book.category}</Badge>}
                    <Badge variant="outline" className="font-mono text-xs">ISBN: {book.isbn}</Badge>
                  </div>
                  <DialogTitle className="text-2xl font-bold leading-tight">{book.title}</DialogTitle>
                  <button
                    onClick={() => {
                      onOpenChange(false);
                      onAuthorClick(book.author_email);
                    }}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    by {book.author_name}
                  </button>

                  <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground pt-1">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">{formattedPrice}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
                    {/* Like Action */}
                    <Button
                      variant={book.user_liked ? "default" : "outline"}
                      size="sm"
                      onClick={handleLikeToggle}
                      className="gap-2"
                    >
                      <Heart className={`h-4 w-4 ${book.user_liked ? "fill-current" : ""}`} />
                      <span>{book.likes_count || 0}</span>
                    </Button>

                    {/* Playlist Action */}
                    {token && playlists.length > 0 && (
                      <div className="relative group inline-block">
                        <Button variant="outline" size="sm" className="gap-2">
                          <ListPlus className="h-4 w-4" />
                          Add to Playlist
                        </Button>
                        <div className="absolute left-0 mt-1 hidden group-hover:block z-50 bg-popover text-popover-foreground border rounded-md shadow-lg py-1 min-w-[160px]">
                          {playlists.map((playlist) => (
                            <button
                              key={playlist.id}
                              onClick={() => handleAddToPlaylist(playlist.id)}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                              {playlist.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description Details */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">About this Book</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {book.description || "No description provided for this book."}
                </p>
              </div>

              <Separator />

              {/* Reviews Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Reviews ({reviews.length})</h3>
                </div>

                {/* Submit review form */}
                {token ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-3 bg-muted/40 p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className="text-yellow-500 hover:scale-110 transition-transform"
                          >
                            <Star className={`h-4 w-4 ${rating >= star ? "fill-current" : ""}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a comment, share reviews..."
                        rows={2}
                        className="w-full text-sm bg-background border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" size="sm" disabled={isSubmittingReview}>
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs text-muted-foreground text-center bg-muted/20 py-2 rounded">
                    Please log in to write a review.
                  </p>
                )}

                {/* List of reviews */}
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic text-center py-4">No reviews yet. Be the first to review!</p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="border-b pb-3 last:border-0 last:pb-0 space-y-1">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {rev.avatar ? (
                              <img src={rev.avatar} className="h-6 w-6 rounded-full object-cover" alt={rev.author_name} />
                            ) : (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {rev.author_name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <span className="text-xs font-semibold">{rev.author_name}</span>
                              <div className="flex gap-0.5 mt-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 text-yellow-500 ${rev.rating >= star ? "fill-current" : ""}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(rev.created_at).toLocaleDateString()}
                            </span>
                            {author?.email === rev.user_email && (
                              <button
                                onClick={() => handleDeleteReview(rev.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground pl-8">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
