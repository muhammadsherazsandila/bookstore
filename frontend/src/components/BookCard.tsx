import { DollarSign, Calendar, Pencil, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Book } from "@/types";

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (isbn: string) => void;
  index?: number;
}

export default function BookCard({ book, onEdit, onDelete, index = 0 }: BookCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(book.price));

  const formattedDate = new Date(book.published_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] card-glow hover:card-glow-hover"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Subtle gradient accent at top */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base font-semibold leading-snug">
            {book.title}
          </CardTitle>
        </div>
        <Badge variant="secondary" className="w-fit text-xs font-mono">
          ISBN: {book.isbn}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">{formattedPrice}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formattedDate}</span>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex justify-end gap-1 pt-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(book)}
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          aria-label={`Edit ${book.title}`}
          id={`edit-book-${book.isbn}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(book.isbn)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label={`Delete ${book.title}`}
          id={`delete-book-${book.isbn}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
