export const Utilities = {
  formatCurrency(value) {
    return currency.format(value);
  },

  validateDate(dateStr) {
    const match = dateStr.match(
      /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/
    );

    if (!match) return false;

    const year = parseInt(match.groups["year"], 10);
    const month = parseInt(match.groups["month"], 10);
    const day = parseInt(match.groups["day"], 10);

    if (year < 2000 || year > 2999) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    return true;
  }
};

var currency = new Intl.NumberFormat("en-US", {
  //style: "currency",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  currency: "USD"
});
