export const BALL_SIZE = 20;
export const PADDLE_HEIGHT = 24;
export const PADDLE_OFFSET = 80;
export const ENEMY_PADDING = 24;
export const ENEMY_HP = 10;

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
