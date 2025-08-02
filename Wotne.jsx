import { useState } from "react";

const accounts = [
  {
    id: "EUW_ACC_104985",
    region: "EUW",
    blue_essence: 45410,
    orange_essence: 1090,
    skins: [
      "Barbar Sion",
      "Waterloo Miss Fortune",
      "Bozulmuş Yemin Miss Fortune",
      "Savaş Ustası Azir",
      "Kaleci Maokai",
      "Eternum Cassiopeia",
      "Kumbelası Skarner",
      "Cadı Poppy",
      "Havuz Partisi Leona"
    ],
    price_usd: 8.48
  },
  {
    id: "EUW_ACC_108710",
    region: "EUW",
    blue_essence: 45250,
    orange_essence: 1218,
    skins: [
      "Semavipullu Master Yi",
      "Uzay Serüveni Kha'Zix",
      "Parlak Çekiç Jayce",
      "Meka Aurelion Sol",
      "Ayın Elemanı Sivir",
      "Waterloo Miss Fortune",
      "Gizli Ajan Xin Zhao",
      "Arş Hükümdarı Vex",
      "Yıldız Düşmanı Fiddlesticks"
    ],
    price_usd: 8.48
  }
];

export default function Wotne() {
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const filtered = accounts
    .filter((acc) =>
      acc.skins.some((skin) => skin.toLowerCase().includes(query.toLowerCase()))
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.price_usd - b.price_usd
        : b.price_usd - a.price_usd
    );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">WOTNE - Fresh LoL Accounts</h1>
      <div className="flex gap-4 mb-6">
        <input
          className="border p-2 flex-1 rounded"
          type="text"
          placeholder="Search by skin name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filtered.map((acc) => (
          <div key={acc.id} className="border p-4 rounded shadow">
            <div className="font-bold text-lg">{acc.id}</div>
            <div className="text-sm">Region: {acc.region}</div>
            <div className="text-sm">Blue Essence: {acc.blue_essence}</div>
            <div className="text-sm">Orange Essence: {acc.orange_essence}</div>
            <div className="text-sm">Price: ${acc.price_usd}</div>
            <div className="mt-2">
              <div className="font-semibold text-sm">Skins:</div>
              <ul className="list-disc list-inside text-sm">
                {acc.skins.map((skin, i) => (
                  <li key={i}>{skin}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
