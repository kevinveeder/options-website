from flask import Flask, jsonify, render_template, send_from_directory
import yfinance as yf
import time
import threading
import os
from datetime import datetime, timedelta

import requests as _requests

from config import APP_CONFIG, STRATEGIES, DEFAULT_TICKERS, \
                   HEALTHCHECK_URL, HEALTHCHECK_HOUR, HEALTHCHECK_MIN, \
                   SITE_URL, GOATCOUNTER_URL

app = Flask(__name__)
_price_cache: dict = {}


# ── Healthcheck ping ─────────────────────────────────────────────────────────

def _healthcheck_loop():
    """Ping HEALTHCHECK_URL once daily at HEALTHCHECK_HOUR:HEALTHCHECK_MIN UTC."""
    while True:
        now = datetime.utcnow()
        target = now.replace(hour=HEALTHCHECK_HOUR, minute=HEALTHCHECK_MIN,
                             second=0, microsecond=0)
        if target <= now:
            target += timedelta(days=1)
        time.sleep((target - now).total_seconds())
        try:
            _requests.get(HEALTHCHECK_URL, timeout=10)
        except Exception:
            pass


# Start the ping thread once — guard against Flask's debug reloader double-spawn
if HEALTHCHECK_URL and os.environ.get("WERKZEUG_RUN_MAIN") != "true":
    _t = threading.Thread(target=_healthcheck_loop, daemon=True)
    _t.start()


# ── Stock price ───────────────────────────────────────────────────────────────

def fetch_price(ticker: str) -> dict:
    ticker = ticker.upper().strip()
    now = time.time()
    if ticker in _price_cache:
        ts, data = _price_cache[ticker]
        if now - ts < APP_CONFIG["cache_seconds"]:
            return data
    try:
        t = yf.Ticker(ticker)
        price = t.fast_info.last_price
        if price is None:
            raise ValueError("No price data returned")
        result = {"ticker": ticker, "price": round(float(price), 2)}
        _price_cache[ticker] = (now, result)
        return result
    except Exception as exc:
        return {"error": str(exc)}


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template(
        "index.html",
        config=APP_CONFIG,
        strategies=STRATEGIES,
        default_tickers=DEFAULT_TICKERS,
        site_url=SITE_URL,
        goatcounter_url=GOATCOUNTER_URL,
    )


@app.route("/api/price/<ticker>")
def price(ticker):
    result = fetch_price(ticker)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result)


@app.route("/robots.txt")
def robots():
    return send_from_directory("static", "robots.txt")


@app.route("/llms.txt")
def llms():
    return send_from_directory("static", "llms.txt")


@app.route("/sitemap.xml")
def sitemap():
    xml = render_template("sitemap.xml", site_url=SITE_URL)
    return app.response_class(xml, mimetype="application/xml")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
