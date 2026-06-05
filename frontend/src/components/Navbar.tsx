import { useNavigate } from "react-router-dom";
import { BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { clearBooks } from "@/store/booksSlice";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { author } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(clearBooks());
    dispatch(logout());
    navigate("/login");
  };

  return (
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
          {author && (
            <span className="hidden text-sm text-muted-foreground sm:inline-block">
              Hello,{" "}
              <span className="font-medium text-foreground">{author.name}</span>
            </span>
          )}
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
        </div>
      </div>
    </header>
  );
}
