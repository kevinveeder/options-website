// strategies.js — Payoff calculation functions for each strategy.
// Each strategy exports: calculate(prices, params, spot) → number[]
//                        keyPoints(params, spot) → { breakEven, maxProfit, maxLoss }
// All dollar amounts are per-share. One contract = 100 shares.

const STRATEGIES = {
    long_call: {
        calculate(prices, p, spot) {
            const K = spot * p.strike_pct / 100;
            const C = spot * p.premium_pct / 100;
            return prices.map(S => Math.max(S - K, 0) - C);
        },
        keyPoints(p, spot) {
            const K = spot * p.strike_pct / 100;
            const C = spot * p.premium_pct / 100;
            return {
                breakEven: K + C,
                maxProfit: "Unlimited",
                maxLoss: -C,
            };
        },
    },

    long_put: {
        calculate(prices, p, spot) {
            const K = spot * p.strike_pct / 100;
            const P = spot * p.premium_pct / 100;
            return prices.map(S => Math.max(K - S, 0) - P);
        },
        keyPoints(p, spot) {
            const K = spot * p.strike_pct / 100;
            const P = spot * p.premium_pct / 100;
            return {
                breakEven: K - P,
                maxProfit: K - P,  // if stock reaches $0
                maxLoss: -P,
            };
        },
    },

    covered_call: {
        // P&L relative to entering at current spot price
        calculate(prices, p, spot) {
            const K = spot * p.strike_pct / 100;
            const C = spot * p.premium_pct / 100;
            return prices.map(S => (S - spot) - Math.max(S - K, 0) + C);
        },
        keyPoints(p, spot) {
            const K = spot * p.strike_pct / 100;
            const C = spot * p.premium_pct / 100;
            return {
                breakEven: spot - C,
                maxProfit: (K - spot) + C,
                maxLoss: C - spot,  // stock goes to $0
            };
        },
    },

    bull_call_spread: {
        calculate(prices, p, spot) {
            const K1 = spot * p.lower_strike_pct / 100;
            const K2 = spot * Math.max(p.upper_strike_pct, p.lower_strike_pct + 1) / 100;
            const net = spot * p.net_premium_pct / 100;
            return prices.map(S =>
                Math.max(S - K1, 0) - Math.max(S - K2, 0) - net
            );
        },
        keyPoints(p, spot) {
            const K1 = spot * p.lower_strike_pct / 100;
            const K2 = spot * Math.max(p.upper_strike_pct, p.lower_strike_pct + 1) / 100;
            const net = spot * p.net_premium_pct / 100;
            return {
                breakEven: K1 + net,
                maxProfit: (K2 - K1) - net,
                maxLoss: -net,
            };
        },
    },
};
