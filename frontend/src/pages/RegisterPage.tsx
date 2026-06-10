import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { BookOpen, Mail, Lock, Loader2, Eye, EyeOff, User, PenTool, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerAuthor, clearError } from "@/store/authSlice";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const { token, isLoading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"author" | "user">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Already authenticated → redirect
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address";
    }
    if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    if (!validate()) return;

    try {
      const result = await dispatch(
        registerAuthor({ name: name.trim(), email: email.trim(), password, role })
      ).unwrap();
      toast.success(`Account created! Welcome, ${result.author.name}!`);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Registration failed");
    }
  };

  const clearFieldError = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="gradient-bg-auth flex min-h-dvh items-center justify-center px-4 py-12">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-violet-500/10 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute left-1/3 top-1/3 h-60 w-60 rounded-full bg-indigo-500/5 blur-[80px]" />
      </div>

      <Card className="animate-fade-in-up relative w-full max-w-md glass border-white/[0.08] shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="gradient-text text-2xl font-bold">
            Create Account
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Join as a reader or publish as an author
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
            {/* Server error */}
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="register-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="register-name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearFieldError("name");
                  }}
                  className={`pl-10 ${validationErrors.name ? "border-destructive" : ""}`}
                  autoComplete="name"
                />
              </div>
              {validationErrors.name && (
                <p className="text-xs text-destructive">{validationErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError("email");
                  }}
                  className={`pl-10 ${validationErrors.email ? "border-destructive" : ""}`}
                  autoComplete="email"
                />
              </div>
              {validationErrors.email && (
                <p className="text-xs text-destructive">{validationErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Account type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={role === "user" ? "default" : "outline"}
                  onClick={() => setRole("user")}
                  className="h-auto justify-start gap-2 py-3"
                >
                  <Bookmark className="h-4 w-4" />
                  Reader
                </Button>
                <Button
                  type="button"
                  variant={role === "author" ? "default" : "outline"}
                  onClick={() => setRole("author")}
                  className="h-auto justify-start gap-2 py-3"
                >
                  <PenTool className="h-4 w-4" />
                  Author
                </Button>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError("password");
                  }}
                  className={`pl-10 pr-10 ${validationErrors.password ? "border-destructive" : ""}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-xs text-destructive">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="register-confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="register-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError("confirmPassword");
                  }}
                  className={`pl-10 pr-10 ${validationErrors.confirmPassword ? "border-destructive" : ""}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-xs text-destructive">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full font-medium"
              disabled={isLoading}
              id="register-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
              id="login-link"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
