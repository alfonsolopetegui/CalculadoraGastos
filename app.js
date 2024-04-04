//funcion para renderizar la tabla
function renderTable(expenses, currentPage, itemsPerPage) {
    if (currentPage === void 0) { currentPage = 1; }
    if (itemsPerPage === void 0) { itemsPerPage = 10; }
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
    var tbody = document.getElementById("expensesList");
    var tfoot = document.getElementById("total");
    var pagination = document.getElementById("pagination");
    var total = expenses.reduce(function (acc, el) { return acc + el.amount; }, 0);
    tfoot.textContent = "$ ".concat(total.toString());
    //variables de paginación
    var startIndex = (currentPage - 1) * itemsPerPage;
    var endIndex = startIndex + itemsPerPage;
    var items = expenses.slice(startIndex, endIndex);
    //limpio la tabla antes de renderizarla
    tbody.innerHTML = "";
    //renderizo la tabla
    items.forEach(function (item) {
        var row = createExpenseRow(item);
        row.classList.add("row-element");
        tbody.appendChild(row);
    });
    if (items.length < 10) {
        for (var i = 0; i < 10 - items.length; i++) {
            var emptyRow = document.createElement("tr");
            emptyRow.innerHTML = "<td colspan='4'></td>";
            emptyRow.classList.add("empty-row");
            tbody.appendChild(emptyRow);
        }
    }
    // Limpiar botones de paginación antes de volver a renderizar
    pagination.innerHTML = "";
    //botones de paginación
    var totalPages = Math.ceil(expenses.length / itemsPerPage);
    var _loop_1 = function (i) {
        var pageBtn = document.createElement("div");
        pageBtn.textContent = i.toString();
        pageBtn.classList.add("pageBtn");
        if (i === currentPage) {
            pageBtn.classList.add("active");
        }
        pageBtn.addEventListener("click", function () {
            renderTable(expenses, i, itemsPerPage);
        });
        pagination.appendChild(pageBtn);
    };
    for (var i = 1; i <= totalPages; i++) {
        _loop_1(i);
    }
}
//función para crear el gráfico
function renderChart(expenses) {
    // Calcula los datos del gráfico
    var categoryTotals = {};
    expenses.forEach(function (expense) {
        categoryTotals[expense.category] =
            (categoryTotals[expense.category] || 0) + expense.amount;
    });
    // Crea los datos para el gráfico
    var chartData = {
        labels: Object.keys(categoryTotals),
        series: Object.values(categoryTotals),
    };
    // Define los colores para los elementos del gráfico de pastel
    var defaultColors = [
        "#ff0000",
        "#F05B4F",
        "#F4C63D",
        "#D17905",
        "#453D3F",
        "#59922B",
        "#0544D3",
    ]; // Puedes ajustar estos colores según tus preferencias
    var chartColors = defaultColors.slice(0, chartData.labels.length); // Utiliza solo los colores necesarios para las etiquetas presentes en el gráfico
    // Crea el gráfico de pastel
    new Chartist.Pie(".ct-chart", chartData, {
        width: 300,
        height: 300,
        chartPadding: 20,
        labelInterpolationFnc: function (value) { return value; },
    });
    // Genera la leyenda
    var legendContainer = document.querySelector(".legend");
    if (legendContainer) {
        legendContainer.innerHTML = ""; // Limpia cualquier contenido previo
        chartData.labels.forEach(function (label, index) {
            var color = chartColors[index];
            var legendItem = document.createElement("div");
            legendItem.className = "legend-item";
            legendItem.innerHTML = "<span class=\"legend-color\" style=\"background-color: ".concat(color, "\"></span> ").concat(label);
            legendContainer.appendChild(legendItem);
        });
    }
}
// Función para comparar fechas solo por día, ignorando horas, minutos y segundos
function compareDatesByDay(date1, date2) {
    return (date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear());
}
// Función para aplicar filtros
function applyFilters() {
    //borra si hay mensajes de error
    var emptyMessage = document.querySelector("#filterSection p");
    if (emptyMessage) {
        emptyMessage.remove();
    }
    //obtiene los valores del filtro
    var startDateInput = document.getElementById("startDate");
    var endDateInput = document.getElementById("endDate");
    var categoryFilterSelect = document.getElementById("categoryFilter");
    // Obtener los valores de las fechas y convertirlos a objetos Date
    var startDateParts = startDateInput.value.split("-");
    var endDateParts = endDateInput.value.split("-");
    var startDate = new Date(parseInt(startDateParts[0]), parseInt(startDateParts[1]) - 1, parseInt(startDateParts[2]));
    var endDate = new Date(parseInt(endDateParts[0]), parseInt(endDateParts[1]) - 1, parseInt(endDateParts[2]));
    // Ajustar a la medianoche del inicio del día
    startDate.setHours(0, 0, 0, 0);
    // Ajustar al último momento del día
    endDate.setHours(23, 59, 59, 999);
    console.log("startDate:", startDate);
    console.log("endDate:", endDate);
    var categoryFilter = categoryFilterSelect.value;
    // Filtrar la lista de gastos
    var filteredExpenses = expensesList.filter(function (expense) {
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
        var filterSection = document.getElementById("filterSection");
        var emptyMessage_1 = document.createElement("p");
        emptyMessage_1.textContent = "Ningún gasto coincide con tu búsqueda.";
        filterSection.appendChild(emptyMessage_1);
    }
    else {
        // Si hay gastos filtrados, asegúrate de que no haya ningún mensaje de vacío mostrado
        var emptyMessage_2 = document.querySelector("#filterSection p");
        if (emptyMessage_2) {
            emptyMessage_2.remove();
        }
    }
    // Actualizar la vista con los gastos filtrados
    renderTable(filteredExpenses);
    renderChart(filteredExpenses);
}
// Escuchar clic en el botón de aplicar filtro
var filterBtn = document.getElementById("filterBtn");
if (filterBtn) {
    filterBtn.addEventListener("click", applyFilters);
}
// Al cargar los gastos del almacenamiento local
var storedExpenses = localStorage.getItem("expensesList");
var expensesList = [];
if (storedExpenses !== null) {
    expensesList = JSON.parse(storedExpenses).map(function (expense) { return ({
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        date: new Date(expense.date), // Convertir la cadena de fecha a un objeto Date
    }); });
}
renderTable(expensesList);
//función para crear la fila
function createExpenseRow(expense) {
    var row = document.createElement("tr");
    var nameCell = document.createElement("td");
    nameCell.textContent = expense.name;
    row.appendChild(nameCell);
    var amountCell = document.createElement("td");
    amountCell.textContent = "$ ".concat(expense.amount.toString());
    row.appendChild(amountCell);
    var categoryCell = document.createElement("td");
    categoryCell.textContent = expense.category.toString();
    row.appendChild(categoryCell);
    var dateCell = document.createElement("td");
    if (expense.date instanceof Date && !isNaN(expense.date.getTime())) {
        var currentDate = expense.date;
        var formattedDate = "".concat(currentDate.getDate(), "/").concat(currentDate.getMonth() + 1, "/").concat(currentDate.getFullYear());
        dateCell.textContent = formattedDate;
    }
    else {
        dateCell.textContent = "Fecha inválida";
    }
    row.appendChild(dateCell);
    return row;
}
var expenseForm = document.getElementById("expenseForm");
//funcion del submit, extrae los datos ingresados por el usuario
expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var expenseNameInput = document.getElementById("expenseName");
    var expenseName = expenseNameInput.value;
    var expenseAmountInput = document.getElementById("expenseAmount");
    var expenseAmount = parseFloat(expenseAmountInput.value);
    var expenseCategorySelect = document.getElementById("categorySelect");
    var expenseCategory = expenseCategorySelect.value;
    var date = new Date();
    if (expenseName && expenseAmount && expenseCategory) {
        var newExpense = {
            name: expenseName,
            amount: expenseAmount,
            category: expenseCategory,
            date: date,
        };
        expensesList.push(newExpense);
        localStorage.setItem("expensesList", JSON.stringify(expensesList));
        renderTable(expensesList);
        expenseForm.reset();
    }
    else {
        console.log("Datos incompletos");
        return;
    }
});
