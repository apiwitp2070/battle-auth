import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface CardResultSuccessProps {
  onReset: () => void;
}

export default function CardResultSuccess({ onReset }: CardResultSuccessProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex gap-2 items-center">
          <CheckCircle2 className="text-emerald-600" />
          <span>Sign In Success</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Account verification completed. You should be redirected to homepage
          shortly... or maybe not.
        </p>
      </CardContent>
      <CardFooter>
        <Button type="button" className="w-full" onClick={onReset}>
          Back to sign in page
        </Button>
      </CardFooter>
    </Card>
  );
}
