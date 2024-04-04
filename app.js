function renderTable(expenses, currentPage, itemsPerPage) {
    if (currentPage === void 0) { currentPage = 1; }
    if (itemsPerPage === void 0) { itemsPerPage = 10; }
    expenses.sort(function (a, b) { return b.date.getTime() - a.date.getTime(); });
    var tbody = document.getElementById("expensesList");
    var tfoot = document.getElementById("total");
    var pagination = document.getElementById("pagination");
    var total = expenses.reduce(function (acc, el) { return acc + el.amount; }, 0);
    tfoot.textContent = "$ ".concat(total.toString());
    var startIndex = (currentPage - 1) * itemsPerPage;
    var endIndex = startIndex + itemsPerPage;
    var items = expenses.slice(startIndex, endIndex);
    tbody.innerHTML = "";
    items.forEach(function (item) {
        var row = createExpenseRow(item);
        row.classList.add("row-element");
        tbody.appendChild(row);
    });
    if (items.length < 10) {
        for (var i = 0; i < 10 - items.length; i++) {
            var emptyRow = document.createElement("tr");
            emptyRow.innerHTML = "<td colspan='5'></td>";
            emptyRow.classList.add("empty-row");
            tbody.appendChild(emptyRow);
        }
    }
    pagination.innerHTML = "";
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
function renderChart(expenses) {
    var categoryTotals = {};
    expenses.forEach(function (expense) {
        categoryTotals[expense.category] =
            (categoryTotals[expense.category] || 0) + expense.amount;
    });
    var chartData = {
        labels: Object.keys(categoryTotals),
        series: Object.values(categoryTotals),
    };
    var defaultColors = [
        "#ff0000",
        "#F05B4F",
        "#F4C63D",
        "#D17905",
        "#453D3F",
        "#59922B",
        "#0544D3",
    ];
    var chartColors = defaultColors.slice(0, chartData.labels.length);
    new Chartist.Pie(".ct-chart", chartData, {
        width: 300,
        height: 300,
        chartPadding: 20,
        labelInterpolationFnc: function (value) { return value; },
    });
    var legendContainer = document.querySelector(".legend");
    if (legendContainer) {
        legendContainer.innerHTML = "";
        chartData.labels.forEach(function (label, index) {
            var color = chartColors[index];
            var legendItem = document.createElement("div");
            legendItem.className = "legend-item";
            legendItem.innerHTML = "<span class=\"legend-color\" style=\"background-color: ".concat(color, "\"></span> ").concat(label);
            legendContainer.appendChild(legendItem);
        });
    }
}
function generateRandomId() {
    var randomNumber = Math.random();
    var randomId = randomNumber.toString().substring(2);
    while (randomId.length < 10) {
        randomId = "0" + randomId;
    }
    return randomId.substring(0, 10);
}
function compareDatesByDay(date1, date2) {
    return (date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear());
}
function applyFilters() {
    var emptyMessage = document.querySelector("#filterSection p");
    if (emptyMessage) {
        emptyMessage.remove();
    }
    var startDateInput = document.getElementById("startDate");
    var endDateInput = document.getElementById("endDate");
    var categoryFilterSelect = document.getElementById("categoryFilter");
    var startDateParts = startDateInput.value.split("-");
    var endDateParts = endDateInput.value.split("-");
    var startDate = new Date(parseInt(startDateParts[0]), parseInt(startDateParts[1]) - 1, parseInt(startDateParts[2]));
    var endDate = new Date(parseInt(endDateParts[0]), parseInt(endDateParts[1]) - 1, parseInt(endDateParts[2]));
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    var categoryFilter = categoryFilterSelect.value;
    var filteredExpenses = expensesList.filter(function (expense) {
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
        var filterSection = document.getElementById("filterSection");
        var emptyMessage_1 = document.createElement("p");
        emptyMessage_1.textContent = "Ningún gasto coincide con tu búsqueda.";
        filterSection.appendChild(emptyMessage_1);
    }
    else {
        var emptyMessage_2 = document.querySelector("#filterSection p");
        if (emptyMessage_2) {
            emptyMessage_2.remove();
        }
    }
    renderTable(filteredExpenses);
    renderChart(filteredExpenses);
}
var filterBtn = document.getElementById("filterBtn");
if (filterBtn) {
    filterBtn.addEventListener("click", applyFilters);
}
var storedExpenses = localStorage.getItem("expensesList");
var expensesList = [];
if (storedExpenses !== null) {
    expensesList = JSON.parse(storedExpenses).map(function (expense) { return ({
        id: expense.id,
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        date: new Date(expense.date),
    }); });
}
function loadExpenses() {
    var storedExpenses = localStorage.getItem("expensesList");
    expensesList = [];
    if (storedExpenses !== null) {
        expensesList = JSON.parse(storedExpenses).map(function (expense) { return ({
            id: expense.id,
            name: expense.name,
            amount: expense.amount,
            category: expense.category,
            date: new Date(expense.date),
        }); });
    }
    renderTable(expensesList);
}
loadExpenses();
function deleteExpense(event) {
    var expenseId = event.target.getAttribute("data-id");
    expensesList = expensesList.filter(function (el) { return el.id !== expenseId; });
    localStorage.setItem("expensesList", JSON.stringify(expensesList));
    loadExpenses();
}
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
    var deleteCell = document.createElement("td");
    deleteCell.setAttribute("data-id", expense.id);
    deleteCell.classList.add("delete-cell");
    deleteCell.classList.add("delete-btn");
    deleteCell.textContent = "x";
    deleteCell.addEventListener("click", deleteExpense);
    if (expense.date instanceof Date &&
        !isNaN(expense.date.getTime()) &&
        expense.date.getFullYear() > 1970) {
        var currentDate = expense.date;
        var formattedDate = "".concat(currentDate.getDate(), "/").concat(currentDate.getMonth() + 1, "/").concat(currentDate.getFullYear());
        dateCell.textContent = formattedDate;
    }
    else {
        dateCell.textContent = "Fecha inválida";
    }
    row.appendChild(dateCell);
    row.appendChild(deleteCell);
    return row;
}
var expenseForm = document.getElementById("expenseForm");
expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var expenseNameInput = document.getElementById("expenseName");
    var expenseName = expenseNameInput.value;
    var expenseAmountInput = document.getElementById("expenseAmount");
    var expenseAmount = parseFloat(expenseAmountInput.value);
    var expenseCategorySelect = document.getElementById("categorySelect");
    var expenseCategory = expenseCategorySelect.value;
    var date = new Date();
    var expenseId = generateRandomId();
    if (expenseName && expenseAmount && expenseCategory) {
        var newExpense = {
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
    }
    else {
        console.log("Datos incompletos");
        return;
    }
});
