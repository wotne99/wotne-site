
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

const Wotne = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const accountsPerPage = 10;

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
          const textLower = text.toLowerCase();
          const hasWarranty = textLower.includes('7 days warranty');
          const hasRecovery = textLower.includes('recovery info');
          const hasUnverified = textLower.includes('unverified email');
          const blueEssence = lines.find(l => /^\d+$/.test(l)) || 'N/A';
          const orangeEssence = lines.find((l, idx) => /^\d+$/.test(l) && lines[idx + 1] === '0') || 'N/A';
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
            hasWarranty,
            hasRecovery,
            hasUnverified,
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

  const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage);
  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const currentAccounts = filteredAccounts.slice(indexOfFirstAccount, indexOfLastAccount);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const getPageNumbers = () => {
    const maxPageButtons = 9;
    const pages = [];
    let start = Math.max(currentPage - 4, 1);
    let end = Math.min(start + maxPageButtons - 1, totalPages);
    if (end - start < maxPageButtons - 1) {
      start = Math.max(end - maxPageButtons + 1, 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
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
    <div className="container">
      <h1>DONUT ACCOUNTS</h1>
      <input
        type="text"
        placeholder="Search for a skin or champion..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value.toLowerCase());
          setCurrentPage(1);
        }}
        className="search-input"
      />
      {currentAccounts.map((account, index) => (
        <div className={`card-grid ${account.isSpecial ? 'special' : ''}`} key={index}>
          <div className="left-col">
            <h2>{account.tag}</h2>
            <p><strong>Blue Essence:</strong> {account.blueEssence}</p>
            <p><strong>Orange Essence:</strong> {account.orangeEssence}</p>
            <p><strong>Price (USD):</strong> {account.priceUsd}</p>
          </div>
          <div className="right-col">
            <p><strong>Skins:</strong> {highlightSkins(account.skins, searchTerm)}</p>
            <p><strong>Country:</strong> {account.country}</p>
            <p><strong>Match History:</strong> {account.matchHistory}</p>
            <p><strong>Last Game:</strong> {account.lastGame}</p>
            <p><strong>Skin Shards:</strong> {account.crystals}</p>
            {account.hasWarranty && <p>✓ <strong>7 Days Warranty</strong></p>}
            {account.hasRecovery && <p>✓ <strong>Recovery Info</strong></p>}
            {account.hasUnverified && <p>✓ <strong>Unverified Mail</strong></p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Wotne;
