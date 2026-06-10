import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { featuresService } from "@/services/featuresService";
import type { Author, Book } from "@/types";
import { BookOpen, Mail, User } from "lucide-react";
import toast from "react-hot-toast";

interface AuthorProfileModalProps {
  email: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookClick?: (isbn: string) => void;
}

export default function AuthorProfileModal({
  email,
  open,
  onOpenChange,
  onBookClick,
}: AuthorProfileModalProps) {
  const [profile, setProfile] = useState<Author | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!open || !email) return;

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const data = await featuresService.getAuthorProfile(email);
        setProfile(data.author);
        setBooks(data.books);
      } catch {
        toast.error("Failed to load author profile");
        onOpenChange(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [email, open]);

  if (!open || !email) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex h-60 items-center justify-center">
            <span className="animate-pulse text-muted-foreground">Loading profile...</span>
          </div>
        ) : (
          profile && (
            <div className="space-y-6">
              {/* Header profile info */}
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="h-20 w-20 rounded-full object-cover border-2 border-primary shadow"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary text-3xl font-bold border-2 border-primary/20 shadow-inner">
                    {profile.name.charAt(0)}
                  </div>
                )}
                <div className="space-y-1">
                  <DialogTitle className="text-2xl font-bold">{profile.name}</DialogTitle>
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                      {profile.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      {books.length} {books.length === 1 ? "Book" : "Books"} published
                    </span>
                  </div>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    Official Writer
                  </Badge>
                </div>
              </div>

              {/* Biography */}
              <div className="space-y-2 bg-muted/30 p-4 rounded-lg border">
                <h3 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                  <User className="h-4 w-4 text-primary" />
                  Biography
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {profile.bio || `${profile.name} has not written a biography yet.`}
                </p>
              </div>

              {/* Book Catalog Grid */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Books by this writer</h3>
                {books.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No books published yet.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {books.map((book) => (
                      <Card
                        key={book.isbn}
                        onClick={() => {
                          if (onBookClick) {
                            onOpenChange(false);
                            onBookClick(book.isbn);
                          }
                        }}
                        className={`overflow-hidden transition-all hover:scale-[1.02] cursor-pointer ${
                          onBookClick ? "hover:border-primary/50" : ""
                        }`}
                      >
                        <div className="aspect-[4/5] bg-muted relative">
                          <img
                            src={book.cover_image || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60"}
                            alt={book.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <CardContent className="p-2 space-y-1">
                          <h4 className="text-xs font-semibold line-clamp-2 leading-snug">{book.title}</h4>
                          <span className="text-[10px] text-muted-foreground font-mono">ISBN: {book.isbn}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
