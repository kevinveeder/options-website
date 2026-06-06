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

    long_straddle: {
        calculate(prices, p, spot) {
            const K   = spot * p.strike_pct / 100;
            const tot = spot * p.total_premium_pct / 100;
            return prices.map(S => Math.abs(S - K) - tot);
        },
        keyPoints(p, spot) {
            const K   = spot * p.strike_pct / 100;
            const tot = spot * p.total_premium_pct / 100;
            return {
                breakEven: [K - tot, K + tot],
                maxProfit: "Unlimited",
                maxLoss: -tot,
            };
        },
        example(p, spot, ticker) {
            const K   = spot * p.strike_pct / 100;
            const tot = spot * p.total_premium_pct / 100;
            return [
                `You buy both a call and a put on ${ticker} at the ${$(K)} strike, paying ${$(tot)}/share (${$c(tot)} per contract) total.`,
                `That ${$(tot)} is your entire maximum loss — it happens if ${ticker} closes exactly at ${$(K)} on expiration day.`,
                `To profit going up, ${ticker} must close above ${$(K + tot)} — your strike plus what you paid.`,
                `To profit going down, ${ticker} must close below ${$(K - tot)} — your strike minus what you paid.`,
                `The further ${ticker} moves from ${$(K)} in either direction, the more you make. Direction doesn't matter — magnitude does.`,
            ];
        },
    },

    long_strangle: {
        calculate(prices, p, spot) {
            const Kc  = spot * p.call_strike_pct / 100;
            const Kp  = spot * p.put_strike_pct / 100;
            const tot = spot * p.total_premium_pct / 100;
            return prices.map(S => Math.max(S - Kc, 0) + Math.max(Kp - S, 0) - tot);
        },
        keyPoints(p, spot) {
            const Kc  = spot * p.call_strike_pct / 100;
            const Kp  = spot * p.put_strike_pct / 100;
            const tot = spot * p.total_premium_pct / 100;
            return {
                breakEven: [Kp - tot, Kc + tot],
                maxProfit: "Unlimited",
                maxLoss: -tot,
            };
        },
        example(p, spot, ticker) {
            const Kc  = spot * p.call_strike_pct / 100;
            const Kp  = spot * p.put_strike_pct / 100;
            const tot = spot * p.total_premium_pct / 100;
            return [
                `You buy an OTM call at ${$(Kc)} and an OTM put at ${$(Kp)}, paying ${$(tot)}/share (${$c(tot)} per contract) total.`,
                `Both options are out-of-the-money, so they're cheaper than a straddle — but ${ticker} needs a bigger move to profit.`,
                `Maximum loss is ${$(tot)}/share — this happens if ${ticker} closes anywhere between ${$(Kp)} and ${$(Kc)} at expiration.`,
                `To profit to the upside, ${ticker} must close above ${$(Kc + tot)}.`,
                `To profit to the downside, ${ticker} must close below ${$(Kp - tot)}.`,
            ];
        },
    },

    iron_condor: {
        calculate(prices, p, spot) {
            const Ksp = spot * p.lower_pct / 100;
            const Klp = spot * (p.lower_pct - p.wing_pct) / 100;
            const Ksc = spot * p.upper_pct / 100;
            const Klc = spot * (p.upper_pct + p.wing_pct) / 100;
            const cr  = spot * p.net_credit_pct / 100;
            return prices.map(S =>
                cr
                - Math.max(Ksp - S, 0) + Math.max(Klp - S, 0)
                - Math.max(S - Ksc, 0) + Math.max(S - Klc, 0)
            );
        },
        keyPoints(p, spot) {
            const Ksp = spot * p.lower_pct / 100;
            const Ksc = spot * p.upper_pct / 100;
            const wing = spot * p.wing_pct / 100;
            const cr   = spot * p.net_credit_pct / 100;
            return {
                breakEven: [Ksp - cr, Ksc + cr],
                maxProfit: cr,
                maxLoss: -(wing - cr),
            };
        },
        example(p, spot, ticker) {
            const Ksp  = spot * p.lower_pct / 100;
            const Klp  = spot * (p.lower_pct - p.wing_pct) / 100;
            const Ksc  = spot * p.upper_pct / 100;
            const Klc  = spot * (p.upper_pct + p.wing_pct) / 100;
            const cr   = spot * p.net_credit_pct / 100;
            const wing = spot * p.wing_pct / 100;
            return [
                `You collect ${$(cr)}/share (${$c(cr)} per contract) upfront by selling a put at ${$(Ksp)} and a call at ${$(Ksc)}. That credit is yours to keep no matter what.`,
                `To protect yourself, you buy a put at ${$(Klp)} and a call at ${$(Klc)}. These cap your loss if ${ticker} moves too far.`,
                `If ${ticker} closes anywhere between ${$(Ksp)} and ${$(Ksc)} at expiration, all four options expire worthless — you keep the full ${$(cr)}/share.`,
                `Your break-even points are ${$(Ksp - cr)} on the downside and ${$(Ksc + cr)} on the upside. Outside those, you lose.`,
                `Maximum loss is ${$(wing - cr)}/share — it hits if ${ticker} goes below ${$(Klp)} or above ${$(Klc)}. The wings are your safety net.`,
            ];
        },
    },
};
