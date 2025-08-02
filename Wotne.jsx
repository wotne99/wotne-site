import React, { useEffect, useState } from 'react';
import './index.css';

const Wotne = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/accounts.json')
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map((item) => {
          const text = item.text;

          const extract = (pattern) => {
            const match = text.match(pattern);
            return match ? match[1].trim() : 'undefined';
          };

          return {
            id: item.id,
            server: extract(/^([A-Z]{2,4})$/m),
            level: extract(/Level:\s*(.*)/),
            sku: extract(/SKU:\s*(.*)/),
            skins: extract(/SKU:.*?\n(.*?)\nHesabın Oluşturulduğu Ülke:/s),
            country: extract(/Hesabın Oluşturulduğu Ülke:\s*(.*)/),
            matchHistory: extract(/Karşılaşma Geçmişi:\s*(.*)/),
            lastGame: extract(/Son Oyun Tarihi:\s*(.*)/),
            crystals: extract(/Kristali Sayısı:\s*(\d+)/),
            price: extract(/(₺\d+,\d+)/),
          };
        });

        setAccounts(parsed);
      })
      .catch((error) => {
        console.error('Veri alınamadı:', error);
      });
  }, []);

  const filteredAccounts = accounts.filter((acc) =>
    acc.skins.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="container">
      <h1><h1>DONUT ACCOUNTS</h1></h1>

      <input
        type="text"
        placeholder="Kostüm veya Şampiyon Ara..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        className="search-input"
      />

      {filteredAccounts.length > 0 ? (
        filteredAccounts.map((account, index) => (
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
        <p>Eşleşen hesap bulunamadı.</p>
      )}
    </div>
  );
};

export default Wotne;
