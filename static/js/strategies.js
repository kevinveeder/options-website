// strategies.js — Payoff calculations and plain-English examples per strategy.
// calculate(prices, params, spot) → number[]  (per-share P&L at expiration)
// keyPoints(params, spot) → { breakEven, maxProfit, maxLoss }
// example(params, spot, ticker) → string[]  (beginner walkthrough steps)

const $ = n => `$${n.toFixed(2)}`;
const $c = n => `$${(n * 100).toFixed(0)}`;  // per-contract (×100 shares)

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
            return { breakEven: K + C, maxProfit: "Unlimited", maxLoss: -C };
        },
        example(p, spot, ticker) {
            const K = spot * p.strike_pct / 100;
            const C = spot * p.premium_pct / 100;
            const be = K + C;
            return [
                `You pay ${$(C)} per share (${$c(C)} total for one contract) upfront — that's your entire maximum loss.`,
                `In return, you get the right to buy ${ticker} at ${$(K)} per share at any time before expiration.`,
                `If ${ticker} stays below ${$(K)} when the option expires, it's worthless and you lose the ${$(C)} you paid. Nothing more.`,
                `${ticker} needs to reach ${$(be)} just to break even — that covers your strike price plus the premium you paid.`,
                `Every dollar ${ticker} closes above ${$(be)} at expiration is a dollar of profit per share (${$c(1)} per contract). There's no cap.`,
            ];
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
            return { breakEven: K - P, maxProfit: K - P, maxLoss: -P };
        },
        example(p, spot, ticker) {
            const K = spot * p.strike_pct / 100;
            const P = spot * p.premium_pct / 100;
            const be = K - P;
            return [
                `You pay ${$(P)} per share (${$c(P)} total for one contract) upfront — that's your entire maximum loss.`,
                `In return, you get the right to sell ${ticker} at ${$(K)} per share, even if it crashes far below that.`,
                `If ${ticker} stays above ${$(K)} when the option expires, it's worthless and you lose the ${$(P)} you paid. Nothing more.`,
                `${ticker} needs to fall to ${$(be)} just to break even — your strike price minus the premium you paid.`,
                `Every dollar ${ticker} closes below ${$(be)} at expiration is a dollar of profit per share (${$c(1)} per contract).`,
            ];
        },
    },

    covered_call: {
        calculate(prices, p, spot) {
            const K = spot * p.strike_pct / 100;
            const C = spot * p.premium_pct / 100;
            return prices.map(S => (S - spot) - Math.max(S - K, 0) + C);
        },
        keyPoints(p, spot) {
            const K = spot * p.strike_pct / 100;
            const C = spot * p.premium_pct / 100;
            return { breakEven: spot - C, maxProfit: (K - spot) + C, maxLoss: C - spot };
        },
        example(p, spot, ticker) {
            const K = spot * p.strike_pct / 100;
            const C = spot * p.premium_pct / 100;
            const maxProfit = (K - spot) + C;
            const be = spot - C;
            return [
                `You already own 100 shares of ${ticker} at ${$(spot)}. You sell one call option and immediately collect ${$(C)} per share (${$c(C)} total) in cash.`,
                `You keep that ${$c(C)} no matter what happens — it's yours the moment you sell.`,
                `If ${ticker} stays below ${$(K)} at expiration, the option expires and you keep your shares plus the ${$(C)} premium. Repeat next month.`,
                `If ${ticker} rises above ${$(K)}, your shares get sold at ${$(K)}. Your total gain is capped at ${$(maxProfit)}/share (price gain + premium).`,
                `Your break-even is ${$(be)} — below that, the premium softens but doesn't eliminate losses on your stock position.`,
            ];
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
            return { breakEven: K1 + net, maxProfit: (K2 - K1) - net, maxLoss: -net };
        },
        example(p, spot, ticker) {
            const K1 = spot * p.lower_strike_pct / 100;
            const K2 = spot * Math.max(p.upper_strike_pct, p.lower_strike_pct + 1) / 100;
            const net = spot * p.net_premium_pct / 100;
            const maxProfit = (K2 - K1) - net;
            const be = K1 + net;
            return [
                `You buy a call at ${$(K1)} and simultaneously sell a call at ${$(K2)}. The calls partially cancel out — your net cost is just ${$(net)}/share (${$c(net)} per contract).`,
                `That ${$(net)} is also your maximum loss. You can't lose more than what you paid, no matter what ${ticker} does.`,
                `If ${ticker} closes above ${$(K2)} at expiration, you hit maximum profit: ${$(maxProfit)}/share (${$c(maxProfit)} per contract). Above that, gains are capped.`,
                `${ticker} needs to reach ${$(be)} to break even — your lower strike plus the net premium paid.`,
                `Think of it as a cheaper long call. You gave up the unlimited upside in exchange for paying less upfront.`,
            ];
        },
    },
};
