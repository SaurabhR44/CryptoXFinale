const themeBtn = document.querySelector('.nav__theme-btn')
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    if (document.body.classList.contains('dark-theme')) {
        themeBtn.innerHTML = `<i class="uil uil-sun"></i>`;
        localStorage.setItem('currentTheme', 'dark-theme');
    } else {
        themeBtn.innerHTML = `<i class="uil uil-moon"></i>`;
        localStorage.setItem('currentTheme', '');
    }
})
document.body.className = localStorage.getItem('currentTheme')
if (document.body.classList.contains('dark-theme')) {
    themeBtn.innerHTML = `<i class="uil uil-sun"></i>`;
    localStorage.setItem('currentTheme', 'dark-theme');
} else {
    themeBtn.innerHTML = `<i class="uil uil-moon"></i>`;
    localStorage.setItem('currentTheme', '');
}
/*Sidebar Interaction*/
const sidebar = document.querySelector('.sidebar')
const closeSidebarBtn = document.querySelector('.sidebar__close-btn')
const OpenSidebarBtn = document.querySelector('.nav__menu-btn')
OpenSidebarBtn.addEventListener('click', () => {
    sidebar.style.display = 'flex';
})
closeSidebarBtn.addEventListener('click', () => {
    sidebar.style.display = 'none';
})

const chart = document.querySelector("#chart").getContext("2d");
let myChart;
const labels = [];
const btcData = [];
const ethData = [];
const ltcData = [];
const dotData = [];
function showLoading() {
    document.getElementById("loading").style.display = "block";
}

function hideLoading() {
    document.getElementById("loading").style.display = "none";
}
async function fetchHistoricalData() {
    showLoading();
    try {
        const btcResponse = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7");
        const btcHistory = await btcResponse.json();
        const ethResponse = await fetch("https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7");
        const ethHistory = await ethResponse.json();
        const ltcResponse = await fetch("https://api.coingecko.com/api/v3/coins/litecoin/market_chart?vs_currency=usd&days=7");
        const ltcHistory = await ltcResponse.json();
        const dotResponse = await fetch("https://api.coingecko.com/api/v3/coins/polkadot/market_chart?vs_currency=usd&days=7");
        const dotHistory = await dotResponse.json();
        btcHistory.prices.forEach(([timestamp, price]) => {
            const time = new Date(timestamp).toLocaleDateString();
            labels.push(time);
            btcData.push(price);
        });


        ethHistory.prices.forEach(([timestamp, price]) => {
            ethData.push(price);
        });
        ltcHistory.prices.forEach(([timestamp, price]) => {
            ltcData.push(price);
        });

        dotHistory.prices.forEach(([timestamp, price]) => {
            dotData.push(price);
        });
        initializeChart();
    } catch (error) {
        console.error("Error fetching historical data:", error);
        alert("Failed to fetch data, please try again later.");
    } finally {
        hideLoading();
    }
}

async function fetchRealTimeData() {
    try {
        const btcResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
        const btcDataResponse = await btcResponse.json();

        const ethResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        const ethDataResponse = await ethResponse.json();

        const ltcResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=litecoin&vs_currencies=usd");
        const ltcDataResponse = await ltcResponse.json();

        const dotResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=polkadot&vs_currencies=usd");
        const dotDataResponse = await dotResponse.json();

        const currentTime = new Date().toLocaleTimeString();
        labels.push(currentTime);
        if (labels.length > 15) labels.shift();

        btcData.push(btcDataResponse.bitcoin.usd);
        if (btcData.length > 15) btcData.shift();

        ethData.push(ethDataResponse.ethereum.usd);
        if (ethData.length > 15) ethData.shift();

        ltcData.push(ltcDataResponse.litecoin.usd);
        if (ltcData.length > 15) ltcData.shift();

        dotData.push(dotDataResponse.polkadot.usd);
        if (dotData.length > 15) dotData.shift();
        myChart.update();
    } catch (error) {
        console.error("Error fetching real-time data:", error);
    }
}

function initializeChart() {
    myChart = new Chart(chart, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'BTC',
                    data: btcData,
                    borderColor: "red",
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 3,
                },
                {
                    label: 'ETH',
                    data: ethData,
                    borderColor: "blue",
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 3,
                },
                {
                    label: 'LTC',
                    data: ltcData,
                    borderColor: "orange",
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 3,
                },
                {
                    label: 'DOT',
                    data: dotData,
                    borderColor: "purple",
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 3,
                }
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time',
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price (USD)',
                    },
                    beginAtZero: false,
                },
            },
        },
    });

    setInterval(fetchRealTimeData, 30000);
}

fetchHistoricalData();