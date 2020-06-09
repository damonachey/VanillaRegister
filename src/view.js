import "./view.css";

import { Columns } from "./columns";

export const View = {
  initialize(name, data) {
    this.app = document.getElementById(name);
    this.app.innerHTML = `
      <div class="flex-container">
        <div id="accounts" class="flex-child accounts"></div>
        <div id="transactions" class="flex-child transactions"></div>
      </div>
      <div>
        <div id="manage" class="manage"></div>
      </div>
    `;

    Columns.initialize(data, columns);
    initializeSortFunctions(data);
    InitializeEdit(data);
  },

  display(data) {
    displayAccounts(data);
    displayTransactions(data);
    displayManage(data);
  }
};

const columns = [];

let sortFunction;
let changeSortOrder;

const propertyCompare = p => (a, b) => -(a[p] < b[p]) || +(a[p] > b[p]);
const propertyCompareReverse = p => (b, a) => -(a[p] < b[p]) || +(a[p] > b[p]);

function initializeSortFunctions(data) {
  changeSortOrder = (property, forward = true) => {
    sortFunction = forward
      ? propertyCompare(property)
      : propertyCompareReverse(property);
    View.display(data);
    localStorage.setItem("sortOrder", JSON.stringify({ property, forward }));
  };

  const json = localStorage.getItem("sortOrder");

  if (json) {
    const settings = JSON.parse(json);

    changeSortOrder(settings.property, settings.forward);
  } else {
    changeSortOrder("date");
  }
}

function InitializeEdit(data) {
  document.addEventListener("click", e => {
    if (editing) {
      const isClickInside = editing.tr.contains(e.target);

      if (!isClickInside) {
        saveTableRow(data);
      }
    }
  });

  document.addEventListener("keydown", e => {
    if (editing) {
      if (e.which === 13) {
        saveTableRow(data);
        e.preventDefault();
      }
      if (e.which === 27) {
        editing = undefined;
        View.display(data);
        e.preventDefault();
      }
    }
  });
}

function displayAccounts(data) {
  const accountsElement = document.getElementById("accounts");
  accountsElement.innerHTML = `
    <h3>Accounts</h3>
    <ul id="accountList" class="accountList"></ul>
  `;

  const accountList = document.getElementById("accountList");
  accountList.innerHTML = "";

  for (const account of data.accounts) {
    const accountItem = getAccountItem(data, account);
    accountList.appendChild(accountItem);
  }
}

function getAccountItem(data, account) {
  const accountItem = document.createElement("li");
  accountItem.textContent = account.name;
  accountItem.setAttribute("selected", data.currentAccountId === account.id);
  accountItem.classList.add("clickable");
  accountItem.onclick = () => {
    data.currentAccountId = account.id;
    View.display(data);
  };

  return accountItem;
}

function displayTransactions(data) {
  const transactionsElement = document.getElementById("transactions");
  transactionsElement.innerHTML = `
    <h3>Account: <span id="accountName"></span></h3>
    <table id="transactionList" class="transactionList"></table>
  `;

  displayTransactionsAccountName(data);

  const transactionList = document.getElementById("transactionList");
  const tableHeader = getTableHeader();
  const tableBody = getTableBody(data);
  const tableFooter = getTableFooter();

  transactionList.innerHTML = "";
  transactionList.appendChild(tableHeader);
  transactionList.appendChild(tableBody);
  transactionList.appendChild(tableFooter);
}

function displayTransactionsAccountName(data) {
  const accountName = document.getElementById("accountName");

  const account = data.accounts.find(a => a.id === data.currentAccountId);

  accountName.textContent = account ? account.name : "None";
}

function getTableHeader() {
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");

  for (const column of columns) {
    const th = document.createElement("th");
    const div = document.createElement("div");
    const text = document.createElement("span");

    text.textContent = column.name;
    div.appendChild(text);

    if (column.sortable) {
      const down = document.createElement("span");
      const up = document.createElement("span");

      down.textContent = "▼";
      up.textContent = "▲";
      down.classList.add("clickable");
      up.classList.add("clickable");

      down.onclick = () => changeSortOrder(column.property);
      up.onclick = () => changeSortOrder(column.property, false);

      div.appendChild(down);
      div.appendChild(up);
    }

    th.appendChild(div);
    tr.appendChild(th);
  }

  const th = document.createElement("th");
  tr.appendChild(th);

  thead.appendChild(tr);

  return thead;
}

function todaysDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const MM = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  return `${yyyy}-${MM}-${dd}`;
}

function getTableBody(data) {
  const tbody = document.createElement("tbody");

  const currentAccount = transaction =>
    transaction.accountId === data.currentAccountId;
  const transactions = data.transactions.filter(currentAccount);

  transactions.sort(propertyCompare("date"));

  let balance = 0;

  for (const transaction of transactions) {
    balance += transaction.amount;
    transaction.balance = balance;
  }

  transactions.sort(sortFunction);

  const today = todaysDate();

  for (const transaction of transactions) {
    const tr = document.createElement("tr");

    for (const column of columns) {
      const td = document.createElement("td");
      const value = column.getValue(transaction[column.property]);
      td.textContent = `${value || ""}`;
      td.setAttribute("name", column.name);
      td.setAttribute("property", column.property);

      if (column.editable) {
        td.classList.add("editable");
        td.ondblclick = () => editTableRow(td, tr, transaction);
      }

      if (column.property === "date" && value > today) {
        tr.classList.add("future");
      }

      tr.appendChild(td);
    }

    const td = document.createElement("td");
    td.textContent = "✖";
    td.classList.add("clickable");
    td.onclick = () => deleteTableRow(data, tr, transaction);
    tr.appendChild(td);

    tbody.appendChild(tr);
  }

  const tr = document.createElement("tr");
  for (const column of columns) {
    const td = document.createElement("td");
    td.textContent = "";
    td.setAttribute("name", column.name);
    td.setAttribute("property", column.property);

    if (column.editable) {
      td.classList.add("editable");
      td.ondblclick = () => editTableRow(td, tr);
    }

    tr.appendChild(td);
  }

  const td = document.createElement("td");
  td.innerHTML = "<span style='font-weight: 900;'>🗋</span>";
  td.classList.add("clickable");
  td.onclick = () => editTableRow(td, tr);
  tr.appendChild(td);

  tbody.appendChild(tr);

  return tbody;
}

function getTableFooter() {
  const tfoot = document.createElement("tfoot");
  const tr = document.createElement("tr");
  const td = document.createElement("td");

  td.textContent = "";
  td.setAttribute("colspan", 1000);

  tr.appendChild(td);
  tfoot.appendChild(tr);

  return tfoot;
}

function displayManage(data) {
  const manageElement = document.getElementById("manage");
  manageElement.innerHTML = `
    <button id="manageAccounts" class="button">Manage: Accounts</button>
    <button id="manageCategories" class="button">Manage: Categories</button>
    <button id="managePayees" class="button">Manage: Payees</button>
    <button id="resetRegister" class="button warning">Reset Register</button>
  `;

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
      View.display(data);
    }
  };
}

let editing;

function editTableRow(td, tr, transaction) {
  if (editing) return;

  editing = { tr, transaction };

  for (const child of tr.children) {
    if (child.classList.contains("editable")) {
      const property = child.getAttribute("property");
      if (property === "date" && child.textContent === "") {
        child.textContent = todaysDate();
      }
      child.setAttribute("contenteditable", true);
      child.classList.add("editing");
    }
  }

  setTimeout(() => td.focus(), 0);
}

function saveTableRow(data) {
  if (!editing) return;

  let errors = false;

  for (const child of editing.tr.children) {
    child.classList.remove("error");

    if (child.classList.contains("editable")) {
      const property = child.getAttribute("property");
      const column = columns.find(c => c.property === property);

      if (column.validate) {
        const valid = column.validate(child.textContent);

        if (!valid) {
          errors = true;
          child.classList.add("error");
        }
      }
    }
  }

  if (errors) return;

  const transaction = editing.transaction || {};

  for (const child of editing.tr.children) {
    if (child.classList.contains("editable")) {
      const property = child.getAttribute("property");
      const column = columns.find(c => c.property === property);

      transaction[property] = column.setValue(child.textContent);

      child.setAttribute("contenteditable", false);
      child.classList.remove("editing");
    }
  }

  if (!editing.transaction) {
    transaction.accountId = data.currentAccountId;

    data.addTransaction(transaction);
  }

  editing = undefined;

  data.save();
  View.display(data);
}

function deleteTableRow(data, tr, transaction) {
  let message = "Delete transaction?\n\n";

  for (const column of columns) {
    const value = column.getValue(transaction[column.property]);
    message += `${value}, `;
  }

  message = message.slice(0, -2);

  if (window.confirm(message)) {
    data.deleteTransaction(transaction);
    data.save();
    View.display(data);
  }
}
