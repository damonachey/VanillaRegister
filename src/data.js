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

    this.load();
  },

  newTransaction(accountName, date, payeeName, categoryName, amount, notes) {
    const account = this.findOrCreate(this.accounts, accountName);
    const category = this.findOrCreate(this.categories, categoryName);
    const payee = this.findOrCreate(this.payees, payeeName);

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

  findOrCreate(collection, name) {
    let item = collection.find(itm => itm.name === name);

    if (!item) {
      item = { id: ++collection.id, name };
      collection.push(item);
    }

    return item;
  },

  save() {
    localStorage.setItem("accounts", JSON.stringify(this.accounts));
    localStorage.setItem("categories", JSON.stringify(this.categories));
    localStorage.setItem("payees", JSON.stringify(this.payees));
    localStorage.setItem("transactions", JSON.stringify(this.transactions));
    localStorage.setItem("currentAccountId", this.currentAccountId);
  },

  load() {
    function loadJSON(collectionName, data) {
      const json = localStorage.getItem(collectionName);

      if (json) {
        data[collectionName] = JSON.parse(json);
        data[collectionName].id = Math.max(
          ...data[collectionName].map(item => item.id)
        );
      }
    }

    loadJSON("accounts", this);
    loadJSON("categories", this);
    loadJSON("payees", this);
    loadJSON("transactions", this);
    this.currentAccountId = parseInt(
      localStorage.getItem("currentAccountId"),
      10
    );
  }
};
