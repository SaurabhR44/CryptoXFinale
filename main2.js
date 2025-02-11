// Wait for the page to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    let priceChart = new Chart(document.getElementById('priceChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Bitcoin',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }, {
                label: 'Ethereum',
                data: [],
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });

    let marketCapChart = new Chart(document.getElementById('marketCapChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Market Cap (Billion USD)',
                data: [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                ],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });

    let volumeChart = new Chart(document.getElementById('volumeChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '24h Volume (Billion USD)',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });

    // Function to fetch data from CoinGecko API
    async function fetchData() {
        try {
            let response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false');
            let data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Function to update charts and other elements
    function updateData(data) {
        // Update price chart
        let bitcoin = data.find(coin => coin.id === 'bitcoin');
        let ethereum = data.find(coin => coin.id === 'ethereum');
        let currentTime = new Date().toLocaleTimeString();

        priceChart.data.labels.push(currentTime);
        priceChart.data.datasets[0].data.push(bitcoin.current_price);
        priceChart.data.datasets[1].data.push(ethereum.current_price);

        if (priceChart.data.labels.length > 10) {
            priceChart.data.labels.shift();
            priceChart.data.datasets[0].data.shift();
            priceChart.data.datasets[1].data.shift();
        }
        priceChart.update();

        // Update market cap chart
        let top5 = data.slice(0, 5);
        marketCapChart.data.labels = top5.map(coin => coin.symbol.toUpperCase());
        marketCapChart.data.datasets[0].data = top5.map(coin => coin.market_cap / 1e9);
        marketCapChart.update();

        // Update volume chart
        let totalVolume = data.reduce((sum, coin) => sum + coin.total_volume, 0) / 1e9;
        volumeChart.data.labels.push(currentTime);
        volumeChart.data.datasets[0].data.push(totalVolume);
        if (volumeChart.data.labels.length > 10) {
            volumeChart.data.labels.shift();
            volumeChart.data.datasets[0].data.shift();
        }
        volumeChart.update();

        // Update Fear and Greed Index (simulated)
        let fearGreedIndex = Math.floor(Math.random() * 100);
        document.getElementById('fearGreedValue').textContent = fearGreedIndex;
        document.getElementById('fearGreedText').textContent = fearGreedIndex > 50 ? 'Greed' : 'Fear';

        // Update Top Gainers and Losers
        let sortedByChange = [...data].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
        let topGainers = sortedByChange.slice(0, 3);
        let topLosers = sortedByChange.slice(-3).reverse();

        updateList('topGainers', topGainers, coin => `${coin.symbol.toUpperCase()}: +${coin.price_change_percentage_24h.toFixed(2)}%`);
        updateList('topLosers', topLosers, coin => `${coin.symbol.toUpperCase()}: ${coin.price_change_percentage_24h.toFixed(2)}%`);

        // Update News (simulated)
        let simulatedNews = [
            { title: "Bitcoin reaches new all-time high", sentiment: "Positive" },
            { title: "Ethereum 2.0 launch date announced", sentiment: "Neutral" },
            { title: "Regulatory concerns impact crypto market", sentiment: "Negative" },
            { title: "Major company adds Bitcoin to balance sheet", sentiment: "Positive" },
            { title: "New DeFi protocol gains traction", sentiment: "Positive" }
        ];
        updateList('newsList', simulatedNews, item => `${item.title} - Sentiment: ${item.sentiment}`);
    }

    // Helper function to update lists
    function updateList(elementId, data, formatter) {
        let listElement = document.getElementById(elementId);
        listElement.innerHTML = '';
        data.forEach(item => {
            let li = document.createElement('li');
            li.textContent = formatter(item);
            listElement.appendChild(li);
        });
    }

    // Function to fetch and update data periodically
    async function updateDataPeriodically() {
        let data = await fetchData();
        if (data) {
            updateData(data);
        }
    }

    // Initial data fetch and update
    updateDataPeriodically();

    // Set interval for periodic updates (every 1 minute)
    setInterval(updateDataPeriodically, 60000);
});

// Theme switcher functionality
let themeBtn = document.querySelector('.nav__theme-btn');
themeBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    if (document.body.classList.contains('dark-theme')) {
        themeBtn.innerHTML = '<i class="uil uil-sun"></i>';
        localStorage.setItem('currentTheme', 'dark-theme');
    } else {
        themeBtn.innerHTML = '<i class="uil uil-moon"></i>';
        localStorage.setItem('currentTheme', '');
    }
});

// Apply saved theme
document.body.className = localStorage.getItem('currentTheme');
if (document.body.classList.contains('dark-theme')) {
    themeBtn.innerHTML = '<i class="uil uil-sun"></i>';
} else {
    themeBtn.innerHTML = '<i class="uil uil-moon"></i>';
}