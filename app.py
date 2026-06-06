from flask import Flask, jsonify, render_template
import yfinance as yf
import time

from config import APP_CONFIG, STRATEGIES, DEFAULT_TICKERS

app = Flask(__name__)
_price_cache: dict = {}


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


@app.route("/")
def index():
    return render_template(
        "index.html",
        config=APP_CONFIG,
        strategies=STRATEGIES,
        default_tickers=DEFAULT_TICKERS,
    )


@app.route("/api/price/<ticker>")
def price(ticker):
    result = fetch_price(ticker)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
