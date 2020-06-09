import { Utilities } from "./utilities";

export const Columns = {
  initialize(data, columns) {
    columns.push({
      name: "Date",
      property: "date",
      getValue: d => d,
      setValue: d => d,
      validate: d => Utilities.validateDate(d),
      sortable: true,
      editable: true
    });
    columns.push({
      name: "Payee",
      property: "payeeId",
      getValue: id => data.payees.find(payee => payee.id === id).name,
      setValue: name => data.findOrCreate(data.payees, name).id,
      sortable: true,
      editable: true
    });
    columns.push({
      name: "Status",
      property: "status",
      getValue: s => s,
      setValue: s => s,
      validate: s => true,
      sortable: true,
      editable: true
    });
    columns.push({
      name: "Category",
      property: "categoryId",
      getValue: id => data.categories.find(category => category.id === id).name,
      setValue: name => data.findOrCreate(data.categories, name).id,
      sortable: true,
      editable: true
    });
    columns.push({
      name: "Amount",
      property: "amount",
      getValue: a => Utilities.formatCurrency(a),
      setValue: a => +a,
      validate: a => !isNaN(a),
      sortable: true,
      editable: true
    });
    columns.push({
      name: "Balance",
      property: "balance",
      getValue: b => Utilities.formatCurrency(b)
    });
    columns.push({
      name: "Notes",
      property: "notes",
      getValue: n => n,
      setValue: n => n,
      sortable: true,
      editable: true
    });
  }
};
