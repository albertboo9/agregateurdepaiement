# ⚙️ Setup & Deployment Guide

This guide will help you set up the Studies Payment Aggregator from scratch in any environment.

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **Package Manager**: npm or yarn
- **Database**: MySQL 8.0+ or MariaDB 10.5+

---

## 1. Installation

Clone the repository and install the backend dependencies:

```bash
cd apps/backend
npm install
```

## 2. Environment Configuration

Copy the `.env.example` (or create a new `.env`) and configure the following variables:

### 🗄️ Database

| Variable | Description |
|----------|-------------|
| `DB_NAME` | Name of your MySQL database |
| `DB_USER` | MySQL username |
| `DB_PASS` | MySQL password |
| `DB_HOST` | Database host (e.g., `localhost` or remote IP) |

### 🔑 API Keys (Gateways)

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Your secret key from Stripe dashboard |
| `CINETPAY_SITE_ID` | Your Site ID from CinetPay dashboard |
| `CINETPAY_API_KEY` | Your API Key from CinetPay dashboard |

### 📧 Mail (IONOS)

| Variable | Description |
|----------|-------------|
| `MAIL_HOST` | `smtp.ionos.fr` |
| `MAIL_PORT` | `465` (SSL) |
| `MAIL_USER` | Your full Ionos email |
| `MAIL_PASS` | Your Ionos email password |
| `MAIL_FROM_NAME` | "Studies Learning" |

---

## 3. Database Initialization

The system uses **Sequelize** for ORM. To initialize the schema:

1. Ensure your database exists.
2. Run the server (it will automatically attempt to authenticate).
3. (Dev only) Enable `sequelize.sync({ alter: true })` in `server.js` temporarily to generate tables.

---

## 4. Generating Client API Keys

To allow a new application (like the WordPress plugin) to communicate with this backend, you must generate a key:

```bash
node scripts/generate-key.js
```

The script will output a key starting with `sk_...`. Give this key to the application developer.

---

## 5. Security Best Practices

### Production Checklist

- [ ] **HTTPS Only**: Ensure the server is behind a reverse proxy (Nginx) with SSL.
- [ ] **Environment**: Set `NODE_ENV=production`.
- [ ] **Secrets**: Never commit your `.env` file to git.
- [ ] **Firewall**: Restrict access to the `/api/webhooks` endpoints to the IP ranges of your providers (Stripe/CinetPay).

---

## 6. Deployment (PM2)

For production environments, we recommend using PM2 to manage the process:

```bash
npm install pm2 -g
pm2 start server.js --name psp-backend
pm2 save
```

This ensures the server restarts automatically after a crash or a reboot.
