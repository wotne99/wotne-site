import React, { useEffect, useState } from 'react';
import './index.css';

// Özel yuvarlama fonksiyonu
const roundToNearestHalfOrWhole = (num) => {
  const floor = Math.floor(num);
  const decimal = num - floor;
  if (decimal < 0.25) return floor;
  if (decimal < 0.75) return floor + 0.5;
  return Math.ceil(num);
};

const Wotne = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const accountsPerPage = 10;

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

          let priceUsd = 'undefined';
          if (priceMatch) {
            const priceNumber = parseFloat(priceMatch[0].replace('₺', '').replace(',', '.'));
            const dollarRate = 40.65;
            const usdBase = priceNumber / dollarRate;
            const usdIncreased = usdBase * 1.75;
            const usdRounded = roundToNearestHalfOrWhole(usdIncreased);
            priceUsd = `$${usdRounded.toFixed(2)}`;
          }

          const startIdx = lines.findIndex((l) => l.startsWith('SKU:')) + 1;
          const endIdx = lines.findIndex((l) => l.startsWith('Account Creation Country:'));
          const skins = lines.slice(startIdx, endIdx).join(', ');

          const skuDigits = sku.match(/\d+$/)?.[0] || '000';
          const checksum = generateChecksum(lastGame + skins);
          const tag = `${server}-${skuDigits}-${checksum}`;

          return {
            id: item.id,
            tag,
            server,
            level,
            skins,
            country,
            matchHistory,
            lastGame,
            crystals,
            priceUsd
          };
        });

        setAccounts(parsed);
      })
      .catch((error) => console.error('Failed to load data:', error));
  }, []);

  const filteredAccounts = accounts.filter((acc) =>
    acc.skins.toLowerCase().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage);
  const currentAccounts = filteredAccounts.slice(
    (currentPage - 1) * accountsPerPage,
    currentPage * accountsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="container">
      <h1>DONUT ACCOUNTS</h1>

      <input
        type="text"
        placeholder="Search for a skin or champion..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value.toLowerCase());
          setCurrentPage(1); // Arama değişince sayfayı başa sar
        }}
        className="search-input"
      />

      {currentAccounts.length > 0 ? (
        currentAccounts.map((account, index) => (
          <div className="card" key={index}>
            <h2>TAG: {account.tag}</h2>
            <p><strong>Region:</strong> {account.server}</p>
            <p><strong>Level:</strong> {account.level}</p>
            <p><strong>Skins:</strong> {account.skins}</p>
            <p><strong>Country:</strong> {account.country}</p>
            <p><strong>Match History:</strong> {account.matchHistory}</p>
            <p><strong>Last Game:</strong> {account.lastGame}</p>
            <p><strong>Skin Shards:</strong> {account.crystals}</p>
            <p><strong>Price (USD):</strong> {account.priceUsd}</p>
            <hr />
          </div>
        ))
      ) : (
        <p>No matching accounts found.</p>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            {"<"}
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={currentPage === i + 1 ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            {">"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Wotne;
