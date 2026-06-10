import { useEffect, useState } from "react";
import { featuresService } from "@/services/featuresService";
import type { Playlist, Book } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FolderPlus, Trash2, BookMarked, ChevronRight, X } from "lucide-react";
import toast from "react-hot-toast";

interface PlaylistsTabProps {
  onBookClick?: (isbn: string) => void;
}

export default function PlaylistsTab({ onBookClick }: PlaylistsTabProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistBooks, setPlaylistBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New playlist form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const loadPlaylists = async () => {
    setIsLoading(true);
    try {
      const data = await featuresService.getCollections();
      setPlaylists(data);
    } catch {
      toast.error("Failed to load playlists");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      const newPlaylist = await featuresService.createCollection(name.trim(), description.trim());
      setPlaylists((prev) => [newPlaylist, ...prev]);
      setName("");
      setDescription("");
      toast.success("Playlist created successfully!");
    } catch {
      toast.error("Failed to create playlist");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePlaylist = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await featuresService.deleteCollection(id);
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
      if (selectedPlaylist?.id === id) {
        setSelectedPlaylist(null);
        setPlaylistBooks([]);
      }
      toast.success("Playlist deleted");
    } catch {
      toast.error("Failed to delete playlist");
    }
  };

  const handleSelectPlaylist = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    try {
      const books = await featuresService.getCollectionBooks(playlist.id);
      setPlaylistBooks(books);
    } catch {
      toast.error("Failed to load playlist books");
    }
  };

  const handleRemoveBook = async (isbn: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedPlaylist) return;

    try {
      await featuresService.removeBookFromCollection(selectedPlaylist.id, isbn);
      setPlaylistBooks((prev) => prev.filter((b) => b.isbn !== isbn));
      // Update book count on playlists state locally
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === selectedPlaylist.id
            ? { ...p, book_count: Math.max(0, (p.book_count || 1) - 1) }
            : p
        )
      );
      toast.success("Book removed from playlist");
    } catch {
      toast.error("Failed to remove book");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
      {/* Create and list playlists */}
      <div className="md:col-span-1 space-y-6">
        <form onSubmit={handleCreatePlaylist} className="space-y-4 bg-muted/40 p-4 rounded-lg border">
          <h3 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
            <FolderPlus className="h-4 w-4 text-primary" />
            Create Playlist / Group
          </h3>
          <div className="space-y-1">
            <Label htmlFor="playlist-name" className="text-xs">Name</Label>
            <Input
              id="playlist-name"
              placeholder="e.g. My Favorites"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="playlist-desc" className="text-xs">Description</Label>
            <Input
              id="playlist-desc"
              placeholder="e.g. Books to read this summer"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" className="w-full" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Playlist"}
          </Button>
        </form>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">My Playlists</h3>
          {isLoading ? (
            <span className="text-xs text-muted-foreground animate-pulse">Loading playlists...</span>
          ) : playlists.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No playlists created yet.</p>
          ) : (
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  onClick={() => handleSelectPlaylist(playlist)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPlaylist?.id === playlist.id
                      ? "bg-primary/10 border-primary/30"
                      : "bg-card hover:bg-accent/40"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold truncate text-foreground">{playlist.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{playlist.description || "No description"}</p>
                    <span className="text-[10px] text-primary/80 mt-1 block">
                      {playlist.book_count || 0} {playlist.book_count === 1 ? "book" : "books"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={(e) => handleDeletePlaylist(playlist.id, e)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10 transition-colors"
                      aria-label="Delete playlist"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Playlist Details */}
      <div className="md:col-span-2 space-y-4 border rounded-lg p-5 bg-card min-h-[300px]">
        {selectedPlaylist ? (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-primary" />
                  {selectedPlaylist.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedPlaylist.description || "No description provided."}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedPlaylist(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <hr />

            {playlistBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookMarked className="h-10 w-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground italic">This playlist is empty.</p>
                <p className="text-xs text-muted-foreground/60 mt-1 max-w-[280px]">
                  Browse the public catalog and click "Add to Playlist" on any book details page to add books here!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {playlistBooks.map((book) => (
                  <div
                    key={book.isbn}
                    onClick={() => onBookClick?.(book.isbn)}
                    className="flex gap-3 p-2.5 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer relative group"
                  >
                    <div className="h-16 w-12 rounded overflow-hidden border bg-muted shrink-0">
                      <img
                        src={book.cover_image || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60"}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-semibold line-clamp-1 text-foreground leading-tight">{book.title}</h4>
                        <span className="text-[10px] text-muted-foreground block truncate">by {book.author_name}</span>
                        {book.category && <Badge className="text-[8px] h-4 px-1.5 mt-1 bg-primary/20 text-primary">{book.category}</Badge>}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">ISBN: {book.isbn}</span>
                    </div>
                    <button
                      onClick={(e) => handleRemoveBook(book.isbn, e)}
                      className="absolute top-2 right-2 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove book from playlist"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookMarked className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <h3 className="text-sm font-semibold text-muted-foreground">No Playlist Selected</h3>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-[280px]">
              Select a playlist from the left panel to view and manage books inside it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
