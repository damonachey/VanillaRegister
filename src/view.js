import "./view.css";

export const View = {
  initialize(name, data) {
    this.app = document.getElementById(name);
    this.app.innerHTML = `
      <div class="flex-container">
        <div id="accounts" class="flex-child accounts"></div>
        <div id="transactions" class="flex-child transactions"></div>
      </div>
    `;

    initializeColumns(data);
    initializeSortFunctions(data);
  },

  display(data) {
    displayAccounts(data);
    displayTransactions(data);
  }
};

const columns = [];

function initializeColumns(data) {
  var currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  });

  columns.push({
    name: "Date",
    property: "date",
    getValue: d => d,
    sortable: true
  });
  columns.push({
    name: "Payee",
    property: "payeeId",
    getValue: id => data.payees.find(payee => payee.id === id).name,
    sortable: true
  });
  columns.push({
    name: "Status",
    property: "status",
    getValue: s => s,
    sortable: true
  });
  columns.push({
    name: "Category",
    property: "categoryId",
    getValue: id => data.categories.find(category => category.id === id).name,
    sortable: true
  });
  columns.push({
    name: "Amount",
    property: "amount",
    getValue: a => currency.format(a),
    sortable: true
  });
  columns.push({
    name: "Balance",
    property: "balance",
    getValue: b => currency.format(b)
  });
  columns.push({
    name: "Notes",
    property: "notes",
    getValue: n => n,
    sortable: true
  });
}

let sortFunction;
let changeSortOrder;

function initializeSortFunctions(data) {
  const propertyCompare = p => (a, b) => -(a[p] < b[p]) || +(a[p] > b[p]);
  const propertyCompareReverse = p => (b, a) =>
    -(a[p] < b[p]) || +(a[p] > b[p]);

  changeSortOrder = (property, forward = true) => {
    sortFunction = forward
      ? propertyCompare(property)
      : propertyCompareReverse(property);
    View.display(data);
  };

  changeSortOrder("date");
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

  const newAccount = document.createElement("li");
  newAccount.href = "#";
  newAccount.textContent = "+ New";
  accountList.appendChild(newAccount);
}

function getAccountItem(data, account) {
  const accountItem = document.createElement("li");
  accountItem.textContent = account.name;
  accountItem.setAttribute("selected", data.currentAccountId === account.id);
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
    <table id="transactionList" class="transactionList">
      <td>here</td>
    </table>
  `;

  displayTransactionsAccountName(data);

  const transactionList = document.getElementById("transactionList");
  const tableHeader = getTableHeader(data);
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
    thead.appendChild(th);
  }

  thead.appendChild(tr);

  return thead;
}

function getTableBody(data) {
  const tbody = document.createElement("tbody");

  const currentAccount = transaction =>
    transaction.accountId === data.currentAccountId;
  const transactions = data.transactions.filter(currentAccount);

  transactions.sort(sortFunction);

  let balance = 0;

  for (const transaction of transactions) {
    balance += transaction.amount;
    transaction.balance = balance;

    const tr = document.createElement("tr");
    tr.ondblclick = () => editTransaction(transaction.id);

    for (const column of columns) {
      const td = document.createElement("td");
      const value = column.getValue(transaction[column.property]);
      td.textContent = `${value || ""}`;
      td.setAttribute("name", column.name);
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  }

  return tbody;
}

function getTableFooter() {
  const tfoot = document.createElement("tfoot");
  const tr = document.createElement("tr");
  const td = document.createElement("td");

  td.textContent = "";
  td.setAttribute("colspan", columns.length);

  tr.appendChild(td);
  tfoot.appendChild(tr);

  return tfoot;
}

function editTransaction(id) {
  console.log("edit", id);
}
