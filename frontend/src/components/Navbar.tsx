import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, LayoutDashboard, LogIn, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout, deleteAuthorAccount } from "@/store/authSlice";
import { clearBooks } from "@/store/booksSlice";
import ConfirmDialog from "@/components/ConfirmDialog";
import toast from "react-hot-toast";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { author, token } = useAppSelector((state) => state.auth);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleLogout = () => {
    dispatch(clearBooks());
    dispatch(logout());
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await dispatch(deleteAuthorAccount()).unwrap();
      dispatch(clearBooks());
      toast.success("Account deleted successfully");
      navigate("/login");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to delete account");
    } finally {
      setIsDeletingAccount(false);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Bookstore
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link to="/">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Catalog</span>
              </Link>
            </Button>
            {token && (
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>
            )}
            {author && (
              <span className="hidden text-sm text-muted-foreground sm:inline-block">
                Hello,{" "}
                <span className="font-medium text-foreground">{author.name}</span>
              </span>
            )}
            {token ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                  id="delete-account-button"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete Account</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                  id="logout-button"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="Are you sure you want to delete your account? This will permanently delete all your books and cannot be undone."
        isLoading={isDeletingAccount}
      />
    </>
  );
}
