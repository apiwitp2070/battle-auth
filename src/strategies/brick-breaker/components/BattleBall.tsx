import { BALL_SIZE } from "../constants";

type BattleBallProps = {
  x: number;
  y: number;
};

export default function BattleBall({ x, y }: BattleBallProps) {
  return (
    <div
      className="absolute z-10"
      style={{
        width: BALL_SIZE,
        height: BALL_SIZE,
        left: x - BALL_SIZE / 2,
        top: y - BALL_SIZE / 2,
      }}
    >
      <div className="h-full w-full animate-[pulse_2s_ease-in-out_infinite] rounded-full bg-primary" />
    </div>
  );
}
