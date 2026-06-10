import React, { useEffect, useState } from "react";
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
import { featuresService } from "@/services/featuresService";
import { setAuthor } from "@/store/authSlice";
import toast from "react-hot-toast";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated?: () => void;
}

export default function EditProfileDialog({
  open,
  onOpenChange,
  onProfileUpdated,
}: EditProfileDialogProps) {
  const dispatch = useAppDispatch();
  const { author } = useAppSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (author) {
      setName(author.name || "");
      setBio(author.bio || "");
      setAvatar(author.avatar || "");
    }
  }, [author, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsLoading(true);
    try {
      const updatedAuthor = await featuresService.updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatar: avatar.trim(),
      });

      // Update in Redux
      dispatch(setAuthor(updatedAuthor));

      // Save to localStorage as well
      localStorage.setItem("author", JSON.stringify(updatedAuthor));

      toast.success("Profile updated successfully!");
      onOpenChange(false);
      if (onProfileUpdated) onProfileUpdated();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your public profile details. Authors can view this info when exploring books.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Display Name</Label>
            <Input
              id="profile-name"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-avatar">Avatar Image URL</Label>
            <Input
              id="profile-avatar"
              placeholder="e.g. https://images.unsplash.com/photo-..."
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
            {avatar && (
              <div className="flex justify-center pt-2">
                <img
                  src={avatar}
                  alt="Avatar preview"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                  className="h-14 w-14 rounded-full object-cover border"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-bio">Biography (Bio)</Label>
            <textarea
              id="profile-bio"
              placeholder="Write a short summary about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
