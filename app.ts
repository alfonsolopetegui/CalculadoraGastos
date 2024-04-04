interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: Date;
}

function renderTable(
  expenses: Expense[],
  currentPage: number = 1,
  itemsPerPage: number = 10
) {
  expenses.sort((a, b) => b.date.getTime() - a.date.getTime());

  const tbody = document.getElementById("expensesList") as HTMLElement;
  const tfoot = document.getElementById("total") as HTMLTableCellElement;
  const pagination = document.getElementById("pagination") as HTMLElement;

  const total: number = expenses.reduce((acc, el) => acc + el.amount, 0);
  tfoot.textContent = `$ ${total.toString()}`;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const items = expenses.slice(startIndex, endIndex);

  tbody.innerHTML = "";

  items.forEach((item) => {
    const row = createExpenseRow(item);
    row.classList.add("row-element");
    tbody.appendChild(row);
  });

  if (items.length < 10) {
    for (let i = 0; i < 10 - items.length; i++) {
      const emptyRow = document.createElement("tr") as HTMLTableRowElement;
      emptyRow.innerHTML = `<td colspan='5'></td>`;
      emptyRow.classList.add("empty-row");
      tbody.appendChild(emptyRow);
    }
  }

  pagination.innerHTML = "";

  const totalPages = Math.ceil(expenses.length / itemsPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("div");
    pageBtn.textContent = i.toString();
    pageBtn.classList.add("pageBtn");
    if (i === currentPage) {
      pageBtn.classList.add("active");
    }
    pageBtn.addEventListener("click", () => {
      renderTable(expenses, i, itemsPerPage);
    });
    pagination.appendChild(pageBtn);
  }
}

function renderChart(expenses: Expense[]) {
  const categoryTotals: { [category: string]: number } = {};
  expenses.forEach((expense) => {
    categoryTotals[expense.category] =
      (categoryTotals[expense.category] || 0) + expense.amount;
  });

  const chartData = {
    labels: Object.keys(categoryTotals),
    series: Object.values(categoryTotals),
  };

  const defaultColors = [
    "#ff0000",
    "#F05B4F",
    "#F4C63D",
    "#D17905",
    "#453D3F",
    "#59922B",
    "#0544D3",
  ];
  const chartColors = defaultColors.slice(0, chartData.labels.length);

  new Chartist.Pie(".ct-chart", chartData, {
    width: 300,
    height: 300,
    chartPadding: 20,
    labelInterpolationFnc: (value: string) => value,
  });

  const legendContainer = document.querySelector(".legend");
  if (legendContainer) {
    legendContainer.innerHTML = "";
    chartData.labels.forEach((label, index) => {
      const color = chartColors[index];
      const legendItem = document.createElement("div");
      legendItem.className = "legend-item";
      legendItem.innerHTML = `<span class="legend-color" style="background-color: ${color}"></span> ${label}`;
      legendContainer.appendChild(legendItem);
    });
  }
}

function generateRandomId(): string {
  let randomNumber = Math.random();
  let randomId = randomNumber.toString().substring(2);
  while (randomId.length < 10) {
    randomId = "0" + randomId;
  }
  return randomId.substring(0, 10);
}

function compareDatesByDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

function applyFilters() {
  const emptyMessage = document.querySelector("#filterSection p");
  if (emptyMessage) {
    emptyMessage.remove();
  }

  const startDateInput = document.getElementById(
    "startDate"
  ) as HTMLInputElement;
  const endDateInput = document.getElementById("endDate") as HTMLInputElement;
  const categoryFilterSelect = document.getElementById(
    "categoryFilter"
  ) as HTMLSelectElement;

  const startDateParts = startDateInput.value.split("-");
  const endDateParts = endDateInput.value.split("-");

  const startDate = new Date(
    parseInt(startDateParts[0]),
    parseInt(startDateParts[1]) - 1,
    parseInt(startDateParts[2])
  );
  const endDate = new Date(
    parseInt(endDateParts[0]),
    parseInt(endDateParts[1]) - 1,
    parseInt(endDateParts[2])
  );

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const categoryFilter = categoryFilterSelect.value;

  let filteredExpenses = expensesList.filter((expense) => {
    if (!isNaN(startDate.getTime()) && expense.date < startDate) {
      return false;
    }
    if (!isNaN(endDate.getTime()) && expense.date > endDate) {
      return false;
    }
    if (categoryFilter !== "all" && expense.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  if (filteredExpenses.length === 0) {
    const filterSection = document.getElementById(
      "filterSection"
    ) as HTMLElement;

    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "Ningún gasto coincide con tu búsqueda.";

    filterSection.appendChild(emptyMessage);
  } else {
    const emptyMessage = document.querySelector("#filterSection p");
    if (emptyMessage) {
      emptyMessage.remove();
    }
  }

  renderTable(filteredExpenses);
  renderChart(filteredExpenses);
}

const filterBtn = document.getElementById("filterBtn");
if (filterBtn) {
  filterBtn.addEventListener("click", applyFilters);
}

let storedExpenses = localStorage.getItem("expensesList");
let expensesList: Expense[] = [];

if (storedExpenses !== null) {
  expensesList = JSON.parse(storedExpenses).map((expense: any) => ({
    id: expense.id,
    name: expense.name,
    amount: expense.amount,
    category: expense.category,
    date: new Date(expense.date),
  }));
}

function loadExpenses() {
  let storedExpenses = localStorage.getItem("expensesList");
  expensesList = [];

  if (storedExpenses !== null) {
    expensesList = JSON.parse(storedExpenses).map((expense: any) => ({
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      date: new Date(expense.date),
    }));
  }

  renderTable(expensesList);
}

loadExpenses();

function deleteExpense(event: MouseEvent) {
  const expenseId = (event.target as HTMLElement).getAttribute("data-id");
  expensesList = expensesList.filter((el) => el.id !== expenseId);
  localStorage.setItem("expensesList", JSON.stringify(expensesList));
  loadExpenses();
}


function createExpenseRow(expense: Expense): HTMLTableRowElement {
  const row = document.createElement("tr");

  const nameCell = document.createElement("td");
  nameCell.textContent = expense.name;
  row.appendChild(nameCell);

  const amountCell = document.createElement("td");
  amountCell.textContent = `$ ${expense.amount.toString()}`;
  row.appendChild(amountCell);

  const categoryCell = document.createElement("td");
  categoryCell.textContent = expense.category.toString();
  row.appendChild(categoryCell);

  const dateCell = document.createElement("td");
  const deleteCell = document.createElement("td");
  deleteCell.setAttribute("data-id", expense.id);
  deleteCell.classList.add("delete-cell");
  deleteCell.classList.add("delete-btn");
  deleteCell.textContent = "x";
  deleteCell.addEventListener("click", deleteExpense);

  if (
    expense.date instanceof Date &&
    !isNaN(expense.date.getTime()) &&
    expense.date.getFullYear() > 1970
  ) {
    const currentDate = expense.date;
    const formattedDate = `${currentDate.getDate()}/${
      currentDate.getMonth() + 1
    }/${currentDate.getFullYear()}`;
    dateCell.textContent = formattedDate;
  } else {
    dateCell.textContent = "Fecha inválida";
  }

  row.appendChild(dateCell);
  row.appendChild(deleteCell);

  return row;
}

const expenseForm = document.getElementById("expenseForm") as HTMLFormElement;

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
  const expenseId: string = generateRandomId();

  if (expenseName && expenseAmount && expenseCategory) {
    const newExpense: Expense = {
      id: expenseId,
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

declare let Chartist: any;
