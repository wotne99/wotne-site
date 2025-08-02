import React, { useEffect, useState } from 'react';
import './index.css';

const Wotne = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch('/accounts.json')
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map((item) => {
          const lines = item.text.split('\n').map(line => line.trim());

          return {
            id: item.id,
            server: lines[0] || '',
            level: lines[1]?.replace('Level: ', '') || '',
            sku: lines[2]?.replace('SKU: ', '') || '',
            skins: lines[3] || '',
            country: lines[4]?.replace('Hesabın Oluşturulduğu Ülke: ', '') || '',
            matchHistory: lines[5]?.replace('Karşılaşma Geçmişi: ', '') || '',
            lastGame: lines[6]?.replace('Son Oyun Tarihi: ', '') || '',
            crystals: lines[7]?.replace('Hesaptaki Toplam Kostüm Kristali Sayısı: ', '') || '',
            price: lines[10] || ''
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
