const inputAmountElement = document.querySelector('.currency__input');
const selectFromElement = document.querySelector('.currency__select--from');
const selectToElement = document.querySelector('.currency__select--to');
const outputResultElement = document.querySelector('.currency__output');
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

inputAmountElement.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    makeRequest(selectFromElement.value, selectToElement.value, event.target.value)
  }
});

selectFromElement.addEventListener('change', () => {
  makeRequest(selectFromElement.value, selectToElement.value, inputAmountElement.value)
});

selectToElement.addEventListener('change', () => {
  makeRequest(selectFromElement.value, selectToElement.value, inputAmountElement.value)
});

function incrementValue() {
  inputAmountElement.value++
}

function decrementValue() {
  inputAmountElement.value--
}