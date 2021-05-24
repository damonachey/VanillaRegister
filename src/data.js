import { Utilities } from "./utilities.js";

export const Data = {
  initialize() {
    this.accounts = [];
    this.categories = [];
    this.payees = [];

    this.accounts[0] = { id: 0, name: "Checking", transactions: [] };
    this.accounts[1] = { id: 1, name: "Credit card", transactions: [] };
    this.categories[0] = { id: 0, name: "Initial Balance" };
    this.payees[0] = { id: 0, name: "Initial Balance" };

    this.currentAccountId = this.accounts[0].id;

    this.accounts[0].transactions[0] = {
      id: 0,
      accountId: 0,
      date: Utilities.today(),
      payeeId: 0,
      status: "",
      categoryId: 0,
      amount: 1000,
      note: ""
    };

    this.categories[1] = { id: 1, name: "Entertainment" };
    this.payees[1] = { id: 1, name: "Netflix" };
    this.accounts[0].transactions[1] = {
      id: 1,
      accountId: 0,
      date: "2020-06-15",
      payeeId: 1,
      status: "R",
      categoryId: 1,
      amount: -15,
      note: ""
    };
  },

  save() {
    localStorage.setItem("data", JSON.stringify(this));
  },

  load() {
    const json = localStorage.getItem("data");

    if (json) {
      const data = JSON.parse(json);

      for (const property in data) {
        this[property] = data[property];
      }
    }

    validateAll(this);
  }
};

function validateAll(data) {
  for (let i = 0; i < data.accounts.length; i++) {
    if (data.accounts[i].id !== i) {
      alert(`Error: accounts[${i}].id is ${data.accounts[i].id}`);
    }

    for (let j = 0; j < data.accounts[i].transactions.length; j++) {
      if (data.accounts[i].transactions[j].id !== j) {
        alert(
          `Error: accounts[${i}].transactions[${j}].id is ${
            data.accounts[i].transactions[j].id
          }`
        );
      }
    }
  }

  for (let i = 0; i < data.categories.length; i++) {
    if (data.categories[i].id !== i) {
      alert(`Error: categories[${i}].id is ${data.categories[i].id}`);
    }
  }

  for (let i = 0; i < data.payees.length; i++) {
    if (data.payees[i].id !== i) {
      alert(`Error: payees[${i}].id is ${data.payees[i].id}`);
    }
  }
}
