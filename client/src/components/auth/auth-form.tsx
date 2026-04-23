import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Loader2, Mail, User, Lock, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FarmoraRole, persistAuthSession, persistSelectedRole } from "@/lib/auth-preferences";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  role: Extract<FarmoraRole, "user" | "creator">;
  mode: AuthMode;
}

const expertiseOptions = ["Compost", "Bio-pesticide", "Soil Health", "Planting", "Irrigation", "Organic Kits"];

export default function AuthForm({ role, mode }: AuthFormProps) {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    brandName: "",
    expertise: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isCreator = role === "creator";
  const isSignup = mode === "signup";
  const copy = useMemo(() => {
    if (isCreator && isSignup) {
      return {
        title: "Launch your creator profile",
        subtitle: "Set up your Farmora creator identity for tutorials, trust, and future rewards.",
        submit: "Create Creator Account",
        alternateHref: "/login/creator",
        alternateText: "Already a creator? Login",
      };
    }
    if (isCreator) {
      return {
        title: "Creator Login",
        subtitle: "Access your studio, publish tutorials, and grow your organic farming audience.",
        submit: "Login as Creator",
        alternateHref: "/signup/creator",
        alternateText: "Become a Creator / Sign Up",
      };
    }
    if (isSignup) {
      return {
        title: "Create User Account",
        subtitle: "Save recommendations, explore kits, and build your organic farming plan.",
        submit: "Create User Account",
        alternateHref: "/login/user",
        alternateText: "Already have an account? Login",
      };
    }
    return {
      title: "User Login",
      subtitle: "Continue learning with tutorials, kits, and personalized recommendations.",
      submit: "Login",
      alternateHref: "/signup/user",
      alternateText: "Create User Account",
    };
  }, [isCreator, isSignup]);

  function updateValue(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (isSignup && values.name.trim().length < 2) nextErrors.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) nextErrors.email = "Enter a valid email.";
    if (values.password.length < 6) nextErrors.password = "Password must be at least 6 characters.";
    if (isCreator && isSignup && values.brandName.trim().length < 2) nextErrors.brandName = "Enter your channel or brand.";
    if (isCreator && isSignup && !values.expertise) nextErrors.expertise = "Choose an expertise category.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    persistAuthSession(role, values.email);

    window.setTimeout(() => {
      setIsSubmitting(false);
      setLocation(role === "creator" ? "/creator" : "/");
    }, 800);
  }

  function continueAsGuest() {
    persistSelectedRole("guest");
    setLocation("/");
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <div
          className={cn(
            "mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl",
            isCreator ? "bg-amber-300/20 text-amber-200" : "bg-primary/10 text-primary"
          )}
        >
          <BadgeCheck className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-black">{copy.title}</h2>
        <p className={cn("text-sm leading-6", isCreator ? "text-white/70" : "text-muted-foreground")}>{copy.subtitle}</p>
      </div>

      <div className="space-y-4">
        {isSignup && (
          <FieldShell label="Name" error={errors.name} dark={isCreator}>
            <User className="h-4 w-4" />
            <Input
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              placeholder="Your name"
              className={fieldClass(isCreator)}
            />
          </FieldShell>
        )}

        <FieldShell label="Email" error={errors.email} dark={isCreator}>
          <Mail className="h-4 w-4" />
          <Input
            type="email"
            value={values.email}
            onChange={(event) => updateValue("email", event.target.value)}
            placeholder="you@example.com"
            className={fieldClass(isCreator)}
          />
        </FieldShell>

        <FieldShell label="Password" error={errors.password} dark={isCreator}>
          <Lock className="h-4 w-4" />
          <Input
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={(event) => updateValue("password", event.target.value)}
            placeholder="Minimum 6 characters"
            className={fieldClass(isCreator)}
          />
          <button
            type="button"
            className="text-muted-foreground transition-colors hover:text-primary"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </FieldShell>

        {isCreator && isSignup && (
          <>
            <FieldShell label="Channel/Brand Name" error={errors.brandName} dark>
              <BadgeCheck className="h-4 w-4" />
              <Input
                value={values.brandName}
                onChange={(event) => updateValue("brandName", event.target.value)}
                placeholder="Farm channel name"
                className={fieldClass(true)}
              />
            </FieldShell>
            <div className="space-y-2">
              <Label className="text-white/82">Expertise Category</Label>
              <Select value={values.expertise} onValueChange={(value) => updateValue("expertise", value)}>
                <SelectTrigger className="h-14 rounded-2xl border-white/15 bg-white/10 text-white shadow-sm">
                  <SelectValue placeholder="Choose expertise" />
                </SelectTrigger>
                <SelectContent>
                  {expertiseOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.expertise && <p className="text-xs font-medium text-red-300">{errors.expertise}</p>}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 text-sm">
        <button
          type="button"
          className={cn("font-semibold", isCreator ? "text-amber-200 hover:text-amber-100" : "text-primary")}
        >
          Forgot Password
        </button>
        <Link className={cn("font-semibold", isCreator ? "text-white/80 hover:text-white" : "text-foreground")} href={copy.alternateHref}>
          {copy.alternateText}
        </Link>
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          className={cn(
            "h-14 w-full rounded-2xl text-base font-bold shadow-xl",
            isCreator ? "bg-amber-300 text-stone-950 hover:bg-amber-200" : "bg-primary text-white hover:bg-primary/90"
          )}
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {copy.submit}
        </Button>
        {!isCreator && (
          <Button type="button" variant="outline" className="h-14 w-full rounded-2xl bg-white/70" onClick={continueAsGuest}>
            Continue as Guest
          </Button>
        )}
      </div>
    </form>
  );
}

function FieldShell({
  label,
  error,
  dark,
  children,
}: {
  label: string;
  error?: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className={cn(dark && "text-white/82")}>{label}</Label>
      <div
        className={cn(
          "flex h-14 items-center gap-3 rounded-2xl border px-4 shadow-sm transition-colors focus-within:ring-2",
          dark ? "border-white/15 bg-white/10 focus-within:ring-amber-300/40" : "border-border bg-white/80 focus-within:ring-primary/20"
        )}
      >
        {children}
      </div>
      {error && <p className={cn("text-xs font-medium", dark ? "text-red-300" : "text-destructive")}>{error}</p>}
    </div>
  );
}

function fieldClass(dark: boolean) {
  return cn(
    "h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0",
    dark ? "text-white placeholder:text-white/40" : "placeholder:text-muted-foreground"
  );
}
