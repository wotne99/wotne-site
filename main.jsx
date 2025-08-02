import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import Wotne from "./Wotne";
import "./index.css";

function App() {
  useEffect(() => {
    // 60 adet donut oluştur
    const count = 120;
    for (let i = 0; i < count; i++) {
      const img = document.createElement("div");
      img.className = "donut";

      // Ekrana rastgele konum
      img.style.top = `${Math.random() * 100}vh`;
      img.style.left = `${Math.random() * 100}vw`;

      // Rastgele dönüş açısı
      const rotation = Math.floor(Math.random() * 360);
      img.style.transform = `rotate(${rotation}deg)`;

      // Bazen yatay çevir (ayna efekti)
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
