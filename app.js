//BUDGET CONTROLLER
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

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

        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
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

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (currentVal) {
                currentVal.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(function (currentVal) {
                return currentVal.getPercentage();
            });
            return allPercentages;
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
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dataLabel: '.budget__title--month'
    };

    var formatNumber = function (num, type) {
        var numSplit, int, decimal;
        //+ or - before number, two decimal points,comma seprating thousands
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //2310 => 2,310
        }



        decimal = numSplit[1];

        console.log(type);
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + decimal;

    };

    var nodeListForEach = function (list, callBack) {
        for (var i = 0; i < list.length; i++) {
            callBack(list[i], i);
        }
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
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }
            else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i  </div> </div>';
            }

            //Replace the placeholder text
            newHTML = html.replace('%id%', obj.id);
            console.log(newHTML);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            //Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: function (selectorId) {
            var element = document.getElementById(selectorId)
            element.parentNode.removeChild(element)
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
            var type;
            obj.budget > 0 ? type = 'inc' : 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');


            if (obj.totalPer > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.totalPer;
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }
                else {
                    current.textContent = '---';
                }
            })
        },

        displayMonth: function () {
            var now, year, month;
            now = new Date();
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dataLabel).textContent = months[month] + ' ' + year;
        },

        changeType: function(){
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDesc + ',' + DOMstrings.inputValue);
            nodeListForEach(fields, function(current){
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
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
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UIController.changeType);
    };

    var updateBudget = function () {
        //Calculate the budget
        budgetController.calculateBudget();
        //Return the budget
        var budget = budgetController.getBudget();
        //Display the budget
        UIController.displayBudget(budget);
    };

    var updatePercentages = function () {
        //Calculate the percentages
        budgetController.calculatePercentages();

        //Read from budget controller
        var percentages = budgetController.getPercentages();
        //Update UI
        UIController.displayPercentages(percentages);
        console.log(percentages);
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

            //Calculate and Update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
        console.log('clicked')
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.id;
        console.log(event.target.parentNode.parentNode.parentNode.parentNode);
        if (itemID) {
            console.log('in')
            //inc-1 //split
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //Delete item from data structure
            budgetController.deleteItem(type, ID);
            console.log('del')
            //Delete item from UI
            UIController.deleteListItem(itemID);
            //Update new totals
            updateBudget();
            //Calculate and Update percentages
            updatePercentages();
        }
    };

    return {
        init: function () {
            UIController.displayMonth();
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