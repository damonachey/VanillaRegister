import "./view.css";

import { Utilities } from "./utilities";

export const View = {
  initialize(name, data) {
    this.app = name;
    this.data = data;

    initializeEdit();
  },

  display() {
    const app = document.getElementById(this.app);

    app.innerHTML = `
      <div class="flex-container">
        <div class="flex-child accounts">
          <h3>Accounts</h3>
          <ul class="accountList"></ul>
        </div>
        <div class="flex-child transactions">
          <h3>Account: <span class="accountName"></span></h3>
          <table class="transactionTable">
            <thead>
              <tr>
                <th class="clickable">Date ↕</th>
                <th class="clickable">Payee ↕</th>
                <th class="clickable">Status ↕</th>
                <th class="clickable">Category ↕</th>
                <th class="clickable">Amount ↕</th>
                <th class="">Balance</th>
                <th class="clickable">Note ↕</th>
                <th></th>
              </tr>
            </thead>
            <tbody></tbody>
            <tfoot><td colspan="100"></td></tfoot>
          </table>
          <span class="future">(double click a field to edit)</span>
        </div>
      </div>
      <div>
        <div class="management">
        <!--
          <button id="manageAccounts" class="button">Manage: Accounts</button>
          <button id="manageCategories" class="button">Manage: Categories</button>
          <button id="managePayees" class="button">Manage: Payees</button> -->
          <button id="resetRegister" class="button warning">Reset Register</button>
        </div>
      </div>
    `;

    populateAccounts(app, this.data);
    populateTransactions(app, this.data);
    initializeManagement(this.data);
  }
};

function populateAccounts(app, data) {
  const accountList = app.querySelector(`.accounts .accountList`);

  for (const account of data.accounts) {
    const li = document.createElement("li");

    li.textContent = `${account.name}`;
    li.setAttribute("id", account.id);

    if (data.currentAccountId === account.id) {
      li.classList.add("selected");
    }

    li.classList.add("accountName");
    li.classList.add("clickable");
    li.onclick = () => {
      data.currentAccountId = account.id;
      View.display();
    };

    accountList.appendChild(li);
  }
}

function getBalances(data) {
  let balance = 0;
  const balances = [];
  const account = data.accounts[data.currentAccountId];

  // TODO: sort by date

  for (const transaction of account.transactions) {
    balance += transaction.amount;
    balances[transaction.id] = balance;
  }

  return balances;
}

function populateTransactions(app, data) {
  const balances = getBalances(data);

  // TODO: sort by prefered sort

  const accountName = app.querySelector(`.transactions .accountName`);
  const tableBody = app.querySelector(`.transactions .transactionTable tbody`);

  const account = data.accounts[data.currentAccountId];
  accountName.textContent = account.name;

  const today = Utilities.today();

  for (const transaction of account.transactions) {
    const tr = document.createElement("tr");

    tr.innerHTML = `
        ${formatTransactionTDs(data, transaction, balances)}
        <td class="clickable deleteable">✖</td>
      `;

    tr.setAttribute("id", transaction.id);
    tr.setAttribute("accountId", transaction.accountId);

    tr.classList.add("transaction");

    if (transaction.date > today) {
      tr.classList.add("future");
    }

    for (const child of tr.children) {
      if (child.classList.contains("editable")) {
        child.ondblclick = () => editTransaction(data, tr, child, transaction);
      }

      if (child.classList.contains("deleteable")) {
        child.onclick = () => deleteTransaction(data, tr, transaction);
      }
    }

    tableBody.appendChild(tr);
  }

  const row = document.createElement("tr");

  row.innerHTML = `
      ${formatTransactionTDs(data, {})}
      <td class="clickable newable" style="font-weight: 900;">🗋</td>
    `;

  for (const child of row.children) {
    if (child.classList.contains("editable")) {
      child.ondblclick = () => editTransaction(data, row, child);
    }

    if (child.classList.contains("newable")) {
      child.onclick = () => editTransaction(data, row);
    }
  }

  tableBody.appendChild(row);
}

function formatTransaction(data, transaction, balances) {
  const t = transaction; // to prevent ugly line wrapping

  return {
    date: t.date || "",
    payee: (t.payeeId !== undefined && data.payees[t.payeeId].name) || "",
    status: t.status || "",
    category:
      (t.categoryId !== undefined && data.categories[t.categoryId].name) || "",
    amount:
      (t.amount !== undefined && Utilities.formatCurrency(t.amount)) || "",
    balance: (balances && Utilities.formatCurrency(balances[t.id])) || "",
    note: t.note || ""
  };
}

function formatTransactionTDs(data, transaction, balances) {
  const ft = formatTransaction(data, transaction, balances);

  return `
    <td class="clickable editable" property="date">${ft.date}</td>
    <td class="clickable editable" property="payee">${ft.payee}</td>
    <td class="clickable editable" property="status">${ft.status}</td>
    <td class="clickable editable" property="category">${ft.category}</td>
    <td class="clickable editable" property="amount">${ft.amount}</td>
    <td>${ft.balance}</td>
    <td class="clickable editable" property="note">${ft.note}</td>
  `;
}

function deleteTransaction(data, row, transaction) {
  console.log("delete");

  const ft = formatTransaction(data, transaction);

  let message = `Delete transaction?\n
  ${ft.date}, ${ft.payee}, ${ft.status}, ${ft.category}, ${ft.amount}, ${
    ft.note
  }`;

  if (window.confirm(message)) {
    var index = data.accounts[transaction.accountId].transactions
      .map(t => t.id)
      .indexOf(transaction.id);
    data.accounts[transaction.accountId].transactions.splice(index, 1);
    data.save();
    View.display();
  }
}

function initializeManagement(data) {
  const manageAccountsButton = document.getElementById("manageAccounts");
  const manageCategories = document.getElementById("manageCategories");
  const managePayees = document.getElementById("managePayees");
  const resetRegister = document.getElementById("resetRegister");

  resetRegister.onclick = () => {
    const deleteItAll = window.confirm(`⚠⚠⚠ Reset all register data? ⚠⚠⚠

                Remove all accounts...
                Remove all categories...
                Remove all payees...
                Remove all transactions...

☠☠☠ This cannot be undone! ☠☠☠`);

    if (deleteItAll) {
      data.initialize();
      data.save();
      View.display();
    }
  };
}

let editing;

function initializeEdit() {
  document.addEventListener("click", e => {
    if (editing) {
      const isClickInside = editing.row.contains(e.target);

      if (!isClickInside) {
        saveTableRow();
      }
    }
  });

  document.addEventListener("keydown", e => {
    if (editing) {
      if (e.which === 13) {
        saveTableRow();
        e.preventDefault();
      }

      if (e.which === 27) {
        cancelEdit();
        e.preventDefault();
      }
    }
  });
}

function cancelEdit() {
  editing = undefined;
  View.display();
}

function editTransaction(data, row, field, transaction) {
  if (editing) return;

  editing = { data, row, field, transaction };

  if (!transaction) {
    const newable = document.querySelector(".newable");
    newable.textContent = "✖";
    newable.onclick = () => cancelEdit();
  }

  for (const child of row.children) {
    if (child.classList.contains("editable")) {
      const property = child.getAttribute("property");
      if (property === "date" && child.textContent === "") {
        child.textContent = Utilities.today();
      }
      child.setAttribute("contenteditable", true);
      child.classList.add("editing");
    }
  }

  if (field) {
    setTimeout(() => field.focus(), 0);
  }
}

function validate() {
  let errors = false;

  for (const child of editing.row.children) {
    child.classList.remove("error");

    if (child.classList.contains("editable")) {
      const property = child.getAttribute("property");
      let valid = true;

      if (property === "date")
        valid &= Utilities.validateDate(child.textContent);
      else if (property === "payee") valid &= !!child.textContent;
      else if (property === "category") valid &= !!child.textContent;
      else if (property === "amount")
        valid &= !isNaN(parseFloat(child.textContent.replace(/,/, "")));

      if (!valid) {
        errors = true;
        child.classList.add("error");
      }
    }
  }

  return !errors;
}

function nextId(collection) {
  return Math.max(...Object.keys(collection)) + 1;
}

function findOrAdd(collection, name) {
  let item = collection.find(item => item.name === name);

  if (!item) {
    item = { id: -1, name };

    item.id = nextId(collection);

    collection[item.id] = item;
  }

  return item;
}

function saveTableRow() {
  if (!editing) return;
  if (!validate()) return;

  const transaction = editing.transaction || {};

  for (const child of editing.row.children) {
    if (child.classList.contains("editable")) {
      const property = child.getAttribute("property");

      if (property === "payee") {
        const payee = findOrAdd(editing.data.payees, child.textContent);
        transaction.payeeId = payee.id;
      } else if (property === "category") {
        const category = findOrAdd(editing.data.categories, child.textContent);
        transaction.categoryId = category.id;
      } else if (property === "amount") {
        transaction[property] = parseFloat(child.textContent.replace(/,/, ""));
      } else {
        transaction[property] = child.textContent;
      }

      child.setAttribute("contenteditable", false);
      child.classList.remove("editing");
    }
  }

  if (!editing.transaction) {
    const account = editing.data.accounts[editing.data.currentAccountId];

    transaction.id = nextId(account.transactions);
    transaction.accountId = account.id;

    account.transactions[transaction.id] = transaction;
  }

  editing.data.save();

  editing = undefined;

  View.display();
}
