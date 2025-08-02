import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import Wotne from "./Wotne";
import "./index.css";

function App() {
  useEffect(() => {
    const count = 220;
    const minDistance = 60; // piksel cinsinden minimum mesafe
    const positions = [];

    for (let i = 0; i < count; i++) {
      let x, y;
      let tooClose;

      // Uygun konum bulana kadar tekrar dene
      do {
        x = Math.random() * window.innerWidth;
        y = Math.random() * window.innerHeight;

        tooClose = positions.some(
          (pos) =>
            Math.hypot(pos.x - x, pos.y - y) < minDistance
        );
      } while (tooClose);

      positions.push({ x, y });

      const img = document.createElement("div");
      img.className = "donut";

      img.style.position = "fixed";
      img.style.top = `${y}px`;
      img.style.left = `${x}px`;

      const rotation = Math.floor(Math.random() * 360);
      img.style.transform = `rotate(${rotation}deg)`;
      if (Math.random() > 0.5) {
        img.style.transform += " scaleX(-1)";
      }

      document.body.appendChild(img);
    }
  }, []);

  return (
    <React.StrictMode>
      <Wotne />
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
