# config.py — All configurables in one place

import os

SITE_URL        = os.environ.get("SITE_URL", "https://options-website.onrender.com")
GOATCOUNTER_URL = os.environ.get("GOATCOUNTER_URL", "")  # e.g. https://yourcode.goatcounter.com

APP_CONFIG = {
    "title": "Options Strategies",
    "subtitle": "An interactive guide to understanding options",
    "default_ticker": "AAPL",
    "cache_seconds": 60,
    "price_range_pct": 0.35,  # payoff chart shows ±35% from current price
    "chart_points": 300,
}

STRATEGIES = {
    "long_call": {
        "name": "Long Call",
        "hook": "Bet a stock will go up — limited risk, unlimited upside.",
        "description": (
            "A long call gives you the right — but not the obligation — to buy 100 shares "
            "at the strike price before expiration. You profit when the stock rises above "
            "the strike plus premium paid. Risk is limited to the premium; upside is unlimited."
        ),
        "mechanics": [
            "Pay a premium upfront to enter the trade",
            "Profit if stock closes above break-even at expiration",
            "Maximum loss is limited to the premium paid",
            "Potential profit is theoretically unlimited",
            "One standard contract controls 100 shares",
        ],
        "params": [
            {
                "id": "strike_pct",
                "label": "Strike Price",
                "min": 80,
                "max": 130,
                "default": 105,
                "step": 1,
                "format": "pct",
                "description": "As % of current price — the price at which you can buy shares",
            },
            {
                "id": "premium_pct",
                "label": "Premium Paid",
                "min": 0.5,
                "max": 15,
                "default": 3,
                "step": 0.5,
                "format": "pct",
                "description": "Cost of the option contract as % of current price",
            },
        ],
    },

    "long_put": {
        "name": "Long Put",
        "hook": "Bet a stock will fall — portfolio insurance or a bearish play.",
        "description": (
            "A long put gives you the right — but not the obligation — to sell 100 shares "
            "at the strike price before expiration. It profits when the stock falls and is "
            "commonly used as portfolio insurance against a decline."
        ),
        "mechanics": [
            "Pay a premium upfront to enter the trade",
            "Profit if stock closes below break-even at expiration",
            "Maximum loss is limited to the premium paid",
            "Substantial profit potential if the stock drops sharply",
            "One standard contract controls 100 shares",
        ],
        "params": [
            {
                "id": "strike_pct",
                "label": "Strike Price",
                "min": 70,
                "max": 120,
                "default": 95,
                "step": 1,
                "format": "pct",
                "description": "As % of current price — the price at which you can sell shares",
            },
            {
                "id": "premium_pct",
                "label": "Premium Paid",
                "min": 0.5,
                "max": 15,
                "default": 3,
                "step": 0.5,
                "format": "pct",
                "description": "Cost of the option contract as % of current price",
            },
        ],
    },

    "covered_call": {
        "name": "Covered Call",
        "hook": "Already own the stock? Collect extra income by selling someone else the upside.",
        "description": (
            "A covered call is an income strategy where you own the stock and sell a call "
            "option against it. You collect the premium immediately, but agree to sell your "
            "shares at the strike price if the stock rises above it — capping your upside."
        ),
        "mechanics": [
            "You must already own 100 shares of the stock",
            "Sell a call option and collect premium upfront",
            "Keep the premium regardless of outcome",
            "If stock stays below strike, keep shares and premium",
            "If stock rises above strike, shares get called away at the strike price",
        ],
        "params": [
            {
                "id": "strike_pct",
                "label": "Strike Price",
                "min": 95,
                "max": 130,
                "default": 110,
                "step": 1,
                "format": "pct",
                "description": "As % of current price — the price at which you're obligated to sell",
            },
            {
                "id": "premium_pct",
                "label": "Premium Collected",
                "min": 0.5,
                "max": 10,
                "default": 2,
                "step": 0.5,
                "format": "pct",
                "description": "Income received for selling the option as % of current price",
            },
        ],
    },

    "bull_call_spread": {
        "name": "Bull Call Spread",
        "hook": "Moderately bullish? Reduce your cost by capping your max profit.",
        "description": (
            "A bull call spread buys a call at a lower strike and simultaneously sells a "
            "call at a higher strike. This reduces the net premium paid vs. a straight long "
            "call, but caps your maximum profit at the spread width. Use when you're "
            "moderately bullish, not aggressively so."
        ),
        "mechanics": [
            "Buy a call at the lower strike — pay premium",
            "Sell a call at the higher strike — receive premium",
            "Net cost (debit) is lower than a single long call",
            "Maximum profit is capped at: upper strike − lower strike − net premium",
            "Maximum loss is limited to the net premium paid",
        ],
        "params": [
            {
                "id": "lower_strike_pct",
                "label": "Lower Strike (buy)",
                "min": 80,
                "max": 115,
                "default": 100,
                "step": 1,
                "format": "pct",
                "description": "Strike of the call you buy, as % of current price",
            },
            {
                "id": "upper_strike_pct",
                "label": "Upper Strike (sell)",
                "min": 100,
                "max": 130,
                "default": 110,
                "step": 1,
                "format": "pct",
                "description": "Strike of the call you sell, as % of current price",
            },
            {
                "id": "net_premium_pct",
                "label": "Net Premium Paid",
                "min": 0.5,
                "max": 8,
                "default": 2,
                "step": 0.5,
                "format": "pct",
                "description": "Net cost after buying and selling, as % of current price",
            },
        ],
    },

    "long_straddle": {
        "name": "Long Straddle",
        "hook": "Bet on a big move — you don't care which direction, just that it moves.",
        "description": (
            "A long straddle buys both a call and a put at the same strike price. You profit "
            "if the stock makes a large move in either direction before expiration. The catch: "
            "you pay for two options, so the stock needs to move significantly just to break even."
        ),
        "mechanics": [
            "Buy a call AND a put at the same strike price",
            "Pay premium for both legs — this is your total cost and max loss",
            "Profit if the stock moves far enough in either direction",
            "Two break-even points: one above and one below the strike",
            "Popular before earnings announcements or major events",
        ],
        "params": [
            {
                "id": "strike_pct",
                "label": "Strike Price",
                "min": 85,
                "max": 115,
                "default": 100,
                "step": 1,
                "format": "pct",
                "description": "Usually set at-the-money (100% = current price) for both legs",
            },
            {
                "id": "total_premium_pct",
                "label": "Total Premium Paid",
                "min": 2,
                "max": 20,
                "default": 7,
                "step": 0.5,
                "format": "pct",
                "description": "Combined cost of the call + put as % of current price",
            },
        ],
    },

    "long_strangle": {
        "name": "Long Strangle",
        "hook": "Like a straddle but cheaper — you need a bigger move to profit.",
        "description": (
            "A long strangle buys an out-of-the-money call and an out-of-the-money put at "
            "different strikes. It costs less than a straddle because both options are OTM, "
            "but the stock needs to move even further to reach break-even."
        ),
        "mechanics": [
            "Buy an OTM call at a higher strike — costs less than an ATM call",
            "Buy an OTM put at a lower strike — costs less than an ATM put",
            "Total cost is lower than a straddle",
            "Needs a larger price move to profit than a straddle",
            "Two break-even points, farther apart than a straddle",
        ],
        "params": [
            {
                "id": "call_strike_pct",
                "label": "Call Strike (upper)",
                "min": 100,
                "max": 130,
                "default": 110,
                "step": 1,
                "format": "pct",
                "description": "OTM call strike as % of current price",
            },
            {
                "id": "put_strike_pct",
                "label": "Put Strike (lower)",
                "min": 70,
                "max": 100,
                "default": 90,
                "step": 1,
                "format": "pct",
                "description": "OTM put strike as % of current price",
            },
            {
                "id": "total_premium_pct",
                "label": "Total Premium Paid",
                "min": 1,
                "max": 15,
                "default": 4,
                "step": 0.5,
                "format": "pct",
                "description": "Combined cost of the call + put as % of current price",
            },
        ],
    },

    "iron_condor": {
        "name": "Iron Condor",
        "hook": "Bet the stock goes nowhere — collect premium while it stays in a range.",
        "description": (
            "An iron condor sells a put spread below the market and a call spread above it. "
            "You collect a net credit upfront and keep it all if the stock stays inside your "
            "range at expiration. It's one of the most popular strategies for low-volatility environments."
        ),
        "mechanics": [
            "Sell a put at the lower boundary — collect premium",
            "Buy a put further below — limits your downside risk",
            "Sell a call at the upper boundary — collect premium",
            "Buy a call further above — limits your upside risk",
            "Keep the net credit if the stock stays inside the range",
        ],
        "params": [
            {
                "id": "lower_pct",
                "label": "Lower Boundary (short put)",
                "min": 75,
                "max": 98,
                "default": 92,
                "step": 1,
                "format": "pct",
                "description": "Short put strike — lower edge of your profit zone",
            },
            {
                "id": "upper_pct",
                "label": "Upper Boundary (short call)",
                "min": 102,
                "max": 125,
                "default": 108,
                "step": 1,
                "format": "pct",
                "description": "Short call strike — upper edge of your profit zone",
            },
            {
                "id": "wing_pct",
                "label": "Wing Width",
                "min": 2,
                "max": 15,
                "default": 5,
                "step": 1,
                "format": "pct",
                "description": "How far OTM your long options sit — limits max loss",
            },
            {
                "id": "net_credit_pct",
                "label": "Net Credit Received",
                "min": 0.5,
                "max": 6,
                "default": 2,
                "step": 0.5,
                "format": "pct",
                "description": "Premium collected upfront as % of current price",
            },
        ],
    },
}

DEFAULT_TICKERS = ["AAPL", "TSLA", "SPY", "NVDA", "MSFT", "AMZN", "GOOGL"]

HEALTHCHECK_URL  = "http://jobwatch.veederville.com/ping/c5f164ed-a698-40a8-a526-3dba42c6dc06"
HEALTHCHECK_HOUR = 0   # UTC hour to fire (0 = midnight)
HEALTHCHECK_MIN  = 30  # UTC minute → 12:30 AM UTC daily
