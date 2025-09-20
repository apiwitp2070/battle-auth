import { BALL_SIZE, PADDLE_HEIGHT } from "../constants";
import type { TransformMeta } from "../types";

type TransformOverlayProps = {
  transformMeta: TransformMeta;
  transformEased: number;
  ballOpacity: number;
};

export default function TransformOverlay({
  transformMeta,
  transformEased,
  ballOpacity,
}: TransformOverlayProps) {
  const transformPaddleWidth = transformMeta
    ? transformMeta.startWidth +
      (transformMeta.endWidth - transformMeta.startWidth) * transformEased
    : 0;
  const transformPaddleHeight = transformMeta
    ? transformMeta.startHeight +
      (PADDLE_HEIGHT - transformMeta.startHeight) * transformEased
    : 0;
  const transformPaddleX = transformMeta
    ? transformMeta.startX +
      (transformMeta.endX - transformMeta.startX) * transformEased
    : 0;
  const transformPaddleY = transformMeta
    ? transformMeta.startY +
      (transformMeta.endY - transformMeta.startY) * transformEased
    : 0;
  const transformBallX = transformMeta
    ? transformMeta.ballStartX +
      (transformMeta.ballEndX - transformMeta.ballStartX) * transformEased
    : 0;
  const transformBallY = transformMeta
    ? transformMeta.ballStartY +
      (transformMeta.ballEndY - transformMeta.ballStartY) * transformEased
    : 0;

  return (
    <>
      <div
        className="pointer-events-none absolute z-30 rounded-md flex items-center justify-center bg-primary text-primary-foreground shadow-xs"
        style={{
          width: transformPaddleWidth,
          height: transformPaddleHeight,
          left: transformPaddleX,
          top: transformPaddleY,
        }}
      />

      <div
        className="pointer-events-none absolute"
        style={{
          width: BALL_SIZE,
          height: BALL_SIZE,
          left: transformBallX - BALL_SIZE / 2,
          top: transformBallY - BALL_SIZE / 2,
        }}
      >
        <div
          className="absolute inset-0 rounded-full bg-primary"
          style={{ opacity: ballOpacity }}
        />
      </div>
    </>
  );
}
