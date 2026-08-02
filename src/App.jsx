import { useEffect, useRef, useState } from "react";
import "./App.css";
import ottan from "./assets/ottan.png";
import mustard from "./assets/mustard.png";

export default function App() {
  // Phase一覧: "title" | "prep_wait" | "prep" | "mix_wait" | "mix" | "predict" | "pull" | "result"
  const [phase, setPhase] = useState("title");

  const [mixPower, setMixPower] = useState(0);
  const mixPowerRef = useRef(0);
  const [prediction, setPrediction] = useState(100);
  const [actualLength, setActualLength] = useState(null);
  const [dragLength, setDragLength] = useState(0);
  const [result, setResult] = useState(null);

  // カウントダウン用タイマー
  const [timeLeft, setTimeLeft] = useState(5);

  const centerRef = useRef(null);
  const lastAngleRef = useRef(null);
  const draggingRef = useRef(false);
  const accumulatedAngleRef = useRef(0);

  const [karashi, setKarashi] = useState(false);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [frame, setFrame] = useState(0);

  // 演出用 State
  const [toppingQueue, setToppingQueue] = useState([]);
  const [currentToppingIndex, setCurrentToppingIndex] = useState(0);
  const [prepFrame, setPrepFrame] = useState(0);

  // トッピング素材設定（画像そのものに納豆が含まれている前提）
  const toppingAssets = {
    karashi: { name: "からし", image: mustard, totalFrames: 12 },
    kimchi: { name: "キムチ", image: null, totalFrames: 12 },
    negi: { name: "ねぎ", image: null, totalFrames: 12 },
    rayu: { name: "ラー油", image: null, totalFrames: 12 },
    shiso: { name: "青紫蘇ドレッシング", image: null, totalFrames: 12 },
    egg: { name: "生卵", image: null, totalFrames: 12 },
  };

  const toppings = {
    kimchi: { name: "キムチ", effect: (v) => v + 30 },
    negi: { name: "ねぎ", effect: (v) => v + 15 },
    rayu: { name: "ラー油", effect: (v) => v + (Math.random() * 60 - 30) },
    shiso: { name: "青紫蘇ドレッシング", effect: (v) => v * 1.3 },
    egg: { name: "生卵", effect: (v) => v * 1.5 },
  };

  // ★ ゲームスタートボタン押下
  const startGame = () => {
    const queue = [];
    if (karashi) queue.push("karashi");
    selectedToppings.forEach((id) => queue.push(id));

    setToppingQueue(queue);
    setCurrentToppingIndex(0);
    setPrepFrame(0);

    if (queue.length > 0) {
      // 薬味がある場合: 5秒待ちフェーズへ
      setTimeLeft(5);
      setPhase("prep_wait");
    } else {
      // 薬味がない場合: 混ぜる前の5秒待ちフェーズへ
      setTimeLeft(5);
      setPhase("mix_wait");
    }
  };

  // ★ 1. 演出前の5秒カウントダウンタイマー
  useEffect(() => {
    if (phase !== "prep_wait") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase("prep"); // 演出フェーズへ移行
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // ★ 2. 演出フェーズ（コマ送りアニメーション）
  useEffect(() => {
    if (phase !== "prep") return;

    const currentId = toppingQueue[currentToppingIndex];
    const currentAsset = toppingAssets[currentId];
    const FRAME_RATE = 500; // コマ送りの速度（ミリ秒）

    const interval = setInterval(() => {
      setPrepFrame((prev) => {
        const totalFrames = currentAsset?.totalFrames || 12;

        if (prev + 1 >= totalFrames) {
          // 次の薬味があれば切り替え、なければ「混ぜる前の5秒待ち」へ
          if (currentToppingIndex + 1 < toppingQueue.length) {
            setCurrentToppingIndex((idx) => idx + 1);
            return 0;
          } else {
            clearInterval(interval);
            setTimeLeft(5);
            setPhase("mix_wait"); // 混ぜる前の5秒待ちへ移行
            return prev;
          }
        }
        return prev + 1;
      });
    }, FRAME_RATE);

    return () => clearInterval(interval);
  }, [phase, currentToppingIndex, toppingQueue]);

  // ★ 3. 混ぜる前の5秒カウントダウンタイマー
  useEffect(() => {
    if (phase !== "mix_wait") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeLeft(10); // 混ぜ制限時間の10秒をセット
          setPhase("mix"); // 混ぜフェーズ開始！
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // ★ 4. 混ぜフェーズの10秒タイマー
  useEffect(() => {
    if (phase !== "mix") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          let length = Math.sqrt(mixPowerRef.current) * 12 + Math.random() * 30;
          if (karashi) length *= 0.9;
          selectedToppings.forEach((id) => {
            length = toppings[id].effect(length);
          });
          length = Math.max(20, Math.round(length));

          setActualLength(length);
          setPhase("predict");
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, karashi, selectedToppings]);

  // マウス回転（混ぜ処理）
  const handleMouseMove = (e) => {
    if (phase !== "mix" || !centerRef.current) return;

    const rect = centerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const angle = Math.atan2(dy, dx);

    if (lastAngleRef.current !== null) {
      let diff = angle - lastAngleRef.current;
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;

      const absDiff = Math.abs(diff);

      mixPowerRef.current += absDiff * 10;
      setMixPower(Math.round(mixPowerRef.current));

      accumulatedAngleRef.current += absDiff;

      const STEP_ANGLE = 0.3;
      if (accumulatedAngleRef.current >= STEP_ANGLE) {
        const stepCount = Math.floor(accumulatedAngleRef.current / STEP_ANGLE);
        setFrame((prev) => (prev + stepCount) % 7);
        accumulatedAngleRef.current %= STEP_ANGLE;
      }
    }

    lastAngleRef.current = angle;
  };

  const startPull = () => setPhase("pull");
  const handleDragStart = () => { draggingRef.current = true; };
  const handleDragEnd = () => { draggingRef.current = false; };

  const handleDragMove = () => {
    if (!draggingRef.current || phase !== "pull") return;

    setDragLength((prev) => {
      const next = prev + 3;
      if (next >= actualLength) {
        const diff = Math.abs(prediction - actualLength);
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
    accumulatedAngleRef.current = 0;
    setKarashi(false);
    setSelectedToppings([]);
    setFrame(0);
    setToppingQueue([]);
    setCurrentToppingIndex(0);
    setPrepFrame(0);
  };

  const currentToppingId = toppingQueue[currentToppingIndex];
  const currentAsset = toppingAssets[currentToppingId];

  return (
    <div className="container" onMouseMove={handleMouseMove}>
      <h1>🫘 OTTAN 🫘</h1>

      {/* 1. タイトル画面 */}
      {phase === "title" && (
        <>
          <h2>納豆糸長さ予測ゲーム</h2>
          <h3>調味料</h3>
          <label>
            <input
              type="checkbox"
              checked={karashi}
              onChange={(e) => setKarashi(e.target.checked)}
            />
            からし
          </label>

          <h3>課金薬味</h3>
          {Object.entries(toppings).map(([id, item]) => (
            <label key={id} style={{ display: "block" }}>
              <input
                type="checkbox"
                checked={selectedToppings.includes(id)}
                onChange={() => {
                  setSelectedToppings((prev) =>
                    prev.includes(id)
                      ? prev.filter((x) => x !== id)
                      : [...prev, id]
                  );
                }}
              />
              {item.name}
            </label>
          ))}

          <button onClick={startGame} style={{ marginTop: "20px" }}>
            スタート
          </button>
        </>
      )}

      {/* 2. 演出前の5秒待ち */}
      {phase === "prep_wait" && (
        <>
          <h2>トッピング準備中...</h2>
          <h3>まもなくトッピングを入れるよ！</h3>
          <h1>{timeLeft}</h1>
          <div
            className="natto"
            style={{
              backgroundImage: `url(${ottan})`,
              backgroundPosition: "0px 0px",
            }}
          />
        </>
      )}

      {/* 3. トッピング演出フェーズ（単体画像を表示） */}
      {phase === "prep" && (
        <>
          <h2>トッピング投入中！</h2>
          <h3>{currentAsset?.name}</h3>
          <div
            className="natto"
            style={{
              backgroundImage: `url(${currentAsset?.image || ottan})`,
              backgroundPosition: `${-prepFrame * 320}px 0px`,
            }}
          />
        </>
      )}

      {/* 4. 混ぜる直前の5秒待ち */}
      {phase === "mix_wait" && (
        <>
          <h2>準備はいい？</h2>
          <h3>まもなく混ぜるフェーズが始まるよ！</h3>
          <h1>{timeLeft}</h1>
          <div
            className="natto"
            style={{
              backgroundImage: `url(${ottan})`,
              backgroundPosition: "0px 0px",
            }}
          />
        </>
      )}

      {/* 5. 混ぜるフェーズ */}
      {phase === "mix" && (
        <>
          <h2>納豆を混ぜろ！！</h2>
          <h3>残り {timeLeft} 秒</h3>
          <h3>混ぜパワー {mixPower}</h3>

          <div
            ref={centerRef}
            className="natto"
            style={{
              backgroundImage: `url(${ottan})`,
              backgroundPosition: `${-frame * 320}px 0`,
            }}
          />

          <p>マウスをぐるぐる回せ！</p>
        </>
      )}

      {/* 6. 予測フェーズ */}
      {phase === "predict" && (
        <>
          <h2>何cmで切れる？</h2>
          <input
            type="range"
            min="0"
            max="500"
            value={prediction}
            onChange={(e) => setPrediction(Number(e.target.value))}
          />
          <h2>{prediction}cm</h2>
          <button onClick={startPull}>糸を引く</button>
        </>
      )}

      {/* 7. 糸引きフェーズ */}
      {phase === "pull" && (
        <>
          <h2>上にドラッグして糸を引く！</h2>
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
              style={{ height: dragLength + "px" }}
            />
            <div className="bean">🫘</div>
          </div>
          <p>{Math.round(dragLength)}cm</p>
        </>
      )}

      {/* 8. 結果発表 */}
      {phase === "result" && (
        <>
          <h1>ブチッ！</h1>
          <h2>予想 {result.predicted}cm</h2>
          <h2>実際 {result.actual}cm</h2>
          <h2>誤差 {result.diff}cm</h2>
          <p>からし: {karashi ? "あり" : "なし"}</p>
          <p>
            薬味:{" "}
            {selectedToppings.length
              ? selectedToppings.map((id) => toppings[id].name).join(", ")
              : "なし"}
          </p>
          <h1>ランク {result.rank}</h1>
          <button onClick={restart}>もう一回</button>
        </>
      )}
    </div>
  );
}