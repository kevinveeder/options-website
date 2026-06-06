// app.js — UI logic, chart rendering, event wiring

let currentStrategy = null;
let currentSpot = 150;
let currentTicker = DEFAULT_TICKER;
let payoffChart = null;
let sliderValues = {};

// ── Init ────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    selectStrategy(Object.keys(SERVER_STRATEGIES)[0]);
    fetchPrice(DEFAULT_TICKER);
});

// ── Events ──────────────────────────────────────────────────────────────────

function bindEvents() {
    document.querySelectorAll(".strategy-btn").forEach(btn =>
        btn.addEventListener("click", () => selectStrategy(btn.dataset.strategy))
    );

    document.getElementById("fetch-price-btn").addEventListener("click", () => {
        const t = document.getElementById("ticker-input").value.trim().toUpperCase();
        if (t) fetchPrice(t);
    });

    document.getElementById("ticker-input").addEventListener("keypress", e => {
        if (e.key === "Enter") {
            const t = e.target.value.trim().toUpperCase();
            if (t) fetchPrice(t);
        }
    });

    document.querySelectorAll(".ticker-chip").forEach(chip =>
        chip.addEventListener("click", () => {
            document.getElementById("ticker-input").value = chip.dataset.ticker;
            fetchPrice(chip.dataset.ticker);
        })
    );
}

// ── Strategy selection ───────────────────────────────────────────────────────

function selectStrategy(key) {
    currentStrategy = key;
    const s = SERVER_STRATEGIES[key];

    document.querySelectorAll(".strategy-btn").forEach(btn =>
        btn.classList.toggle("active", btn.dataset.strategy === key)
    );

    document.getElementById("strategy-name").textContent = s.name;
    document.getElementById("strategy-hook").textContent = s.hook;
    document.getElementById("strategy-description").textContent = s.description;
    document.getElementById("mechanics-list").innerHTML =
        s.mechanics.map(m => `<li>${m}</li>`).join("");

    renderSliders(s.params);
    redraw();
}

// ── Sliders ──────────────────────────────────────────────────────────────────

function renderSliders(params) {
    const container = document.getElementById("sliders-container");
    container.innerHTML = "";
    sliderValues = {};

    params.forEach(param => {
        sliderValues[param.id] = param.default;

        const wrap = document.createElement("div");
        wrap.className = "slider-wrapper";
        wrap.innerHTML = `
            <div class="slider-header">
                <label for="${param.id}">${param.label}</label>
                <span class="slider-value" id="val-${param.id}"></span>
            </div>
            <input type="range"
                   id="${param.id}"
                   min="${param.min}" max="${param.max}"
                   step="${param.step}" value="${param.default}">
            <p class="slider-desc">${param.description}</p>
        `;
        container.appendChild(wrap);

        const slider = wrap.querySelector("input");
        slider.addEventListener("input", () => {
            sliderValues[param.id] = parseFloat(slider.value);
            refreshSliderLabel(param);
            redraw();
        });

        refreshSliderLabel(param);
    });
}

function refreshSliderLabel(param) {
    const el = document.getElementById(`val-${param.id}`);
    const v = sliderValues[param.id];
    if (param.format === "pct") {
        const dollars = (currentSpot * v / 100).toFixed(2);
        el.textContent = `${v}%  ($${dollars})`;
    } else {
        el.textContent = v;
    }
}

function refreshAllSliderLabels() {
    if (!currentStrategy) return;
    SERVER_STRATEGIES[currentStrategy].params.forEach(p => refreshSliderLabel(p));
}

// ── Price fetch ───────────────────────────────────────────────────────────────

async function fetchPrice(ticker) {
    const btn = document.getElementById("fetch-price-btn");
    btn.textContent = "Loading…";
    btn.disabled = true;

    try {
        const res = await fetch(`/api/price/${encodeURIComponent(ticker)}`);
        const data = await res.json();
        if (data.error) {
            showPriceState(ticker, null, data.error);
        } else {
            currentSpot = data.price;
            currentTicker = data.ticker;
            showPriceState(data.ticker, data.price, null);
            refreshAllSliderLabels();
            redraw();
        }
    } catch {
        showPriceState(ticker, null, "Network error");
    } finally {
        btn.textContent = "Get Price";
        btn.disabled = false;
    }
}

function showPriceState(ticker, price, error) {
    const display = document.getElementById("price-display");
    display.style.display = "flex";
    display.classList.toggle("error", !!error);
    display.querySelector(".ticker-name").textContent = ticker;
    display.querySelector(".ticker-price").textContent =
        error ? error : `$${price.toFixed(2)}`;
}

// ── Redraw all dynamic sections ───────────────────────────────────────────────

function redraw() {
    if (!currentStrategy) return;
    const calc = STRATEGIES[currentStrategy];
    if (!calc) return;

    const kp = calc.keyPoints(sliderValues, currentSpot);
    renderKeyPoints(kp);
    renderExample(calc);
    renderChart(kp.breakEven);
}

// ── Example walkthrough ───────────────────────────────────────────────────────

function renderExample(calc) {
    const steps = calc.example(sliderValues, currentSpot, currentTicker);

    document.getElementById("example-context").textContent =
        `With ${currentTicker} at $${currentSpot.toFixed(2)}:`;

    document.getElementById("example-steps").innerHTML =
        steps.map(s => `<li>${s}</li>`).join("");
}

// ── Key numbers ───────────────────────────────────────────────────────────────

function renderKeyPoints(kp) {
    const fmtMoney  = v => (typeof v === "string") ? v : `${v >= 0 ? "+" : ""}$${Math.abs(v).toFixed(2)}`;
    const fmtPrice  = v => (typeof v === "string") ? v : `$${v.toFixed(2)}`;
    const fmtBreakEven = be => Array.isArray(be)
        ? be.map(fmtPrice).join(" & ")
        : fmtPrice(be);

    document.getElementById("key-points").innerHTML = `
        <div class="key-point">
            <span class="key-label">Break-even at expiration</span>
            <span class="key-value">${fmtBreakEven(kp.breakEven)}</span>
        </div>
        <div class="key-point">
            <span class="key-label">Max profit</span>
            <span class="key-value profit">${fmtMoney(kp.maxProfit)}</span>
        </div>
        <div class="key-point">
            <span class="key-label">Max loss</span>
            <span class="key-value loss">${fmtMoney(kp.maxLoss)}</span>
        </div>
    `;
}

// ── Chart ─────────────────────────────────────────────────────────────────────

function renderChart(breakEven) {
    const calc = STRATEGIES[currentStrategy];
    const range = PRICE_RANGE_PCT;
    const minP = currentSpot * (1 - range);
    const maxP = currentSpot * (1 + range);
    const n = CHART_POINTS;

    const prices = Array.from({ length: n + 1 }, (_, i) => minP + (maxP - minP) * i / n);
    const payoffs = calc.calculate(prices, sliderValues, currentSpot);

    const ctx = document.getElementById("payoff-chart").getContext("2d");
    if (payoffChart) { payoffChart.destroy(); payoffChart = null; }

    payoffChart = new Chart(ctx, {
        type: "line",
        data: {
            datasets: [{
                data: prices.map((x, i) => ({ x, y: payoffs[i] })),
                borderColor: "#2563eb",
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.1,
                fill: {
                    target: { value: 0 },
                    above: "rgba(22, 163, 74, 0.12)",
                    below: "rgba(220, 38, 38, 0.12)",
                },
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 150 },
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: ctx => `Stock: $${ctx[0].parsed.x.toFixed(2)}`,
                        label: ctx => {
                            const v = ctx.parsed.y;
                            return ` P/L: ${v >= 0 ? "+" : ""}$${v.toFixed(2)} per share`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    type: "linear",
                    ticks: { maxTicksLimit: 7, callback: v => `$${v.toFixed(0)}` },
                    grid: { color: "rgba(0,0,0,0.05)" },
                    title: { display: true, text: "Stock Price at Expiration" },
                },
                y: {
                    ticks: { callback: v => `$${v.toFixed(0)}` },
                    grid: { color: "rgba(0,0,0,0.05)" },
                    title: { display: true, text: "Profit / Loss (per share)" },
                },
            },
        },
        plugins: [annotationPlugin(currentSpot, breakEven)],
    });
}

function annotationPlugin(spot, breakEven) {
    return {
        id: "annotations",
        afterDraw(chart) {
            const { ctx, scales: { x, y } } = chart;
            drawVLine(ctx, x, y, spot, "#6b7280", `Now $${spot.toFixed(0)}`);
            const bes = Array.isArray(breakEven) ? breakEven : [breakEven];
            bes.forEach(be => {
                if (typeof be === "number") {
                    drawVLine(ctx, x, y, be, "#f59e0b", `B/E $${be.toFixed(0)}`, true);
                }
            });
            drawHLine(ctx, x, y, 0);
        },
    };
}

function drawVLine(ctx, xScale, yScale, value, color, label, dashed = false) {
    const xPx = xScale.getPixelForValue(value);
    if (xPx < xScale.left || xPx > xScale.right) return;
    ctx.save();
    ctx.beginPath();
    if (dashed) ctx.setLineDash([6, 4]);
    ctx.moveTo(xPx, yScale.top);
    ctx.lineTo(xPx, yScale.bottom);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = color;
    ctx.font = "bold 10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, xPx, yScale.top - 5);
    ctx.restore();
}

function drawHLine(ctx, xScale, yScale, value) {
    const yPx = yScale.getPixelForValue(value);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(xScale.left, yPx);
    ctx.lineTo(xScale.right, yPx);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.stroke();
    ctx.restore();
}
