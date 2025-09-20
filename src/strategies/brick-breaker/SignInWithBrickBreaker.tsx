import { useEffect, useRef, useState } from "react";
import {
  BALL_SIZE,
  ENEMY_HP,
  ENEMY_PADDING,
  PADDLE_HEIGHT,
  PADDLE_OFFSET,
  easeInOutCubic,
} from "@/strategies/brick-breaker/constants";
import type {
  BattleState,
  Phase,
  TransformMeta,
} from "@/strategies/brick-breaker/types";
import SignInBox from "@/strategies/brick-breaker/components/SignInBox";
import BattleBall from "@/strategies/brick-breaker/components/BattleBall";
import BattleHud from "@/strategies/brick-breaker/components/BattleHud";
import BattlePaddle from "@/strategies/brick-breaker/components/BattlePaddle";
import TransformOverlay from "@/strategies/brick-breaker/components/TransformOverlay";
import CardResultSuccess from "@/strategies/brick-breaker/components/CardResultSuccess";
import CardResultFailed from "@/strategies/brick-breaker/components/CardResultFailed";
import { cn } from "@/lib/utils";

export default function SignInWithBrickBreaker() {
  const [phase, setPhase] = useState<Phase>("form");
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [transformMeta, setTransformMeta] = useState<TransformMeta | null>(
    null
  );
  const [transformProgress, setTransformProgress] = useState(0);

  const arenaRef = useRef<HTMLDivElement>(null);
  const enemyRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<Phase>(phase);
  const loginButtonWrapperRef = useRef<HTMLDivElement>(null);
  const transformFrameRef = useRef<number | null>(null);
  const transformTimeoutRef = useRef<number | null>(null);

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
          y: arenaRect.height - PADDLE_OFFSET - PADDLE_HEIGHT,
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
    const ballEndY = arenaRect.height - PADDLE_OFFSET - PADDLE_HEIGHT;

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
  const transformEased = transformMeta ? easeInOutCubic(transformProgress) : 0;
  const transformLinear = transformMeta ? transformProgress : 0;

  const ballOpacity = transformMeta
    ? Math.min(1, Math.max(0, (transformLinear - 0.25) / 0.75))
    : 0;

  return (
    <div className="relative flex flex-col h-[100dvh] w-screen items-center justify-center overflow-hidden bg-background">
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
            className={cn(
              "z-20 relative transition-transform",
              battleState && "pointer-events-none absolute left-0 top-0"
            )}
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
            <SignInBox
              ref={loginButtonWrapperRef}
              loading={loading}
              isBattle={isBattle}
              isTransform={isTransform}
              onLogin={handleLogin}
            />
          </div>
        )}

        {isTransform && transformMeta && (
          <TransformOverlay
            transformMeta={transformMeta}
            transformEased={transformEased}
            ballOpacity={ballOpacity}
          />
        )}

        {isBattle && battleState && (
          <>
            <BattleHud hpPercent={hpPercent} />

            <BattlePaddle
              width={battleState.paddleWidth}
              left={battleState.paddleX}
              top={battleState.arenaHeight - PADDLE_OFFSET}
            />

            <BattleBall x={battleState.ball.x} y={battleState.ball.y} />
          </>
        )}

        {phase === "victory" && <CardResultSuccess onReset={reset} />}

        {phase === "defeat" && <CardResultFailed onReset={reset} />}
      </div>
    </div>
  );
}
