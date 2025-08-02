import React, { useEffect, useState } from 'react';
import './index.css';

const Wotne = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch('/accounts.json')
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map((item) => {
          const lines = item.text.split('\n').map(line => line.trim()).filter(Boolean);

          const getLine = (label) => {
            const line = lines.find(l => l.startsWith(label));
            return line ? line.replace(label, '').trim() : 'undefined';
          };

          return {
            id: item.id,
            server: lines[0] || 'undefined',
            level: getLine('Level:'),
            sku: getLine('SKU:'),
            skins: lines[3] || 'undefined',
            country: getLine('Hesabın Oluşturulduğu Ülke:'),
            matchHistory: getLine('Karşılaşma Geçmişi:'),
            lastGame: getLine('Son Oyun Tarihi:'),
            crystals: getLine('Hesaptaki Toplam Kostüm Kristali Sayısı:'),
            price: lines.find(line => line.startsWith('₺')) || 'undefined'
          };
        });

        setAccounts(parsed);
      })
      .catch((error) => {
        console.error('Veri alınamadı:', error);
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
