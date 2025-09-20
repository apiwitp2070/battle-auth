import { Loader2 } from "lucide-react";

type BattleHudProps = {
  hpPercent: number;
};

export default function BattleHud({ hpPercent }: BattleHudProps) {
  return (
    <div className="absolute top-6 left-6 flex bg-muted w-60 max-w-screen flex-col gap-2 rounded-xl p-3 text-xs text-muted-foreground">
      <div className="flex items-center justify-between">
        <span>Verify your account, This may take some time...</span>
        <span>
          <Loader2 className="animate-spin" />
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full transition-all bg-gray-400"
          style={{ width: `${100 - hpPercent}%` }}
        />
      </div>
    </div>
  );
}
