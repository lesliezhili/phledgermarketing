# PhLedger Marketing Platform

> "Commit to the LORD whatever you do, and he will establish your plans." — Proverbs 16:3

A faith-driven, **business-agnostic** marketing platform — one 90-day method for any business, whatever it sells, delivered on the channels that reach its buyers. Built with **Next.js 14** (App Router), **Tailwind CSS**, and **TypeScript**. Same architecture as SilverConnect.

## Powered by PhLedger

**PhLedger** is a faith-driven technology company building integrated platforms for professional growth, financial management, and community connection — all grounded in Biblical principles of integrity, stewardship, and service.

🔗 [Follow PhLedger on LinkedIn](https://www.linkedin.com/company/phledger/)

## PhLedger Ecosystem

| Platform | Purpose | Status |
|----------|---------|--------|
| **SilverConnect** | Service platform (architecture reused here) | Active |
| **PhLedger Marketing** | Marketing for any product or service (this app) | Active |
| **PhLedgerTax** | Payment, accounting & tax agent | Integrated |

All platforms are powered by PhLedger and built under God with Bible content throughout.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: Custom components (same pattern as SilverConnect)
- **Payment**: PhLedgerTax agent integration
- **Deployment**: Vercel / Azure / Any Node.js host

## Features

### SilverConnect Architecture (Reused)
- Free tier signup/login
- Tiered pricing (Grace / Faithful / Abundant)
- Service booking system
- Customer feedback & reviews

### Business-Agnostic Marketing Services
All business types, channels and services live in one catalogue,
`src/lib/catalog.ts`. Add a channel, business type or service there and every
page (home, services, booking, navigation, footer) picks it up.

- **Business types**: local shop or venue, online product, service to businesses, service to people, church or non-profit
- **Channels**: Google Maps & Search, Instagram, Facebook, LinkedIn, X — chosen per client
- **Services**: Marketing Health Check, Offer & Brand Messaging, Content Strategy, Social Media Management, Local & Google Visibility, Paid Ads Management (any platform), Outreach & Partnerships, Analytics & Reporting
- **Method**: the same 5 steps in 90 days — Diagnose, Fix the basics, Launch push, Grow and retain, Report and decide

### PhLedgerTax Integration
- Payment processing (Credit/Debit/Bank/PayPal/Crypto)
- Invoice generation & management
- Tax calculation (US, UK, EU, AU, CA)
- Accounting dashboard
- Financial reporting

### Bible Content (All Pages)
- 30+ categorized daily verses
- Marketing lessons from Scripture
- Faith-based business principles
- Devotional content on every page

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
phledgermarketing/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + metadata
│   │   ├── globals.css         # Tailwind + custom styles
│   │   ├── page.tsx            # Home page
│   │   ├── login/page.tsx      # Sign in
│   │   ├── signup/page.tsx     # Create account (SilverConnect architecture)
│   │   ├── services/page.tsx   # Business-agnostic services
│   │   ├── linkedin/page.tsx   # LinkedIn channel (also instagram, facebook, x-twitter, google-maps)
│   │   ├── api/pricing/quote/  # Smart-pricing API
│   │   ├── pricing/page.tsx    # Tiered pricing (Grace/Faithful/Abundant)
│   │   ├── booking/page.tsx    # Service booking form
│   │   ├── feedback/page.tsx   # Reviews & testimonials
│   │   ├── bible/page.tsx      # Bible wisdom & marketing lessons
│   │   ├── phledgertax/page.tsx # Payment, tax, accounting
│   │   └── about/page.tsx      # About PhLedger (company intro)
│   ├── components/
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── Footer.tsx          # Footer with "Powered by PhLedger"
│   │   └── BibleVerse.tsx      # Bible verse display component
│   └── lib/
│       ├── catalog.ts          # Business types, channels, services, method
│       ├── pricing/            # Smart-pricing engine
│       └── bible.ts            # Bible verses & marketing wisdom data
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
└── README.md
```

## Deploy

### Vercel (Recommended)
```bash
npx vercel
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Bible Foundation

> "Whatever you do, work heartily, as for the Lord and not for men." — Colossians 3:23

This platform is built under God. Every feature, interaction, and business practice is grounded in Biblical principles of integrity, service, stewardship, and love.

---

**Powered by PhLedger** | [linkedin.com/company/phledger](https://www.linkedin.com/company/phledger/)

© 2026 PhLedger. Built under God.
