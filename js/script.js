const inputAmountElement = document.querySelector('.currency__input');
const selectFromElement = document.querySelector('.currency__select--from');
const selectToElement = document.querySelector('.currency__select--to');
const outputResultElement = document.querySelector('.currency__output');
const currencyButtonElement = document.querySelector('.currency__button')
const api = "https://api.frankfurter.dev";

function makeRequest (fromCurrency, toCurrency, inputValue) {
  let amount = parseFloat(inputValue);
  
  if (isNaN(amount)) {
    amount = 0;
  }

  if (fromCurrency === toCurrency) {
    outputResultElement.value = amount.toFixed(2);
    return;
  }

  fetch(`${api}/v2/rate/${fromCurrency}/${toCurrency}`)
      .then((response) => response.json())
      .then((data) => {
        let result = (amount * data.rate).toFixed(2);
        outputResultElement.value = result;
      })
      .catch((error) => {
        console.error('Ошибка API:', error.message);
        outputResultElement.value = 'Ошибка';
      });
}

const updateConversion = () => {
  makeRequest(selectFromElement.value, selectToElement.value, inputAmountElement.value)
}

currencyButtonElement.addEventListener('click', updateConversion)
selectFromElement.addEventListener('change', updateConversion);
selectToElement.addEventListener('change', updateConversion);

const currencySpinUpElement = document.querySelector('.currency__spin-btn--up');
const currencySpinDownElement = document.querySelector('.currency__spin-btn--down');

function incrementValue() {
  inputAmountElement.value++
}

function decrementValue() {
  inputAmountElement.value = Math.max(0, inputAmountElement.value - 1)
}

currencySpinUpElement.addEventListener('click', incrementValue)
currencySpinDownElement.addEventListener('click', decrementValue)

const currencySwapElement = document.querySelector('.currency__swap-icon-wrapper')

function swapCurrencies() {
  [selectFromElement.value, selectToElement.value] = [selectToElement.value, selectFromElement.value];
  makeRequest(selectFromElement.value, selectToElement.value, inputAmountElement.value);
}

currencySwapElement.addEventListener('click', swapCurrencies)

const themeSwitchElement = document.querySelector('.theme-switch')

if (localStorage.getItem('darkmode') === 'active') {
  document.body.classList.add('darkmode')
}

themeSwitchElement.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('darkmode')
  localStorage.setItem('darkmode', isDark ? 'active' : 'inactive')
  updateChartTheme()
})

let currencyChartInstance = null; 

function fetchHistoricalRates(fromCurrency) {
  const currentDate = new Date();
  const pastDate = new Date();
  pastDate.setMonth(pastDate.getMonth() - 1)

  const formatDateForAPI = (date) => date.toISOString().split('T')[0];
  const startDateStr = formatDateForAPI(pastDate);
  const endDateStr = formatDateForAPI(currentDate);

  fetch(`https://api.frankfurter.dev/v2/rates?from=${startDateStr}&to=${endDateStr}&quotes=${fromCurrency}`)
  .then((response) => response.json())
  .then((data) => {
    const dates = data.map(item => item.date)
    const rates = data.map(item => item.rate)
    console.log(rates)
    console.log(dates)
    renderChart(dates,rates)
  })
  .catch((error) => {
    console.error('Ошибка API:', error.message);
  });
}

function getThemeColor(variableName) {
  return getComputedStyle(document.body)
    .getPropertyValue(variableName)
    .trim();
}

function updateChartTheme() {
  if (currencyChartInstance) {
    const freshColor = getThemeColor('--color-button');
    
    currencyChartInstance.data.datasets[0].backgroundColor = freshColor;
    currencyChartInstance.data.datasets[0].borderColor = freshColor;
    
    currencyChartInstance.update();
  }
}

function renderChart(chartLabels, chartData) {
  const ctx = document.getElementById('historyChart');
  if (!ctx) return;

  if (currencyChartInstance) {
    currencyChartInstance.destroy();
  }

  const themeColor = getThemeColor('--color-button');

  currencyChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: [{
        label: 'Курс валют к EUR',
        data: chartData,
        backgroundColor: themeColor,
        borderColor: themeColor,
        borderWidth: 2,
        fill: false,
        pointRadius: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            tooltipFormat: 'dd.MM.yyyy',
            displayFormats: {
              day: 'dd.MM'
            }
          },
          ticks: {
            stepSize: 5
          },
          title: {
            display: true,
            text: 'Дата'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Курс'
          }
        }
      },
      plugins: {
        tooltip: {
          intersect: false,
          mode: 'index'
        }
      }
    }
  });
}

fetchHistoricalRates('USD');