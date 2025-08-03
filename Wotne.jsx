import React, { useEffect, useState } from 'react';
import './index.css';

const roundToNearestHalfOrWhole = (num) => {
  const floor = Math.floor(num);
  const decimal = num - floor;
  if (decimal < 0.25) return floor;
  if (decimal < 0.75) return floor + 0.5;
  return Math.ceil(num);
};

const generateChecksum = (input) => {
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    sum += input.charCodeAt(i) * (i + 1);
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return [
    chars[sum % chars.length],
    chars[(sum + 11) % chars.length],
    chars[(sum + 23) % chars.length],
  ].join('');
};

// ✅ Donut konumlarını üreten fonksiyon
const generateDonutPositions = (count, minDistance) => {
  const donuts = [];

  let tries = 0;
  while (donuts.length < count && tries < 1000) {
    const size = Math.floor(Math.random() * 51) + 30; // 30-80px
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const rotation = Math.floor(Math.random() * 360);

    const tooClose = donuts.some((d) => {
      const dx = (d.left - left) * window.innerWidth / 100;
      const dy = (d.top - top) * window.innerHeight / 100;
      return Math.sqrt(dx * dx + dy * dy) < minDistance;
    });

    if (!tooClose) {
      donuts.push({ size, left, top, rotation });
    }

    tries++;
  }

  return donuts;
};

const Wotne = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [donutPositions, setDonutPositions] = useState([]);
  const accountsPerPage = 10;

  useEffect(() => {
    const positions = generateDonutPositions(20, 100);
    setDonutPositions(positions);
  }, []);

  useEffect(() => {
    fetch('/accounts.json')
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map((item) => {
          const text = item.text;
          const lines = text.split('\n').map((line) => line.trim());

          const isSpecial = lines[0] === 'SPECIAL Account';
          const server = isSpecial ? lines[1] : lines[0];
          const getValue = (prefix) => {
            const line = lines.find((l) => l.startsWith(prefix));
            return line ? line.replace(prefix, '').trim() : 'N/A';
          };

          const level = getValue('Level:');
          const sku = getValue('SKU:');
          const country = getValue('Account Creation Country:');
          const matchHistory = getValue('Match History:');
          const lastGame = getValue('Last Game Date:');
          const crystals = getValue('Total Skin Shard Count of Account:');
          const priceMatch = text.match(/₺\d+[.,]?\d*/);
          const price = priceMatch ? priceMatch[0] : 'N/A';

          let priceUsd = 'N/A';
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

          const reversedLines = [...lines].reverse();
          const essenceNumbers = reversedLines
            .filter((line) => /^\d+$/.test(line))
            .slice(0, 3)
            .map((num) => parseInt(num));

          const blueEssence = essenceNumbers[2] ?? 'N/A';
          const orangeEssence = essenceNumbers[1] ?? 'N/A';

          const warranty = text.includes('7 Days Warranty') ? '✔ 7 Days Warranty' : '❌';
          const recovery = text.includes('Recovery Info Available') ? '✔ Recovery Info' : '❌';
          const unverified = text.includes('Unverified Email') ? '✔ Unverified Mail' : '❌';

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
            priceUsd,
            isSpecial,
            blueEssence,
            orangeEssence,
            warranty,
            recovery,
            unverified,
          };
        });

        setAccounts(parsed);
      })
      .catch((error) => {
        console.error('Failed to load data:', error);
      });
  }, []);

  const filteredAccounts = accounts.filter((acc) =>
  acc.skins.toLowerCase().includes(searchTerm) ||
  acc.tag.toLowerCase().includes(searchTerm)
);


  const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage);
  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const currentAccounts = filteredAccounts.slice(indexOfFirstAccount, indexOfLastAccount);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const firstPage = () => setCurrentPage(1);
  const lastPage = () => setCurrentPage(totalPages);

  const getPageNumbers = () => {
    const maxPageButtons = 9;
    const pages = [];

    let start = Math.max(currentPage - 4, 1);
    let end = Math.min(start + maxPageButtons - 1, totalPages);

    if (end - start < maxPageButtons - 1) {
      start = Math.max(end - maxPageButtons + 1, 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const highlightSkins = (skins, term) => {
    if (!term) return skins;
    const regex = new RegExp(`(${term})`, 'gi');
    return skins.split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i}>{part}</mark> : part
    );
  };

  return (
    <>
      {/* 🔵 Arka plan donutları */}
      <div className="donut-bg">
        {donutPositions.map((d, i) => (
          <div
            key={i}
            className="donut"
            style={{
              width: `${d.size}px`,
              height: `${d.size}px`,
              left: `${d.left}%`,
              top: `${d.top}%`,
              transform: `rotate(${d.rotation}deg)`,
            }}
          />
        ))}
      </div>

      {/* 🔵 Asıl içerik */}
      <div className="container">
        <h1>DONUT ACCOUNTS</h1>

        <input
  type="text"
  placeholder="Search by skin or tag (e.g., EUW-123)"
  value={searchTerm}
  onChange={(e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setCurrentPage(1);
  }}
  className="search-input"
/>


        {currentAccounts.length > 0 ? (
          currentAccounts.map((account, index) => (
            <div className={`card layout-card ${account.isSpecial ? 'special' : ''}`} key={index}>
              <div className="left-box">
                <h2>{account.tag}</h2>
                <p><strong>Blue Essence:</strong> {account.blueEssence}</p>
                <p><strong>Orange Essence:</strong> {account.orangeEssence}</p>
                <p><strong>Price (USD):</strong> {account.priceUsd}</p>
              </div>
              <div className="right-box">
                <p><strong>Skins:</strong> {highlightSkins(account.skins, searchTerm)}</p>
                <p><strong>Country:</strong> {account.country}</p>
                <p><strong>Match History:</strong> {account.matchHistory}</p>
                <p><strong>Last Game:</strong> {account.lastGame}</p>
                <p><strong>Skin Shards:</strong> {account.crystals}</p>
                <p><strong>{account.warranty}</strong></p>
                <p><strong>{account.recovery}</strong></p>
                <p><strong>{account.unverified}</strong></p>
              </div>
            </div>
          ))
        ) : (
          <p>No accounts found matching ‘{searchTerm}’.</p>
        )}

        <p className="pagination-info">
          Showing {indexOfFirstAccount + 1} - {Math.min(indexOfLastAccount, filteredAccounts.length)} of {filteredAccounts.length} results.
        </p>

        <div className="pagination">
          <button onClick={firstPage} disabled={currentPage === 1}>{'<<'}</button>
          <button onClick={prevPage} disabled={currentPage === 1}>{'<'}</button>
          {getPageNumbers().map((num) => (
            <button
              key={num}
              onClick={() => paginate(num)}
              className={currentPage === num ? 'active' : ''}
            >
              {num}
            </button>
          ))}
          <button onClick={nextPage} disabled={currentPage === totalPages}>{'>'}</button>
          <button onClick={lastPage} disabled={currentPage === totalPages}>{'>>'}</button>
        </div>
      </div>
    </>
  );
};

export default Wotne;
