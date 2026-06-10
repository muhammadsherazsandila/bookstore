import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
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

const CATEGORIES = [
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

export default function BookFormDialog({ open, onOpenChange, book }: BookFormDialogProps) {
  const dispatch = useAppDispatch();
  const { isLoading, currentPage } = useAppSelector((state) => state.books);
  const isEditing = Boolean(book);

  const [formData, setFormData] = useState({
    isbn: "",
    title: "",
    price: "",
    published_date: "",
    category: "",
    description: "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;

    if (book) {
      setFormData({
        isbn: book.isbn,
        title: book.title,
        price: String(book.price),
        published_date: book.published_date.split("T")[0],
        category: book.category || "",
        description: book.description || "",
      });
    } else {
      setFormData({
        isbn: "",
        title: "",
        price: "",
        published_date: "",
        category: "",
        description: "",
      });
    }
    setCoverFile(null);
    setErrors({});
  }, [book, open]);

  const previewUrl = useMemo(() => {
    if (coverFile) return URL.createObjectURL(coverFile);
    return book?.cover_image ?? "";
  }, [book?.cover_image, coverFile]);

  useEffect(() => {
    if (!coverFile || !previewUrl) return;

    return () => URL.revokeObjectURL(previewUrl);
  }, [coverFile, previewUrl]);

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
              category: formData.category,
              description: formData.description.trim(),
              cover_image: coverFile,
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
            category: formData.category,
            description: formData.description.trim(),
            cover_image: coverFile,
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

  const handleCoverFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        cover_image: "Please choose an image file",
      }));
      return;
    }
    setCoverFile(file);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.cover_image;
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description/Details</Label>
            <textarea
              id="description"
              placeholder="Provide summary, detail and book context..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image">Cover Image</Label>
            <label
              htmlFor="cover_image"
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-4 text-center transition-colors hover:border-primary/60 hover:bg-primary/5 ${
                errors.cover_image ? "border-destructive" : "border-border"
              }`}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleCoverFile(event.dataTransfer.files[0]);
              }}
            >
              {previewUrl ? (
                <div className="relative h-40 w-full overflow-hidden rounded-md border border-border bg-muted">
                  <img
                    src={previewUrl}
                    alt={`${formData.title || "Book"} cover preview`}
                    className="h-full w-full object-cover"
                  />
                  {coverFile && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8"
                      onClick={(event) => {
                        event.preventDefault();
                        setCoverFile(null);
                      }}
                      aria-label="Remove selected cover image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Drop a cover image here or browse
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      JPEG, PNG, WebP, or GIF up to 5 MB
                    </p>
                  </div>
                </>
              )}
              <Input
                id="cover_image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(event) => handleCoverFile(event.target.files?.[0])}
              />
            </label>
            {errors.cover_image && (
              <p className="text-xs text-destructive">{errors.cover_image}</p>
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
