import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { XCircle } from "lucide-react";

interface CardResultSuccessProps {
  onReset: () => void;
}

export default function CardResultFailed({ onReset }: CardResultSuccessProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex gap-2 items-center">
          <XCircle className="text-destructive" />
          Sign In Failed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          We could not verify your account. Please check your sign in
          information and try again.
        </p>
        <Button type="button" className="w-full " onClick={onReset}>
          Back to sign in page
        </Button>
      </CardContent>
    </Card>
  );
}
