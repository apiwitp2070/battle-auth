import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, type RefObject } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignInBoxProps {
  ref: RefObject<HTMLDivElement | null>;
  loading: boolean;
  isBattle: boolean;
  isTransform: boolean;
  onLogin: () => void;
}

const DEFAULT_EMAIL = "test@example.email";
const DEFAULT_PASSWORD = "123456";

export default function SignInBox({
  ref,
  loading,
  isBattle,
  isTransform,
  onLogin,
}: SignInBoxProps) {
  const disabled = isBattle || loading || isTransform;

  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <Card
      className={cn(
        "w-full max-w-md backdrop-blur",
        (isBattle || isTransform) && "select-none",
        isTransform && "pointer-events-none"
      )}
    >
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin();
          }}
        >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                disabled={disabled}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </a>
              </div>

              <Input
                id="password"
                type="password"
                placeholder="password"
                autoComplete="password"
                required
                value={password}
                disabled={disabled}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(value) => setRememberMe(Boolean(value))}
                disabled={disabled}
              />
              <Label htmlFor="remember">Remember me</Label>
            </div>

            {!isBattle && (
              <div ref={ref} className="relative">
                <Button
                  type="submit"
                  className={cn(
                    "w-full",
                    isTransform && "invisible pointer-events-none"
                  )}
                  disabled={disabled}
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <span>Login</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
