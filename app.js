//funcion para renderizar la tabla
function renderTable(expenses) {
    var tbody = document.getElementById("expensesList");
    tbody.innerHTML = "";
    expenses.forEach(function (expense) {
        var row = createExpenseRow(expense);
        tbody.appendChild(row);
    });
}
// const expensesList: Expense[] = [];
// let expensesList : Expense[] = JSON.parse(localStorage.getItem("usuarios_guardados")) || [];
// Al cargar los gastos del almacenamiento local
var storedExpenses = localStorage.getItem("expensesList");
var expensesList = [];
if (storedExpenses !== null) {
    expensesList = JSON.parse(storedExpenses).map(function (expense) { return ({
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        date: new Date(expense.date) // Convertir la cadena de fecha a un objeto Date
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
    amountCell.textContent = expense.amount.toString();
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
