const inputAmountElement = document.querySelector('.currency__input');
const selectFromElement = document.querySelector('.currency__select--from');
const selectToElement = document.querySelector('currency__select--to');
const outputResultElement = document.querySelector('.currency__output');

function convert(base, quote, amount) {
  const api = "https://api.frankfurter.dev";
  return fetch(`${api}/v2/rate/${base}/${quote}`)
    .then((response) => response.json())
    .then((d) => {
        let result = (amount * d.rate).toFixed(2);
        return result
    });
}
