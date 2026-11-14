# Zero Hunger — Food Sharing Platform 🇪🇬

A full-stack web application designed for the **ISEF** competition connecting restaurants, hotels, charities, and individual food donors across Egypt's 27 governorates to end food waste and support families in need.

---

## 🚀 Quick Start

### 1. Launch with One Click
Double-click `run.bat` in this folder. It will start the Node.js server and automatically open `http://localhost:3000` in your default browser.

### 2. Or Run via Terminal
```bash
npm start
```
The platform will be live at:
👉 **http://localhost:3000**

---

## 🗄️ Architecture & Database

- **Backend**: Node.js & Express REST API (`server.js`)
- **Database**: SQLite (`zero_hunger.db`) via Node's high-performance native `node:sqlite`
- **Data Persistence**: 
  - All users, sessions, donations, offers, advertisements, charities, requests, and notifications are saved in SQLite tables.
  - When you register or login, previous data is **never lost**.
  - All historical donations, rankings, and offers stay permanently saved.
- **Frontend**: Clean, uniform design (`public/index.html`, `public/css/style.css`, `public/js/app.js`)
- **Offline / Portable Mode**: `zero-hunger2.html` can also be opened directly in any browser with graceful client-side fallback.

---

## 🔑 Default Accounts (Pre-Seeded)

| Account Type | Email / Username | Password | Role |
|---|---|---|---|
| **Platform Administrator** | `admin@zerohunger.local` | `Admin123` | Full access, Ad approval & moderation |
| **Restaurant** | `resto1@zerohunger.local` | `Demo123` | Publish meal offers, donate surplus food |
| **Hotel** | `hotel1@zerohunger.local` | `Demo123` | Publish night/stay offers, donate banquets |
| **Charity Organisation** | `charity1@zerohunger.local` | `Demo123` | Reserve/receive donations, request food |
| **Food Donor** | `donor1@zerohunger.local` | `Demo123` | Direct community food sharing |

*You can also create your own custom account via the **Register** tab at any time.*

---

## ✨ Features Included

1. **Persistent Authentication & SQLite Database**: Register and log in securely across 4 account types (Restaurant, Hotel, Charity, Donor) plus Admin. Data is stored permanently in SQLite (`zero_hunger.db`) and never wiped on login.
2. **5-Star Rating & Review System ⭐**:
   - Charities can rate restaurants, hotels, and donors on all meals (1 to 5 stars).
   - Evaluation covers food freshness, taste, hygiene, packaging, and on-time delivery.
   - Interactive star rating modal with live average scores and review count badges displayed across Dashboard, Offers, Restaurants, Hotels, and Charity donation history.
3. **Interactive Clickable KPIs & Stats Navigation 🚀**:
   - Every metric card and dashboard statistic is an interactive link (e.g. clicking **Active Offers (26 Discounts & Specials)** navigates directly to the offers catalog; clicking **Night & Stay Offers** opens hotel offers; clicking registered restaurants or hotels navigates to their directories).
   - Contributor rows in donation leaderboards can be clicked to inspect restaurant or hotel details.
4. **Dashboard 1 (Donation Leaders)**: Live rankings of contributors, meals shared, and 5-star ratings across Egypt's 27 governorates.
5. **Dashboard 2 (Best Offers)**: Meal discounts and hotel night/stay discounts sorted by highest discount percentage with direct links.
6. **Charity Coordination**: Reserve, receive, and distribute donations; rate donors upon receiving meals; manage beneficiary groups and delivery points.
7. **Real-time Ads & Promotions**: Submit banner/campaign ads; Admin approval and view/click metrics.
8. **Bilingual UI**: Toggle between English and Arabic (RTL) seamlessly with Cairo and Inter typography.
9. **Dark / Light Theme**: Built-in theme switcher saved to database preferences.
10. **Photo Upload**: Image upload and preview for food donations.
