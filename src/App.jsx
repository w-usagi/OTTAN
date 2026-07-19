import { useState } from "react";
import {
  generateStringLength,
  toppings,
} from "./game";

import "./App.css";

function App() {
  const [mixCount, setMixCount] = useState(100);
  const [karashi, setKarashi] = useState(false);

  const [selectedToppings, setSelectedToppings] =
    useState([]);

  const [actualLength, setActualLength] =
    useState(null);

  const [prediction, setPrediction] =
    useState("");

  const [score, setScore] = useState(0);

  const mixNatto = () => {
    const result =
      generateStringLength(
        mixCount,
        karashi,
        selectedToppings
      );

    setActualLength(result);
  };

  const submitPrediction = () => {
    const diff = Math.abs(
      Number(prediction) - actualLength
    );

    const earned = Math.max(
      0,
      100 - diff
    );

    setScore((s) => s + earned);

    alert(
      `実際:${actualLength}cm\n誤差:${diff}cm\n+${earned}pt`
    );

    setActualLength(null);
    setPrediction("");
  };

  const toggleTopping = (id) => {
    setSelectedToppings((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="container">
      <h1>🫘 OTTAN 🫘</h1>

      <h2>
        納豆糸長さ予測シミュレーター
      </h2>

      <p>スコア: {score}</p>

      <div>
        <label>
          混ぜ回数
        </label>

        <input
          type="number"
          value={mixCount}
          onChange={(e) =>
            setMixCount(
              Number(e.target.value)
            )
          }
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={karashi}
            onChange={(e) =>
              setKarashi(
                e.target.checked
              )
            }
          />
          からし
        </label>
      </div>

      <h3>
        課金薬味ショップ
      </h3>

      {Object.entries(toppings).map(
        ([id, item]) => (
          <label
            key={id}
            className="topping"
          >
            <input
              type="checkbox"
              checked={selectedToppings.includes(
                id
              )}
              onChange={() =>
                toggleTopping(id)
              }
            />

            {item.name}
            （¥{item.price}）
          </label>
        )
      )}

      <br />

      <button onClick={mixNatto}>
        混ぜる
      </button>

      {actualLength && (
        <div className="prediction">
          <h2>
            糸は何cmで切れる？
          </h2>

          <input
            type="number"
            value={prediction}
            onChange={(e) =>
              setPrediction(
                e.target.value
              )
            }
          />

          <button
            onClick={submitPrediction}
          >
            回答
          </button>
        </div>
      )}
    </div>
  );
}

export default App;