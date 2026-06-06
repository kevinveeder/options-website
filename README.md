---
title: Options
emoji: 📈
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
short_description: Interactive options strategy education with live stock prices
---

# Options Strategies

Interactive educational guide to options trading strategies. Explains Long Call, Long Put,
Covered Call, Bull Call Spread, Long Straddle, Long Strangle, and Iron Condor in plain
English with live stock prices and interactive payoff diagrams.

Not a trading tool — designed purely for learning.

## Endpoints

`GET /` — main app

`GET /api/price/<ticker>` — live stock price via yfinance

## Variables and Secrets

Set these in HF Space Settings > Variables and Secrets.

| Name | Type | Required | Description |
|---|---|---|---|
| `SITE_URL` | Variable | Yes | Public URL of this space, e.g. `https://options.veederville.com` |
| `GOATCOUNTER_URL` | Variable | No | GoatCounter base URL, e.g. `https://options-website.goatcounter.com` |
| `HEALTHCHECK_URL` | Variable | No | Daily ping URL for uptime monitoring |

## Local Development

```bash
uv venv .venv
uv pip install -r requirements.txt
source .venv/bin/activate
python app.py
```
