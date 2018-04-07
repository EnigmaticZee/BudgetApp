//BUDGET CONTROLLER
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (currentVal) {
            sum = sum + currentVal.value
        });
        data.totals[type] = sum;
    };


    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            //Create new ID,
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            //Create new item based on inc or exp
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //Push the item to data structure
            data.allItems[type].push(newItem);

            //Return new element
            return newItem;
        },

        calculateBudget: function () {
            //Calculate Total Income and Expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate the budget: Income - Expenses
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the percentage of Income that is spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1
            }


        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                totalPer: data.percentage
            }
        },

        testing: function () {
            console.log(data);
        }
    }
})();

//UI CONTROLLER
var UIController = (function () {
    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage'
    };
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function (obj, type) {
            var html, newHTML, element;
            //Create HTML String with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }
            else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="expense-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i  </div> </div>';
            }

            //Replace the placeholder text
            newHTML = html.replace('%id%', obj.id);
            console.log(newHTML);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', obj.value);

            //Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        clearFields: function () {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function (current, indexNo, array) {
                current.value = "";
            });
            fieldsArray[0].focus();
        },

        displayBudget: function (obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;


            if (obj.totalPer > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.totalPer;
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        getDomstrings: function (obj) {
            return DOMstrings;
        }
    }
})();

//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UIController.getDomstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        })
    };

    var updateBudget = function () {
        //Calculate the budget
        budgetController.calculateBudget();
        //Return the budget
        var budget = budgetController.getBudget();
        //Display the budget
        UIController.displayBudget(budget);
    };

    var ctrlAddItem = function () {
        var input, newItem;
        //Get the filed input data
        input = UIController.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //Add the item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value)

            //Add the item to the UI
            UIController.addListItem(newItem, input.type);

            //Clear the field
            UIController.clearFields();

            //Calculate and Update Budget
            updateBudget();
        }



    };

    return {
        init: function () {
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                totalPer: 0
            });
            setupEventListeners();
        }
    };



})(budgetController, UIController);

controller.init();