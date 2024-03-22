interface Expense {
  name: string;
  amount: number;
  category: string;
  date: Date;
}

//funcion para renderizar la tabla
function renderTable(expenses: Expense[]) {
  const tbody = document.getElementById("expensesList") as HTMLElement;

  tbody.innerHTML = "";

  expenses.forEach((expense) => {
    const row = createExpenseRow(expense);
    tbody.appendChild(row);
  });
}

// const expensesList: Expense[] = [];
// let expensesList : Expense[] = JSON.parse(localStorage.getItem("usuarios_guardados")) || [];

// Al cargar los gastos del almacenamiento local
let storedExpenses = localStorage.getItem("expensesList");
let expensesList: Expense[] = [];

if (storedExpenses !== null) {
    expensesList = JSON.parse(storedExpenses).map((expense: any) => ({
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        date: new Date(expense.date) // Convertir la cadena de fecha a un objeto Date
    }));
}


renderTable(expensesList);

//función para crear la fila
function createExpenseRow(expense: Expense): HTMLTableRowElement {
  const row = document.createElement("tr");

  const nameCell = document.createElement("td");
  nameCell.textContent = expense.name;
  row.appendChild(nameCell);

  const amountCell = document.createElement("td");
  amountCell.textContent = expense.amount.toString();
  row.appendChild(amountCell);

  const categoryCell = document.createElement("td");
  categoryCell.textContent = expense.category.toString();
  row.appendChild(categoryCell);

  const dateCell = document.createElement("td");

  if (expense.date instanceof Date && !isNaN(expense.date.getTime())) {
    const currentDate = expense.date;
    const formattedDate = `${currentDate.getDate()}/${
      currentDate.getMonth() + 1
    }/${currentDate.getFullYear()}`;
    dateCell.textContent = formattedDate;
  } else {
    dateCell.textContent = "Fecha inválida";
  }

  row.appendChild(dateCell);

  return row;
}

const expenseForm = document.getElementById("expenseForm") as HTMLFormElement;

//funcion del submit, extrae los datos ingresados por el usuario
expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const expenseNameInput = document.getElementById(
    "expenseName"
  ) as HTMLInputElement;
  const expenseName = expenseNameInput.value;

  const expenseAmountInput = document.getElementById(
    "expenseAmount"
  ) as HTMLInputElement;
  const expenseAmount = parseFloat(expenseAmountInput.value);

  const expenseCategorySelect = document.getElementById(
    "categorySelect"
  ) as HTMLSelectElement;
  const expenseCategory = expenseCategorySelect.value;

  const date = new Date();

  if (expenseName && expenseAmount && expenseCategory) {
    const newExpense: Expense = {
      name: expenseName,
      amount: expenseAmount,
      category: expenseCategory,
      date: date,
    };

    expensesList.push(newExpense);
    localStorage.setItem("expensesList", JSON.stringify(expensesList));
    renderTable(expensesList);
    expenseForm.reset();
  } else {
    console.log("Datos incompletos");
    return;
  }
});
