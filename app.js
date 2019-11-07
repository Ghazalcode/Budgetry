/*

Architecture pattern of our code which are 
- budgetController
- UIController
- appController

*/

var budgetController = (function() {
    //creating expense and income data structure

    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //calculate totals
    var calculateTotal = function(type){
        var sum = 0;
        data.allItem[type].forEach(function(current){
            sum += current.value;
        });

        //retrieve the value to the right object
        data.totals[type] = sum;
    }
    //all data for our application
    var data = {
        allItem: {
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

    return{
        addItem: function(type,des,val){
            var newItem, ID;

            //instantiating the ID
            if(data.allItem[type].length > 0){
                ID = data.allItem[type][data.allItem[type].length -1 ].id + 1;
            }else{
                ID = 0;
            }
            
            if(type === 'inc'){
                newItem = new Income(ID,des,val);
            }else if(type === 'exp'){
                newItem = new Expense(ID, des,val);
            }
            //adding new data into our data structure 
            data.allItem[type].push(newItem);
            //return the item
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;
            //grab the id
            ids = data.allItem[type].map(function(current) {
                return current.id;
            });

            //get the index number of the input id
            index = ids.indexOf(id);
            //remove it from the data structure
            data.allItem[type].splice(index, 1);
        },

        calculateBudget: function(){
            //calculate total expenses and income
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate budget, income - expenses
            data.budget = data.totals['inc'] - data.totals['exp'];
            //calculate the percentage of our spendings
            if(data.totals.inc > 0){
                data.percentage = Math.round(( data.totals['exp']/ data.totals['inc']) * 100);
            }else{
                data.percentage = -1;
            }
            
        },

        calculatePercentages: function() {
            
            /*
            a=20
            b=10
            c=40
            income = 100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
            */
            
            data.allItems.exp.forEach(function(cur) {
               cur.calcPercentage(data.totals.inc);
            });
        },
        
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            //needs to return 4 value i.e. inc, exp, budget, and percentage
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log(data);
        }
    }
    


})();

var UIController = (function() {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    
    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };
    
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    //return something from the module
    return{
        getInput: function(){
            //3 data has to be returned so an object is the best solution
            return {
                type:document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var newHtml, html, element;

            //create a string of html with placeholder
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace the placeholder with actual content
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //add it to the DOM element

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


        },

        

        deleteListItem: function(selectorID){
            var el;
            el = document.getElementById(selectorID);
            /*
            - To delete element from the dom you need to first select its parent and then reference the child you want to delete
            */
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var field, fieldArr;

            //select all the fields
            field = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            /*
                It returns a list of item
                but with little trick, we can convert it to an empty array
            */
           fieldArr = Array.prototype.slice.call(field);

           //looping throught the array
           fieldArr.forEach(function(current, index, array){
                current.value = '';
           });

           //set focus back to the first element
           fieldArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },

        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        
        displayMonth: function() {
            var now, months, month, year;
            
            now = new Date();
            //var christmas = new Date(2016, 11, 25);
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    }
})();

var appController = (function(budgetCtl, UICtrl) {

    //setup init function 
    var setupEventListener = function(){
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        //activate an event delegation on the parent element
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType); 
    }

    var updateBudget = function(){
        var budget;
        //1. Calculate the budget
        budgetCtl.calculateBudget();
        //2. Update the budget
        budget = budgetCtl.getBudget();

        //3. Display the budget in the UI
        UICtrl.displayBudget(budget);
    };  
    
    
    var updatePercentages = function() {
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };
    var ctrlAddItem = function(){
        var input, newItem;
        //1. Get field input data 
        input = UICtrl.getInput();
        if(input.inputDescription !== "" && !isNaN(input.value) && input.value > 0){
            //2. Add the item to the budget controller
            newItem = budgetCtl.addItem(input.type, input.description, input.value);
            //3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            //4. Clear all the input field
            UICtrl.clearFields();
            //5.Update and calculate the budget
            updateBudget();
            // 6. Calculate and update percentages
            updatePercentages();
        } 
    };

    var ctrlDeleteItem = function(event){
        var type, splitID, ID, itemID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            splitID = itemID.split('-');
            //grab the type
            type = splitID[0];
            //grab the id
            ID = splitID[1];
            //1. Delete the element from the data structure
            budgetCtl.deleteItem(type, ID);
            //2. Delete the element from the UI
            UICtrl.deleteListItem(itemID);
            //3. Re-calculate the budget
            updateBudget();
            // 4. Calculate and update percentages
            updatePercentages();
        }

        
    }

    return {
        init: function(){
            console.log(`Application is running!`);
            UICtrl.displayMonth();
            UICtrl.displayBudget(
                {
                    budget:0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1
                }
            );
            setupEventListener();
        }
    }
    
})(budgetController, UIController);
//start out application
appController.init();
/*
// addEventListener version
window.addEventListener('online', (event) => {
    console.log("You are now connected to the network.");
});

// ononline version
window.ononline = (event) => {
  console.log("You are now connected to the network.");
};
*/
