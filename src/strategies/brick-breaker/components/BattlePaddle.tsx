import { PADDLE_HEIGHT } from "../constants";

type BattlePaddleProps = {
  width: number;
  left: number;
  top: number;
};

export default function BattlePaddle({ width, left, top }: BattlePaddleProps) {
  return (
    <div
      className="pointer-events-none absolute z-20 px-6 flex items-center justify-center rounded-md bg-primary shadow-xs"
      style={{
        width,
        left,
        top,
        height: PADDLE_HEIGHT,
      }}
    />
  );
}
