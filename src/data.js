export const Data = {
  initialize() {
    this.currentAccountId = -1;

    this.accounts = [];
    this.accounts.id = -1;

    this.categories = [];
    this.categories.id = -1;

    this.payees = [];
    this.payees.id = -1;

    this.transactions = [];
    this.transactions.id = -1;
  },

  newTransaction(accountName, date, payeeName, categoryName, amount, notes) {
    const account = findOrCreate(this.accounts, accountName);
    const category = findOrCreate(this.categories, categoryName);
    const payee = findOrCreate(this.payees, payeeName);

    const transaction = {
      id: ++this.transactions.id,
      accountId: account.id,
      date,
      payeeId: payee.id,
      categoryId: category.id,
      amount,
      notes
    };

    this.transactions.push(transaction);

    return transaction;
  },

  loadTestData() {
    this.newTransaction("Checking", "2020-06-01", "Bob", "Rent", 600, "June");
    this.newTransaction(
      "Checking",
      "2020-06-06",
      "Colorado Springs Utilities",
      "Utilities",
      123.45,
      "May"
    );
    this.newTransaction(
      "Checking",
      "2020-06-16",
      "Credit Card",
      "Transfer",
      22.34
    );

    this.newTransaction(
      "Credit Card",
      "2020-06-05",
      "Subway",
      "Dining",
      12.34,
      "Turkey sub"
    );
    this.newTransaction(
      "Credit Card",
      "2020-06-16",
      "Sue",
      "Gas",
      10,
      "Road trip"
    );

    this.currentAccountId = 0;
  }
};

function findOrCreate(collection, name) {
  let item = collection.find(itm => itm.name === name);

  if (!item) {
    item = { id: ++collection.id, name };
    collection.push(item);
  }

  return item;
}
