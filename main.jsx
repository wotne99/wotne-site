import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import Wotne from "./Wotne";
import "./index.css";

function App() {
  useEffect(() => {
    const count = 220;
    const minDistance = 60;
    const positions = [];

    for (let i = 0; i < count; i++) {
      let x, y, tooClose;

      // Uygun konum bulana kadar dene
      do {
        x = Math.random() * window.innerWidth;
        y = Math.random() * window.innerHeight;

        tooClose = positions.some(
          (pos) => Math.hypot(pos.x - x, pos.y - y) < minDistance
        );
      } while (tooClose);

      positions.push({ x, y });

      const size = Math.floor(Math.random() * (80 - 30 + 1)) + 30;

      const donut = document.createElement("div");
      donut.className = "donut";
      donut.style.position = "fixed";
      donut.style.width = `${size}px`;
      donut.style.height = `${size}px`;
      donut.style.top = `${y}px`;
      donut.style.left = `${x}px`;

      let transform = `rotate(${Math.floor(Math.random() * 360)}deg)`;
      if (Math.random() > 0.5) {
        transform += " scaleX(-1)";
      }
      donut.style.transform = transform;

      document.body.appendChild(donut);
    }
  }, []);

  return (
    <React.StrictMode>
      <Wotne />
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
