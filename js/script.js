const inputAmountElement = document.querySelector('.currency__input');
const selectFromElement = document.querySelector('.currency__select--from');
const selectToElement = document.querySelector('.currency__select--to');
const outputResultElement = document.querySelector('.currency__output');
const currencyButtonElement = document.querySelector('.currency__button')
const api = "https://api.frankfurter.dev";

inputAmountElement.addEventListener('input', (event) => {
  const regex = /^(\d+)\.(\d{2})\d+/;
  
  if (regex.test(event.target.value)) {
    event.target.value = event.target.value.replace(regex, '$1.$2');
  }
})

inputAmountElement.addEventListener('focus', () => {
  inputAmountElement.value = ''
})

inputAmountElement.addEventListener('beforeinput', (event) => {
  if (event.data === '+' || event.data === '-') {
    event.preventDefault();
  }
})

function makeRequest (fromCurrency, toCurrency, inputValue) {
  let amount = parseFloat(inputValue);
  
  if (isNaN(amount)) {
    amount = 0;
  }

  if (fromCurrency === toCurrency) {
    outputResultElement.value = amount.toFixed(2);
    return Promise.resolve();
  }

  
  outputResultElement.value = 'Загрузка...' 

  return fetch(`${api}/v2/rate/${fromCurrency}/${toCurrency}`)
      .then((response) => response.json())
      .then((data) => {
         const spaceFormatter = new Intl.NumberFormat('fr-FR')
        let result = spaceFormatter.format((amount * data.rate).toFixed(2));
        outputResultElement.value = result;
      })
      .catch((error) => {
        console.error('Ошибка API:', error.message);
        outputResultElement.value = 'Ошибка загрузки данных';
      });
}

const handleConversionAndSave = async() => {
  await makeRequest(selectFromElement.value, selectToElement.value, inputAmountElement.value)
  saveCurrencies()
}

currencyButtonElement.addEventListener('click', handleConversionAndSave)
selectFromElement.addEventListener('change', handleConversionAndSave)
selectToElement.addEventListener('change', handleConversionAndSave)

const dynamicHistoryList = document.querySelector('.conversion-history__list--dynamic')
const originalHistoryList = document.querySelector('.conversion-history__list--original')
const historyItemElement = document.querySelector('.conversion-history__item')
const clearAllButton = document.querySelector('.conversion-history__clear-all')
const deleteButton = document.querySelector('.conversion-history__delete-btn')

const savedNewElements = JSON.parse(localStorage.getItem('currenciesList') || '[]');

if (savedNewElements.length > 0) {
  originalHistoryList.classList.add('hidden')
} else {
  originalHistoryList.classList.remove('hidden')
}

function saveCurrencies () {
  originalHistoryList.classList.add('hidden')
  const currencies = JSON.parse(localStorage.getItem('currenciesList')) || []

  currencies.push({ id: 'id-' + Date.now() + '-' + Math.floor(Math.random() * 1000), fromCurrency: `${inputAmountElement.value} ${selectFromElement.value}`, toCurrency: `${outputResultElement.value} ${selectToElement.value}`});

  localStorage.setItem('currenciesList', JSON.stringify(currencies))

  renderCurrencyList()
}

function renderCurrencyList() {
  const currenciesArr = JSON.parse(localStorage.getItem('currenciesList') || '[]').slice(-5)
  let currencyListContent = '';
  for (const {id, fromCurrency, toCurrency} of currenciesArr) {
    currencyListContent += `<li class="conversion-history__item" data-id="${id}">
                              <div class="conversion-history__item-content">
                                <span class="conversion-history__text">${fromCurrency} <span class="conversion-history__arrow">&#10142;</span> ${toCurrency}</span>
                                <span class="conversion-history__delete-btn">&#10005;</span>
                              </div>
                            </li>`
  }

  dynamicHistoryList.innerHTML = currencyListContent
}

function clearAllList() {
  const keys = Object.keys(localStorage);

  keys.forEach(key => {
    if (key !== 'darkmode') {
      localStorage.removeItem(key)
    }
  })

  if (dynamicHistoryList) {
    dynamicHistoryList.innerHTML = '';
  }

  originalHistoryList.classList.remove('hidden')
}

clearAllButton.addEventListener('click', clearAllList)

dynamicHistoryList.addEventListener('click', (event) => {
  if (event.target.classList.contains('conversion-history__delete-btn')) {
    const item = event.target.closest('.conversion-history__item')
    const idToRemove = item.getAttribute('data-id')

    let currenciesArr = JSON.parse(localStorage.getItem('currenciesList') || '[]');

    currenciesArr = currenciesArr.filter(curr => String(curr.id) !== idToRemove);

    localStorage.setItem('currenciesList', JSON.stringify(currenciesArr));

    renderCurrencyList();

    if (dynamicHistoryList.children.length === 0) {
      originalHistoryList.classList.remove('hidden')
    }
  }
})

renderCurrencyList()

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

function fetchHistoricalRates(baseCurrency) {
  const currentDate = new Date();
  const pastDate = new Date();
  pastDate.setMonth(pastDate.getMonth() - 1)

  const formatDateForAPI = (date) => date.toISOString().split('T')[0];
  const startDateStr = formatDateForAPI(pastDate);
  const endDateStr = formatDateForAPI(currentDate);

  const loadingChartElement = document.getElementById('chartLoading')
  const historyCanvasElement = document.getElementById('historyChart');
  if (loadingChartElement) loadingChartElement.style.display = 'block'
  if (historyCanvasElement) historyCanvasElement.style.opacity = '0.3'

  fetch(`https://api.frankfurter.dev/v2/rates?from=${startDateStr}&to=${endDateStr}&quotes=${baseCurrency}`)
  .then((response) => response.json())
  .then((data) => {
    const dates = data.map(item => item.date)
    const rates = data.map(item => item.rate)
    
    if (loadingChartElement) loadingChartElement.style.display = 'none';
    if (historyCanvasElement) historyCanvasElement.style.opacity = '1'

    renderChart(dates,rates)
  })
  .catch((error) => {
    console.error('Ошибка API:', error.message);
    if (loadingChartElement) loadingChartElement.innerText = 'Ошибка загрузки данных'
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

const updateCurrencyForChart = () => {
  fetchHistoricalRates(historySelectElement.value)
}

const historySelectElement = document.querySelector('.currency__select--history')

historySelectElement.addEventListener('change', updateCurrencyForChart)

updateCurrencyForChart(); 