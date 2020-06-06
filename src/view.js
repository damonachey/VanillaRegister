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
  },

  display(data) {
    displayAccounts(data);
    displayTransactions(data);
  }
};

const columns = [];

function initializeColumns(data) {
  var formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  });

  formatter.format(2500);
  columns.push({ name: "Date", field: "date", getValue: d => d });
  columns.push({
    name: "Payee",
    field: "payeeId",
    getValue: id => data.payees.find(payee => payee.id === id).name
  });
  columns.push({ name: "Status", field: "status", getValue: s => s });
  columns.push({
    name: "Category",
    field: "categoryId",
    getValue: id => data.categories.find(category => category.id === id).name
  });
  columns.push({
    name: "Amount",
    field: "amount",
    getValue: a => formatter.format(a)
  });
  columns.push({ name: "Balance", getValue: () => "" });
  columns.push({ name: "Notes", field: "notes", getValue: n => n });
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

  const transactionList = document.getElementById("transactionList");
  transactionList.innerHTML = "";

  displayTransactionsAccountName(data);

  const tableHeader = getTableHeader();
  transactionList.appendChild(tableHeader);

  const tableBody = getTableBody(data);
  transactionList.appendChild(tableBody);

  const tableFooter = getTableFooter();
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
    th.textContent = column.name;
    thead.appendChild(th);
  }

  thead.appendChild(tr);

  return thead;
}

function getTableBody(data) {
  const tbody = document.createElement("tbody");

  const transactions = data.transactions.filter(
    transaction => transaction.accountId === data.currentAccountId
  );

  for (const transaction of transactions) {
    const tr = document.createElement("tr");
    tr.ondblclick = () => editTransaction(transaction.id);

    for (const column of columns) {
      const td = document.createElement("td");
      const value = column.getValue(transaction[column.field]);
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

  td.textContent = `Footer`;
  td.setAttribute("colspan", columns.length);

  tr.appendChild(td);
  tfoot.appendChild(tr);

  return tfoot;
}

function editTransaction(id) {
  console.log("edit", id);
}
