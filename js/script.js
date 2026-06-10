const inputAmountElement = document.querySelector('.currency__input');
const selectFromElement = document.querySelector('.currency__select--from');
const selectToElement = document.querySelector('.currency__select--to');
const outputResultElement = document.querySelector('.currency__output');
const api = "https://api.frankfurter.dev";

inputAmountElement.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const fromCurrency = selectFromElement.value;
    const toCurrency = selectToElement.value;
    const inputValue = event.target.value;

    fetch(`${api}/v2/rate/${fromCurrency}/${toCurrency}`)
      .then((response) => response.json())
      .then((data) => {
        let result = (inputValue * data.rate).toFixed(2);
        outputResultElement.value = result;
      });
  }
});