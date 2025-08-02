import React, { useEffect, useState } from 'react';
import './index.css';

// Fiyat yuvarlama
const roundToNearestHalfOrWhole = (num) => {
  const floor = Math.floor(num);
  const decimal = num - floor;
  if (decimal < 0.25) return floor;
  if (decimal < 0.75) return floor + 0.5;
  return Math.ceil(num);
};

// Mini checksum (TAG için)
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
            return line ? line.replace(prefix, '').trim() : 'undefined';
          };

          const level = getValue('Level:');
          const sku = getValue('SKU:');
          const country = getValue('Account Creation Country:');
          const matchHistory = getValue('Match History:');
          const lastGame = getValue('Last Game Date:');
          const crystals = getValue('Total Skin Shard Count of Account:');
          const priceMatch = text.match(/₺\d+[.,]?\d*/);
          const price = priceMatch ? priceMatch[0] : 'undefined';

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
            priceUsd,
            isSpecial,
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

      {currentAccounts.length > 0 ? (
        currentAccounts.map((account, index) => (
          <div className="card" key={index}>
            <h2>
              TAG: {account.tag}{' '}
              {account.isSpecial && <span style={{ color: 'gold', fontSize: '1rem' }}>⭐ SPECIAL</span>}
            </h2>
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
  );
};

export default Wotne;
