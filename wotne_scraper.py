
import requests
from bs4 import BeautifulSoup
import json

url = "https://www.30levelunranked.com/"
headers = {"User-Agent": "Mozilla/5.0"}

response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.text, "html.parser")

accounts = []
exchange_rate = 33  # 1 USD = 33 TRY
markup = 1.75       # %75 kar

product_boxes = soup.find_all("div", class_="productbox")

for box in product_boxes:
    # Sadece EUW hesaplar
    region = box.find("div", class_="product-type")
    if not region or "EUW" not in region.text:
        continue

    id_tag = box.find("div", class_="product-sku")
    acc_id = id_tag.text.strip() if id_tag else "UNKNOWN"

    price_tag = box.find("span", class_="money")
    try:
        price_try = float(price_tag.text.replace("₺", "").strip())
    except:
        price_try = 0
    price_usd = round((price_try / exchange_rate) * markup, 2)

    be = oe = 0
    icons = box.find_all("img")
    for icon in icons:
        alt = icon.get("alt", "")
        if "Blue Essence" in alt:
            be = int(icon.find_next_sibling("span").text.strip())
        elif "Orange Essence" in alt:
            oe = int(icon.find_next_sibling("span").text.strip())

    # Skin listesi
    skins = []
    skin_section = box.find("div", class_="product-skin-list")
    if skin_section:
        skins = [s.strip() for s in skin_section.stripped_strings]

    accounts.append({
        "id": acc_id,
        "region": "EUW",
        "blue_essence": be,
        "orange_essence": oe,
        "skins": skins,
        "price_usd": price_usd
    })

# JSON olarak kaydet
with open("accounts.json", "w", encoding="utf-8") as f:
    json.dump(accounts, f, ensure_ascii=False, indent=2)

print("✅ Hesaplar çekildi ve accounts.json dosyasına yazıldı.")
