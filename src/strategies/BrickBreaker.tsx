import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

type Phase = "form" | "loading" | "transform" | "battle" | "victory" | "defeat";

type BattleState = {
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
  combo: number;
};

type TransformMeta = {
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

const BALL_SIZE = 22;
const PADDLE_HEIGHT = 16;
const PADDLE_OFFSET = 80;
const ENEMY_PADDING = 24;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const ENEMY_HP = 3;

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [rememberMe, setRememberMe] = useState(false);
  const [battleState, setBattleState] = useState<BattleState | null>(null);

  const arenaRef = useRef<HTMLDivElement>(null);
  const enemyRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<Phase>(phase);
  const loginButtonWrapperRef = useRef<HTMLDivElement>(null);
  const transformFrameRef = useRef<number | null>(null);
  const transformTimeoutRef = useRef<number | null>(null);
  const [transformMeta, setTransformMeta] = useState<TransformMeta | null>(
    null
  );
  const [transformProgress, setTransformProgress] = useState(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    return () => {
      if (transformFrameRef.current !== null) {
        cancelAnimationFrame(transformFrameRef.current);
      }

      if (transformTimeoutRef.current !== null) {
        window.clearTimeout(transformTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== "battle") {
      setBattleState(null);
      return;
    }

    const init = () => {
      const arena = arenaRef.current;
      const enemy = enemyRef.current;

      if (!arena || !enemy) {
        requestAnimationFrame(init);
        return;
      }

      const arenaRect = arena.getBoundingClientRect();
      const enemyRect = enemy.getBoundingClientRect();
      const paddleWidth = Math.min(220, Math.max(160, arenaRect.width * 0.2));
      const paddleX = arenaRect.width / 2 - paddleWidth / 2;

      setBattleState({
        ball: {
          x: arenaRect.width / 2,
          y: arenaRect.height - PADDLE_OFFSET - PADDLE_HEIGHT - 32,
        },
        velocity: { x: 4.5, y: -5.4 },
        paddleX,
        paddleWidth,
        arenaWidth: arenaRect.width,
        arenaHeight: arenaRect.height,
        enemy: {
          x: Math.max(
            ENEMY_PADDING,
            Math.min(
              arenaRect.width - enemyRect.width - ENEMY_PADDING,
              arenaRect.width / 2 - enemyRect.width / 2
            )
          ),
          y: ENEMY_PADDING * 2,
          width: enemyRect.width,
          height: enemyRect.height,
          vx: 2.2 + Math.random() * 1.2,
          vy: 1.8 + Math.random() * 1.4,
          hp: ENEMY_HP,
          maxHp: ENEMY_HP,
          wobble: 0,
        },
        hitCooldown: 0,
        combo: 0,
      });
    };

    const frame = requestAnimationFrame(init);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  useEffect(() => {
    if (phase !== "battle") {
      return;
    }

    const handleKey = (event: KeyboardEvent) => {
      if (phaseRef.current !== "battle") {
        return;
      }

      if (
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowRight" &&
        event.key !== "a" &&
        event.key !== "d"
      ) {
        return;
      }

      event.preventDefault();
      const direction = event.key === "ArrowLeft" || event.key === "a" ? -1 : 1;

      setBattleState((prev) => {
        if (!prev || !arenaRef.current) {
          return prev;
        }

        const arenaWidth = arenaRef.current.clientWidth;
        const shift = prev.paddleWidth * 0.22;
        const nextX = Math.max(
          0,
          Math.min(
            arenaWidth - prev.paddleWidth,
            prev.paddleX + shift * direction
          )
        );

        return { ...prev, paddleX: nextX };
      });
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase]);

  useEffect(() => {
    if (phase !== "battle") {
      return;
    }

    let animation: number;

    const tick = () => {
      animation = requestAnimationFrame(tick);

      setBattleState((prev) => {
        if (!prev || !arenaRef.current) {
          return prev;
        }

        const bounds = arenaRef.current.getBoundingClientRect();
        const radius = BALL_SIZE / 2;
        const paddleTop = bounds.height - PADDLE_OFFSET;
        const arenaWidth = bounds.width;

        const nextBall = {
          x: prev.ball.x + prev.velocity.x,
          y: prev.ball.y + prev.velocity.y,
        };
        const nextVelocity = { ...prev.velocity };
        let nextEnemy = { ...prev.enemy };
        let nextCooldown = Math.max(0, prev.hitCooldown - 1);
        let nextCombo = Math.max(0, prev.combo - 0.01);

        if (nextBall.x <= radius) {
          nextBall.x = radius;
          nextVelocity.x = Math.abs(nextVelocity.x);
        } else if (nextBall.x >= bounds.width - radius) {
          nextBall.x = bounds.width - radius;
          nextVelocity.x = -Math.abs(nextVelocity.x);
        }

        if (nextBall.y <= radius) {
          nextBall.y = radius;
          nextVelocity.y = Math.abs(nextVelocity.y);
        }

        nextEnemy.x += nextEnemy.vx;
        nextEnemy.y += nextEnemy.vy;

        if (
          nextEnemy.x <= ENEMY_PADDING ||
          nextEnemy.x + nextEnemy.width >= bounds.width - ENEMY_PADDING
        ) {
          nextEnemy.vx *= -1;
          nextEnemy.x = Math.max(
            ENEMY_PADDING,
            Math.min(
              bounds.width - ENEMY_PADDING - nextEnemy.width,
              nextEnemy.x
            )
          );
        }

        if (
          nextEnemy.y <= ENEMY_PADDING * 1.2 ||
          nextEnemy.y + nextEnemy.height >= bounds.height * 0.6
        ) {
          nextEnemy.vy *= -1;
          nextEnemy.y = Math.max(
            ENEMY_PADDING * 1.2,
            Math.min(bounds.height * 0.6 - nextEnemy.height, nextEnemy.y)
          );
        }

        const clampedPaddleX = Math.max(
          0,
          Math.min(arenaWidth - prev.paddleWidth, prev.paddleX)
        );
        const paddleWithinX =
          nextBall.x + radius >= clampedPaddleX &&
          nextBall.x - radius <= clampedPaddleX + prev.paddleWidth;
        const hittingPaddle =
          prev.ball.y + radius <= paddleTop && nextBall.y + radius >= paddleTop;

        if (paddleWithinX && hittingPaddle) {
          nextBall.y = paddleTop - radius;
          const hitPoint =
            (nextBall.x - (clampedPaddleX + prev.paddleWidth / 2)) /
            (prev.paddleWidth / 2);
          nextVelocity.y = -Math.abs(nextVelocity.y);
          nextVelocity.x = hitPoint * 6;
          nextCombo = Math.min(4.5, prev.combo + 0.75);
        } else if (nextBall.y - radius > bounds.height) {
          setPhase("defeat");
          return prev;
        }

        const enemyLeft = nextEnemy.x;
        const enemyRight = nextEnemy.x + nextEnemy.width;
        const enemyTop = nextEnemy.y;
        const enemyBottom = nextEnemy.y + nextEnemy.height;

        const collides =
          nextBall.x + radius > enemyLeft &&
          nextBall.x - radius < enemyRight &&
          nextBall.y + radius > enemyTop &&
          nextBall.y - radius < enemyBottom;

        if (collides && nextCooldown === 0) {
          const overlapLeft = nextBall.x + radius - enemyLeft;
          const overlapRight = enemyRight - (nextBall.x - radius);
          const overlapTop = nextBall.y + radius - enemyTop;
          const overlapBottom = enemyBottom - (nextBall.y - radius);
          const minOverlap = Math.min(
            overlapLeft,
            overlapRight,
            overlapTop,
            overlapBottom
          );

          if (minOverlap === overlapLeft || minOverlap === overlapRight) {
            nextVelocity.x *= -1;
            nextBall.x += nextVelocity.x;
          } else {
            nextVelocity.y *= -1;
            nextBall.y += nextVelocity.y;
          }

          const updatedHp = nextEnemy.hp - 1;
          nextEnemy = {
            ...nextEnemy,
            hp: updatedHp,
            wobble: 1.2,
            vx: nextEnemy.vx * 1.05,
            vy: nextEnemy.vy * 1.07,
          };
          nextCooldown = 14;
          nextCombo = Math.min(6, prev.combo + 1.2);

          if (updatedHp <= 0) {
            setPhase("victory");
            return prev;
          }
        }

        if (nextEnemy.wobble > 0) {
          nextEnemy = { ...nextEnemy, wobble: nextEnemy.wobble * 0.85 };
        }

        return {
          ...prev,
          ball: nextBall,
          velocity: nextVelocity,
          enemy: nextEnemy,
          hitCooldown: nextCooldown,
          combo: nextCombo,
          arenaWidth,
          arenaHeight: bounds.height,
          paddleX: clampedPaddleX,
        };
      });
    };

    animation = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animation);
  }, [phase]);

  useEffect(() => {
    if (phase !== "transform") {
      if (transformFrameRef.current !== null) {
        cancelAnimationFrame(transformFrameRef.current);
        transformFrameRef.current = null;
      }
      setTransformMeta(null);
      setTransformProgress(0);
      return;
    }

    const arena = arenaRef.current;
    const buttonWrapper = loginButtonWrapperRef.current;

    if (!arena || !buttonWrapper) {
      setPhase("battle");
      return;
    }

    if (transformFrameRef.current !== null) {
      cancelAnimationFrame(transformFrameRef.current);
      transformFrameRef.current = null;
    }

    const arenaRect = arena.getBoundingClientRect();
    const buttonRect = buttonWrapper.getBoundingClientRect();
    const startX = buttonRect.left - arenaRect.left;
    const startY = buttonRect.top - arenaRect.top;
    const startWidth = buttonRect.width;
    const startHeight = buttonRect.height;
    const endWidth = Math.min(220, Math.max(160, arenaRect.width * 0.2));
    const endX = arenaRect.width / 2 - endWidth / 2;
    const endY = arenaRect.height - PADDLE_OFFSET;
    const ballEndX = arenaRect.width / 2;
    const ballEndY = arenaRect.height - PADDLE_OFFSET - PADDLE_HEIGHT - 32;

    setTransformMeta({
      startX,
      startY,
      endX,
      endY,
      startWidth,
      endWidth,
      startHeight,
      ballStartX: startX + startWidth / 2,
      ballStartY: startY + startHeight / 2,
      ballEndX,
      ballEndY,
    });

    setTransformProgress(0);
    const duration = 1100;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const raw = Math.min(1, elapsed / duration);
      setTransformProgress(raw);

      if (raw < 1 && phaseRef.current === "transform") {
        transformFrameRef.current = requestAnimationFrame(step);
      } else {
        transformFrameRef.current = null;
        if (phaseRef.current === "transform") {
          setPhase("battle");
        }
      }
    };

    transformFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (transformFrameRef.current !== null) {
        cancelAnimationFrame(transformFrameRef.current);
        transformFrameRef.current = null;
      }
    };
  }, [phase]);

  const loading = phase === "loading";
  const isTransform = phase === "transform";

  const handleLogin = () => {
    if (phase !== "form") {
      return;
    }
    setPhase("loading");
    if (transformTimeoutRef.current !== null) {
      window.clearTimeout(transformTimeoutRef.current);
    }
    transformTimeoutRef.current = window.setTimeout(() => {
      transformTimeoutRef.current = null;
      setPhase("transform");
    }, 900);
  };

  const handlePointerMove = (clientX: number) => {
    if (phase !== "battle" || !arenaRef.current) {
      return;
    }

    const bounds = arenaRef.current.getBoundingClientRect();
    const relative =
      clientX - bounds.left - (battleState?.paddleWidth ?? 0) / 2;

    setBattleState((prev) => {
      if (!prev) {
        return prev;
      }

      const clamped = Math.max(
        0,
        Math.min(bounds.width - prev.paddleWidth, relative)
      );
      return { ...prev, paddleX: clamped };
    });
  };

  const reset = () => {
    setPhase("form");
    setBattleState(null);
  };

  const hpPercent = battleState
    ? Math.max(0, (battleState.enemy.hp / battleState.enemy.maxHp) * 100)
    : 0;
  const isBattle = phase === "battle";
  const showPrimaryCard =
    phase === "form" || phase === "loading" || isTransform || isBattle;
  const cardDisabled = isBattle || loading || isTransform;
  const transformEased = transformMeta ? easeInOutCubic(transformProgress) : 0;
  const transformLinear = transformMeta ? transformProgress : 0;
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
  const transformPaddleRadius = transformMeta
    ? transformMeta.startHeight / 2 +
      (PADDLE_HEIGHT / 2 - transformMeta.startHeight / 2) * transformEased
    : 0;
  const transformBallX = transformMeta
    ? transformMeta.ballStartX +
      (transformMeta.ballEndX - transformMeta.ballStartX) * transformEased
    : 0;
  const transformBallY = transformMeta
    ? transformMeta.ballStartY +
      (transformMeta.ballEndY - transformMeta.ballStartY) * transformEased
    : 0;
  const spinnerOpacity = transformMeta
    ? Math.max(0, 1 - transformLinear * 1.5)
    : 0;
  const ballOpacity = transformMeta
    ? Math.min(1, Math.max(0, (transformLinear - 0.25) / 0.75))
    : 0;
  const labelOpacity = transformMeta
    ? Math.max(0, 1 - transformLinear * 1.2)
    : 0;

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.22),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.25),transparent_55%)] mix-blend-screen" />
      </div>

      <div
        ref={arenaRef}
        className="relative z-10 flex h-full w-full max-w-5xl flex-1 items-center justify-center px-4"
        onMouseMove={(event) => handlePointerMove(event.clientX)}
        onTouchMove={(event) =>
          handlePointerMove(event.touches[0]?.clientX ?? 0)
        }
      >
        {showPrimaryCard && (
          <div
            ref={enemyRef}
            className={`${
              battleState
                ? "pointer-events-none absolute left-0 top-0"
                : "relative"
            } z-20 transition-transform`}
            style={{
              width: "min(90vw, 28rem)",
              transform:
                isBattle && battleState
                  ? `translate3d(${battleState.enemy.x}px, ${
                      battleState.enemy.y
                    }px, 0) rotate(${battleState.enemy.wobble * 8}deg)`
                  : undefined,
              transition: isBattle ? "transform 80ms ease-out" : undefined,
            }}
          >
            <Card
              className={`w-full max-w-md backdrop-blur ${
                isBattle || isTransform ? "select-none" : ""
              } ${isTransform ? "pointer-events-none" : ""}`}
            >
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Enter your email below to login to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      onChange={(event) => setEmail(event.target.value)}
                      value={email}
                      disabled={cardDisabled}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline"
                      >
                        Forgot your password?
                      </a>
                    </div>

                    <Input
                      id="password"
                      type="password"
                      placeholder="password"
                      autoComplete="password"
                      value={password}
                      disabled={cardDisabled}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(value) => setRememberMe(Boolean(value))}
                      disabled={cardDisabled}
                    />
                    <Label htmlFor="remember">Remember me</Label>
                  </div>

                  {!isBattle && (
                    <div ref={loginButtonWrapperRef} className="relative">
                      <Button
                        type="button"
                        className={`w-full ${
                          isTransform ? "invisible pointer-events-none" : ""
                        }`}
                        disabled={cardDisabled}
                        onClick={handleLogin}
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
              </CardContent>
            </Card>
          </div>
        )}

        {isTransform && transformMeta && (
          <>
            <div
              className="pointer-events-none absolute flex items-center justify-center"
              style={{
                width: transformPaddleWidth,
                height: transformPaddleHeight,
                left: transformPaddleX,
                top: transformPaddleY,
                borderRadius: transformPaddleRadius,
                background: `linear-gradient(135deg, rgba(14,165,233,${
                  0.35 + transformEased * 0.4
                }) 5%, rgba(6,182,212,${
                  0.55 + transformEased * 0.35
                }) 55%, rgba(125,211,252,${0.45 + transformEased * 0.4}) 100%)`,
                boxShadow: `0 0 ${12 + transformEased * 18}px rgba(6,182,212,${
                  0.3 + transformEased * 0.45
                })`,
              }}
            >
              <span
                className="text-[11px] uppercase tracking-[0.35em] text-slate-900"
                style={{ opacity: labelOpacity }}
              >
                Login
              </span>
            </div>

            <div
              className="pointer-events-none absolute"
              style={{
                width: BALL_SIZE,
                height: BALL_SIZE,
                left: transformBallX - BALL_SIZE / 2,
                top: transformBallY - BALL_SIZE / 2,
                transform: `scale(${1 + transformEased * 0.45})`,
                filter: `drop-shadow(0 0 ${
                  10 + transformEased * 18
                }px rgba(6,182,212,0.5))`,
              }}
            >
              <div
                className="absolute inset-0 rounded-full border-2 border-cyan-200/80 border-t-transparent animate-spin"
                style={{ opacity: spinnerOpacity, animationDuration: "0.7s" }}
              />
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-200 via-cyan-400 to-cyan-500"
                style={{ opacity: ballOpacity }}
              />
            </div>
          </>
        )}

        {isBattle && battleState && (
          <>
            <div
              className="absolute top-6 left-6 flex w-44 flex-col gap-2 rounded-xl border border-cyan-500/40 bg-slate-900/70 p-3 text-xs"
              style={{ backdropFilter: "blur(10px)" }}
            >
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-cyan-200/60">
                <span>BattleAuth</span>
                <span>HP</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-cyan-500/20">
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
              <div className="text-cyan-100/80">
                Combo energy:{" "}
                <span className="font-semibold text-cyan-200">
                  {battleState.combo.toFixed(1)}
                </span>
              </div>
            </div>

            <Button
              type="button"
              className="pointer-events-none absolute flex h-6 items-center justify-center rounded-full bg-cyan-400/90 px-6 text-xs font-semibold uppercase tracking-[0.4em] text-slate-900 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              style={{
                width: battleState.paddleWidth,
                left: battleState.paddleX,
                top: battleState.arenaHeight - PADDLE_OFFSET,
                filter: `drop-shadow(0 0 12px rgba(6,182,212,${
                  0.25 + battleState.combo / 12
                }))`,
              }}
            >
              Login
            </Button>

            <div
              className="absolute"
              style={{
                width: BALL_SIZE,
                height: BALL_SIZE,
                left: battleState.ball.x - BALL_SIZE / 2,
                top: battleState.ball.y - BALL_SIZE / 2,
                transform: `scale(${1 + battleState.combo / 12})`,
                filter: `drop-shadow(0 0 ${
                  12 + battleState.combo * 4
                }px rgba(6,182,212,0.5))`,
              }}
            >
              <div className="h-full w-full animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-br from-cyan-200 via-cyan-400 to-cyan-500" />
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.4em] text-cyan-200/70">
              drag or arrow keys
            </div>
          </>
        )}

        {phase === "victory" && (
          <Card className="w-full max-w-md border-green-400/40 bg-emerald-900/70 text-emerald-100 shadow-xl shadow-emerald-600/20">
            <CardHeader>
              <CardTitle className="text-xl font-semibold uppercase tracking-[0.3em] text-emerald-200">
                Access Granted
              </CardTitle>
              <CardDescription className="text-sm text-emerald-100/80">
                You successfully defeated the rogue authentication boss.
                Credentials synced.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-emerald-100/90">
                BattleAuth is satisfied—for now. Would you like to try that
                chaos again?
              </p>
              <Button
                type="button"
                className="w-full bg-emerald-500 text-emerald-950"
                onClick={reset}
              >
                Re-enter The Arena
              </Button>
            </CardContent>
          </Card>
        )}

        {phase === "defeat" && (
          <Card className="w-full max-w-md border-rose-400/40 bg-rose-900/70 text-rose-100 shadow-xl shadow-rose-600/20">
            <CardHeader>
              <CardTitle className="text-xl font-semibold uppercase tracking-[0.3em] text-rose-200">
                Access Denied
              </CardTitle>
              <CardDescription className="text-sm text-rose-100/80">
                The spinner slipped through your defenses. Restore integrity and
                attempt the login again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                className="w-full bg-rose-400 text-rose-950 hover:bg-rose-300"
                onClick={reset}
              >
                Reset The Form
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
