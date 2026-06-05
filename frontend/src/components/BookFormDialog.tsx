import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addBook, editBook, fetchBooks, changePage } from "@/store/booksSlice";
import toast from "react-hot-toast";
import type { Book } from "@/types";

interface BookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book?: Book | null;
}

export default function BookFormDialog({ open, onOpenChange, book }: BookFormDialogProps) {
  const dispatch = useAppDispatch();
  const { isLoading, currentPage } = useAppSelector((state) => state.books);
  const isEditing = Boolean(book);

  const [formData, setFormData] = useState({
    isbn: "",
    title: "",
    price: "",
    published_date: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset / populate form when dialog opens
  useEffect(() => {
    if (open) {
      if (book) {
        setFormData({
          isbn: book.isbn,
          title: book.title,
          price: String(book.price),
          published_date: book.published_date.split("T")[0],
        });
      } else {
        setFormData({ isbn: "", title: "", price: "", published_date: "" });
      }
      setErrors({});
    }
  }, [open, book]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isEditing && !formData.isbn.trim()) {
      newErrors.isbn = "ISBN is required";
    }
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (!formData.published_date) {
      newErrors.published_date = "Published date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isEditing && book) {
        await dispatch(
          editBook({
            isbn: book.isbn,
            payload: {
              title: formData.title.trim(),
              price: Number(formData.price),
              published_date: formData.published_date,
            },
          })
        ).unwrap();
        dispatch(fetchBooks({ page: currentPage, limit: 6 }));
        toast.success("Book updated successfully!");
      } else {
        await dispatch(
          addBook({
            isbn: formData.isbn.trim(),
            title: formData.title.trim(),
            price: Number(formData.price),
            published_date: formData.published_date,
          })
        ).unwrap();
        dispatch(changePage(1));
        dispatch(fetchBooks({ page: 1, limit: 6 }));
        toast.success("Book added successfully!");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Something went wrong");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Book" : "Add New Book"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the book details below."
              : "Fill in the details to add a new book to your collection."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" id="book-form">
          {/* ISBN — only for new books */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                placeholder="e.g. 978-3-16-148410-0"
                value={formData.isbn}
                onChange={(e) => handleChange("isbn", e.target.value)}
                className={errors.isbn ? "border-destructive" : ""}
              />
              {errors.isbn && (
                <p className="text-xs text-destructive">{errors.isbn}</p>
              )}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter book title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="29.99"
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
              className={errors.price ? "border-destructive" : ""}
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price}</p>
            )}
          </div>

          {/* Published Date */}
          <div className="space-y-2">
            <Label htmlFor="published_date">Published Date</Label>
            <Input
              id="published_date"
              type="date"
              value={formData.published_date}
              onChange={(e) => handleChange("published_date", e.target.value)}
              className={errors.published_date ? "border-destructive" : ""}
            />
            {errors.published_date && (
              <p className="text-xs text-destructive">{errors.published_date}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} id="book-form-submit">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Add Book"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
