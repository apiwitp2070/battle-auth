export type Phase =
  | "form"
  | "loading"
  | "transform"
  | "battle"
  | "victory"
  | "defeat";

export type BattleState = {
  ball: { x: number; y: number };
  velocity: { x: number; y: number };
  paddleX: number;
  paddleWidth: number;
  arenaWidth: number;
  arenaHeight: number;
  enemy: {
    x: number;
    y: number;
    width: number;
    height: number;
    vx: number;
    vy: number;
    hp: number;
    maxHp: number;
    wobble: number;
  };
  hitCooldown: number;
};

export type TransformMeta = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startWidth: number;
  endWidth: number;
  startHeight: number;
  ballStartX: number;
  ballStartY: number;
  ballEndX: number;
  ballEndY: number;
};
