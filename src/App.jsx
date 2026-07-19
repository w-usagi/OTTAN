import { useEffect, useRef, useState } from "react";
import "./App.css";

export default function App() {
  const [phase, setPhase] = useState("title");

  const [mixPower, setMixPower] = useState(0);

  const mixPowerRef = useRef(0);

  const [prediction, setPrediction] = useState(100);

  const [actualLength, setActualLength] = useState(null);

  const [dragLength, setDragLength] = useState(0);

  const [result, setResult] = useState(null);

  const [timeLeft, setTimeLeft] = useState(5);

  const centerRef = useRef(null);

  const lastAngleRef = useRef(null);

  const draggingRef = useRef(false);

  const startGame = () => {
    setPhase("mix");
    setTimeLeft(5);
  };

  useEffect(() => {
    if (phase !== "mix") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const length = Math.max(
            20,
            Math.round(
              Math.sqrt(mixPowerRef.current) * 12 +
              Math.random() * 30
            )
          );

          setActualLength(length);
          setPhase("predict");

          clearInterval(interval);

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  const handleMouseMove = (e) => {
    if (phase !== "mix") return;

    const rect =
      centerRef.current.getBoundingClientRect();

    const centerX =
      rect.left + rect.width / 2;

    const centerY =
      rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    const angle = Math.atan2(dy, dx);

    if (lastAngleRef.current !== null) {
      let diff =
        angle - lastAngleRef.current;

      if (diff > Math.PI)
        diff -= Math.PI * 2;

      if (diff < -Math.PI)
        diff += Math.PI * 2;

      mixPowerRef.current +=
        Math.abs(diff) * 10;

      setMixPower(
        Math.round(mixPowerRef.current)
      );
    }

    lastAngleRef.current = angle;
  };

  const startPull = () => {
    setPhase("pull");
  };

  const handleDragStart = () => {
    draggingRef.current = true;
  };

  const handleDragEnd = () => {
    draggingRef.current = false;
  };

  const handleDragMove = () => {
    if (!draggingRef.current) return;

    if (phase !== "pull") return;

    setDragLength((prev) => {
      const next = prev + 3;

      if (next >= actualLength) {
        const diff = Math.abs(
          prediction - actualLength
        );

        let rank = "D";

        if (diff <= 5) rank = "S";
        else if (diff <= 10) rank = "A";
        else if (diff <= 20) rank = "B";
        else if (diff <= 40) rank = "C";

        setResult({
          predicted: prediction,
          actual: actualLength,
          diff,
          rank,
        });

        setPhase("result");
      }

      return next;
    });
  };

  const restart = () => {
    setPhase("title");

    setMixPower(0);
    mixPowerRef.current = 0;

    setPrediction(100);

    setActualLength(null);

    setDragLength(0);

    setResult(null);

    setTimeLeft(5);

    lastAngleRef.current = null;
  };

  return (
    <div
      className="container"
      onMouseMove={handleMouseMove}
    >
      <h1>🫘 OTTAN 🫘</h1>

      {phase === "title" && (
        <>
          <h2>
            納豆糸長さ予測ゲーム
          </h2>

          <button onClick={startGame}>
            スタート
          </button>
        </>
      )}

      {phase === "mix" && (
        <>
          <h2>
            納豆を混ぜろ！！
          </h2>

          <h3>
            残り {timeLeft} 秒
          </h3>

          <h3>
            混ぜパワー
            {mixPower}
          </h3>

          <div
            ref={centerRef}
            className="natto"
          >
            🫘
          </div>

          <p>
            マウスをぐるぐる回せ！
          </p>
        </>
      )}

      {phase === "predict" && (
        <>
          <h2>
            何cmで切れる？
          </h2>

          <input
            type="range"
            min="0"
            max="500"
            value={prediction}
            onChange={(e) =>
              setPrediction(
                Number(e.target.value)
              )
            }
          />

          <h2>
            {prediction}cm
          </h2>

          <button
            onClick={startPull}
          >
            糸を引く
          </button>
        </>
      )}

      {phase === "pull" && (
        <>
          <h2>
            上にドラッグして糸を引く！
          </h2>

          <div className="pullVertical">
            <div
              className="chopstick"
              onMouseDown={handleDragStart}
              onMouseUp={handleDragEnd}
              onMouseMove={handleDragMove}
            >
              🥢
            </div>

            <div
              className="stringVertical"
              style={{
                height: dragLength + "px",
              }}
            />

            <div className="bean">
              🫘
            </div>
          </div>

          <p>
            {Math.round(
              dragLength
            )}
            cm
          </p>
        </>
      )}

      {phase === "result" && (
        <>
          <h1>ブチッ！</h1>

          <h2>
            予想
            {
              result.predicted
            }
            cm
          </h2>

          <h2>
            実際
            {
              result.actual
            }
            cm
          </h2>

          <h2>
            誤差
            {result.diff}
            cm
          </h2>

          <h1>
            ランク
            {result.rank}
          </h1>

          <button
            onClick={restart}
          >
            もう一回
          </button>
        </>
      )}
    </div>
  );
}