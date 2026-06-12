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

function incrementValue() {
  inputAmountElement.value++
}

function decrementValue() {
  inputAmountElement.value = Math.max(0, inputAmountElement.value - 1)
}

const themeSwitchElement = document.querySelector('.theme-switch')

if (localStorage.getItem('darkmode') === 'active') {
  document.body.classList.add('darkmode')
}

themeSwitchElement.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('darkmode')
  localStorage.setItem('darkmode', isDark ? 'active' : 'inactive')
})