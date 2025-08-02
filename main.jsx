// main.jsx (veya main.js)
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

function App() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch("/accounts.json")
      .then((response) => response.json())
      .then((data) => {
        const parsed = data.map((account) => parseText(account.text));
        setAccounts(parsed);
      })
      .catch((error) => {
        console.error("Veriler alınamadı:", error);
      });
  }, []);

  function parseText(text) {
    const lines = text.split("\n").filter((line) => line.trim() !== "");

    return {
      sunucu: lines[0] || "",
      seviye: lines[1]?.replace("Level: ", "") || "",
      sku: lines[2]?.replace("SKU: ", "") || "",
      kostumler: lines[3] || "",
      ulke: lines[4]?.replace("Hesabın Oluşturulduğu Ülke: ", "") || "",
      oyunGecmisi: lines[5]?.replace("Karşılaşma Geçmişi: ", "") || "",
      sonOyun: lines[6]?.replace("Son Oyun Tarihi: ", "") || "",
      kristal: lines[7]?.replace("Hesaptaki Toplam Kostüm Kristali Sayısı: ", "") || "",
      fiyat: lines[11] || "",
    };
  }

  return (
    <div className="p-4 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">
        WOTNE Hesap Kataloğu
      </h1>
      {accounts.length > 0 ? (
        accounts.map((acc, index) => (
          <div
            key={index}
            className="bg-gray-900 p-4 mb-4 rounded-xl shadow-md"
          >
            <h2 className="text-xl font-bold mb-2">{index + 1}. Hesap</h2>
            <p><strong>Sunucu:</strong> {acc.sunucu}</p>
            <p><strong>Seviye:</strong> {acc.seviye}</p>
            <p><strong>SKU:</strong> {acc.sku}</p>
            <p><strong>Kostümler:</strong> {acc.kostumler}</p>
            <p><strong>Ülke:</strong> {acc.ulke}</p>
            <p><strong>Oyun Geçmişi:</strong> {acc.oyunGecmisi}</p>
            <p><strong>Son Oyun:</strong> {acc.sonOyun}</p>
            <p><strong>Kristal:</strong> {acc.kristal}</p>
            <p><strong>Fiyat:</strong> {acc.fiyat}</p>
          </div>
        ))
      ) : (
        <p className="text-center">Veriler alınamadı.</p>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
