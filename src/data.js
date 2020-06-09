export const Data = {
  initialize() {
    this.currentAccountId = 0;

    this.accounts = [{ id: 0, name: "Checking" }];
    this.accounts.id = 0;

    this.categories = [{ id: 0, name: "" }];
    this.categories.id = 0;

    this.payees = [{ id: 0, name: "" }];
    this.payees.id = 0;

    this.transactions = [{ id: 0, name: "" }];
    this.transactions.id = 0;
  },

  addTransaction(transaction) {
    transaction.id = ++this.transactions.id;

    this.transactions.push(transaction);
  },

  deleteTransaction(transaction) {
    const index = this.transactions
      .map(item => item.id)
      .indexOf(transaction.id);

    this.transactions.splice(index, 1);
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
    const data = this;

    function loadCollection(name) {
      const json = localStorage.getItem(name);

      if (json) {
        data[name] = JSON.parse(json);
        data[name].id = Math.max(...data[name].map(item => item.id));
      }
    }

    function loadInt(name) {
      const value = localStorage.getItem(name);

      if (value) {
        data[name] = parseInt(value, 10);
      }
    }

    loadCollection("accounts");
    loadCollection("categories");
    loadCollection("payees");
    loadCollection("transactions");
    loadInt("currentAccountId");
  }
};
