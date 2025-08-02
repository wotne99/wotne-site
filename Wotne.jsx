import React, { useEffect, useState } from "react";
import "./index.css";

const Wotne = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch("/accounts.json")
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map((item) => {
          const lines = item.text.split("\n").map((line) => line.trim()).filter(Boolean);

          return {
            id: item.id,
            server: lines[0] || "undefined",
            level: lines[1]?.replace("Level: ", "") || "undefined",
            sku: lines[2]?.replace("SKU: ", "") || "undefined",
            skins: lines[3] || "undefined",
            country: lines.find((l) => l.startsWith("Hesabın Oluşturulduğu Ülke:"))?.split(": ")[1] || "undefined",
            matchHistory: lines.find((l) => l.startsWith("Karşılaşma Geçmişi:"))?.split(": ")[1] || "undefined",
            lastGame: lines.find((l) => l.startsWith("Son Oyun Tarihi:"))?.split(": ")[1] || "undefined",
            crystals: lines.find((l) => l.includes("Kristali Sayısı:"))?.match(/\d+/)?.[0] || "undefined",
            price: lines.find((l) => l.includes("₺")) || "undefined",
          };
        });

        setAccounts(parsed);
      })
      .catch((error) => {
        console.error("Veri alınamadı:", error);
      });
  }, []);

  return (
    <div className="container">
      <h1>WOTNE Hesap Kataloğu</h1>
      {accounts.length > 0 ? (
        accounts.map((account, index) => (
          <div className="card" key={index}>
            <h2>{index + 1}. Hesap</h2>
            <p><strong>Sunucu:</strong> {account.server}</p>
            <p><strong>Seviye:</strong> {account.level}</p>
            <p><strong>SKU:</strong> {account.sku}</p>
            <p><strong>Kostümler:</strong> {account.skins}</p>
            <p><strong>Ülke:</strong> {account.country}</p>
            <p><strong>Oyun Geçmişi:</strong> {account.matchHistory}</p>
            <p><strong>Son Oyun:</strong> {account.lastGame}</p>
            <p><strong>Kristal:</strong> {account.crystals}</p>
            <p><strong>Fiyat:</strong> {account.price}</p>
            <hr />
          </div>
        ))
      ) : (
        <p>Veriler alınamadı.</p>
      )}
    </div>
  );
};

export default Wotne;
