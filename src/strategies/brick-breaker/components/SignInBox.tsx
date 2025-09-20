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
import { type RefObject } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignInBoxProps {
  ref: RefObject<HTMLDivElement | null>;
  loading: boolean;
  isBattle: boolean;
  isTransform: boolean;
  onLogin: () => void;
}

export default function SignInBox({
  ref,
  loading,
  isBattle,
  isTransform,
  onLogin,
}: SignInBoxProps) {
  const disabled = isBattle || loading || isTransform;

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
                disabled={disabled}
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
                disabled={disabled}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" disabled={disabled} />
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
