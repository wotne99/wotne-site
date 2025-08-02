import React, { useEffect, useState } from 'react';
import './index.css';

const Wotne = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Basit checksum fonksiyonu (veriye özel mini hash gibi)
  const generateChecksum = (input) => {
    let sum = 0;
    for (let i = 0; i < input.length; i++) {
      sum += input.charCodeAt(i) * (i + 1);
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return [
      chars[sum % chars.length],
      chars[(sum + 11) % chars.length],
      chars[(sum + 23) % chars.length]
    ].join('');
  };

  useEffect(() => {
    fetch('/accounts.json')
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map((item) => {
          const text = item.text;
          const lines = text.split('\n').map((line) => line.trim());

          const getValue = (prefix) => {
            const line = lines.find((l) => l.startsWith(prefix));
            return line ? line.replace(prefix, '').trim() : 'undefined';
          };

          const server = lines[0] || 'undefined';
          const level = getValue('Level:');
          const sku = getValue('SKU:');
          const country = getValue('Account Creation Country:');
          const matchHistory = getValue('Match History:');
          const lastGame = getValue('Last Game Date:');
          const crystals = getValue('Total Skin Shard Count of Account:');
          const priceMatch = text.match(/₺\d+[.,]?\d*/);
          const price = priceMatch ? priceMatch[0] : 'undefined';

          const startIdx = lines.findIndex((l) => l.startsWith('SKU:')) + 1;
          const endIdx = lines.findIndex((l) => l.startsWith('Account Creation Country:'));
          const skins = lines.slice(startIdx, endIdx).join(', ');

          // ✅ TAG Oluştur
          const skuDigits = sku.match(/\d+$/)?.[0] || '000';
          const checksum = generateChecksum(lastGame + skins);
          const tag = `${server}-${skuDigits}-${checksum}`;

          return {
            id: item.id,
            tag,
            server,
            level,
            sku,
            skins,
            country,
            matchHistory,
            lastGame,
            crystals,
            price
          };
        });

        setAccounts(parsed);
      })
      .catch((error) => {
        console.error('Failed to load data:', error);
      });
  }, []);

  const filteredAccounts = accounts.filter((acc) =>
    acc.skins.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="container">
      <h1>DONUT ACCOUNTS</h1>

      <input
        type="text"
        placeholder="Search for a skin or champion..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        className="search-input"
      />

      {filteredAccounts.length > 0 ? (
        filteredAccounts.map((account, index) => (
          <div className="card" key={index}>
            <h2>Account #{index + 1}</h2>
            <p><strong>TAG:</strong> {account.tag}</p>
            <p><strong>Region:</strong> {account.server}</p>
            <p><strong>Level:</strong> {account.level}</p>
            <p><strong>Skins:</strong> {account.skins}</p>
            <p><strong>Country:</strong> {account.country}</p>
            <p><strong>Match History:</strong> {account.matchHistory}</p>
            <p><strong>Last Game:</strong> {account.lastGame}</p>
            <p><strong>Skin Shards:</strong> {account.crystals}</p>
            <p><strong>Price:</strong> {account.price}</p>
            <hr />
          </div>
        ))
      ) : (
        <p>No matching accounts found.</p>
      )}
    </div>
  );
};

export default Wotne;
