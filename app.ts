interface Expense {
  name: string;
  amount: number;
  category: string;
  date: Date;
}

//funcion para renderizar la tabla
function renderTable(
  expenses: Expense[],
  currentPage: number = 1,
  itemsPerPage: number = 10
) {
  expenses.sort(function (a, b) {
    if (a.date < b.date) {
      return 1;
    }
    if (a.date > b.date) {
      return -1;
    }

    return 0;
  });

  //Guardo los elementos en variables
  const tbody = document.getElementById("expensesList") as HTMLElement;
  const tfoot = document.getElementById("total") as HTMLTableCellElement;
  const pagination = document.getElementById("pagination") as HTMLElement;

  const total: number = expenses.reduce((acc, el) => acc + el.amount, 0);
  tfoot.textContent = `$ ${total.toString()}`;

  //variables de paginación
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const items = expenses.slice(startIndex, endIndex);

  //limpio la tabla antes de renderizarla
  tbody.innerHTML = "";

  //renderizo la tabla
  items.forEach((item) => {
    const row = createExpenseRow(item);
    row.classList.add("row-element");
    tbody.appendChild(row);
  });

  if (items.length < 10) {
    for (let i = 0; i < 10 - items.length; i++) {
      const emptyRow = document.createElement("tr") as HTMLTableRowElement;
      emptyRow.innerHTML = `<td colspan='4'></td>`
      emptyRow.classList.add("empty-row");
      tbody.appendChild(emptyRow);
    }
  }

  // Limpiar botones de paginación antes de volver a renderizar
  pagination.innerHTML = "";

  //botones de paginación
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

//función para crear el gráfico
function renderChart(expenses: Expense[]) {
  // Calcula los datos del gráfico
  const categoryTotals: { [category: string]: number } = {};
  expenses.forEach((expense) => {
    categoryTotals[expense.category] =
      (categoryTotals[expense.category] || 0) + expense.amount;
  });

  // Crea los datos para el gráfico
  const chartData = {
    labels: Object.keys(categoryTotals),
    series: Object.values(categoryTotals),
  };

  // Define los colores para los elementos del gráfico de pastel
  const defaultColors = [
    "#ff0000",
    "#F05B4F",
    "#F4C63D",
    "#D17905",
    "#453D3F",
    "#59922B",
    "#0544D3",
  ]; // Puedes ajustar estos colores según tus preferencias
  const chartColors = defaultColors.slice(0, chartData.labels.length); // Utiliza solo los colores necesarios para las etiquetas presentes en el gráfico

  // Crea el gráfico de pastel
  new Chartist.Pie(".ct-chart", chartData, {
    width: 300,
    height: 300,
    chartPadding: 20,
    labelInterpolationFnc: (value: string) => value,
  });

  // Genera la leyenda
  const legendContainer = document.querySelector(".legend");
  if (legendContainer) {
    legendContainer.innerHTML = ""; // Limpia cualquier contenido previo
    chartData.labels.forEach((label, index) => {
      const color = chartColors[index];
      const legendItem = document.createElement("div");
      legendItem.className = "legend-item";
      legendItem.innerHTML = `<span class="legend-color" style="background-color: ${color}"></span> ${label}`;
      legendContainer.appendChild(legendItem);
    });
  }
}

// Función para comparar fechas solo por día, ignorando horas, minutos y segundos
function compareDatesByDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

// Función para aplicar filtros
function applyFilters() {
  //borra si hay mensajes de error
  const emptyMessage = document.querySelector("#filterSection p");
  if (emptyMessage) {
    emptyMessage.remove();
  }

  //obtiene los valores del filtro
  const startDateInput = document.getElementById(
    "startDate"
  ) as HTMLInputElement;
  const endDateInput = document.getElementById("endDate") as HTMLInputElement;
  const categoryFilterSelect = document.getElementById(
    "categoryFilter"
  ) as HTMLSelectElement;

  // Obtener los valores de las fechas y convertirlos a objetos Date
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

  // Ajustar a la medianoche del inicio del día
  startDate.setHours(0, 0, 0, 0);

  // Ajustar al último momento del día
  endDate.setHours(23, 59, 59, 999);

  console.log("startDate:", startDate);
  console.log("endDate:", endDate);

  const categoryFilter = categoryFilterSelect.value;

  // Filtrar la lista de gastos
  let filteredExpenses = expensesList.filter((expense) => {
    // Filtrar por rango de fechas
    if (!isNaN(startDate.getTime()) && expense.date < startDate) {
      return false;
    }
    if (!isNaN(endDate.getTime()) && expense.date > endDate) {
      return false;
    }
    // Filtrar por categoría
    if (categoryFilter !== "all" && expense.category !== categoryFilter) {
      return false;
    }
    return true; // Mantener el gasto si pasa todos los filtros
  });

  if (filteredExpenses.length === 0) {
    const filterSection = document.getElementById(
      "filterSection"
    ) as HTMLElement;

    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "Ningún gasto coincide con tu búsqueda.";

    filterSection.appendChild(emptyMessage);
  } else {
    // Si hay gastos filtrados, asegúrate de que no haya ningún mensaje de vacío mostrado
    const emptyMessage = document.querySelector("#filterSection p");
    if (emptyMessage) {
      emptyMessage.remove();
    }
  }

  // Actualizar la vista con los gastos filtrados
  renderTable(filteredExpenses);
  renderChart(filteredExpenses);
}

// Escuchar clic en el botón de aplicar filtro
const filterBtn = document.getElementById("filterBtn");
if (filterBtn) {
  filterBtn.addEventListener("click", applyFilters);
}

// Al cargar los gastos del almacenamiento local
let storedExpenses = localStorage.getItem("expensesList");
let expensesList: Expense[] = [];

if (storedExpenses !== null) {
  expensesList = JSON.parse(storedExpenses).map((expense: any) => ({
    name: expense.name,
    amount: expense.amount,
    category: expense.category,
    date: new Date(expense.date), // Convertir la cadena de fecha a un objeto Date
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
  amountCell.textContent = `$ ${expense.amount.toString()}`;
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

//grafico Chartist
declare let Chartist: any;
