//Module pattern -- clousers and IIFE

/////////////////////////BUDGET CONTROLLER//////////////////////////////
var budgetController = (function(){
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);           
        }
        else{
            this.percentage = -1;
        }

    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var data = {
        allItems: {
            expense: [],
            income: []
        },
        totals: {
            expense: 0,
            income: 0
        },
        budget: 0,
        percentage: -1
    };
    
    var calculateTotal = function(type){
        var sum = 0;
        
        data.allItems[type].forEach(function(curr){
            sum += curr.value;
        });
        data.totals[type] = sum;
    };
    
    return{
        addItem: function(type, des, val){
            var newItem;
            
            //Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else{
                ID = 0;
            }


            //Create new item based on inc or exp type
            if(type === 'expense'){
                newItem = new Expense(ID, des, val);
            }
            else{
                newItem = new Income(ID, des, val);
            }

            //push it into the data structure
            data.allItems[type].push(newItem);

            //reutrn the new item
            return newItem;
         
        },
        
        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal('expense');
            calculateTotal('income')
            
            
            //calculate the budget: inc - expenses
            data.budget = data.totals.income - data.totals.expense;

            //calculate the percentage of income that we spent
            if(data.totals.income > 0){
                data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
            }
            else{
                data.percentage = -1;
            }
        },
        
        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.income,
                totalExp: data.totals.expense,
                percentage: data.percentage
                
            }
            
        },
        
        calculatePercentages: function(){
            data.allItems.expense.forEach(function(cur){
               cur.calcPercentage(data.totals.income); 
            });
        
        },
        
        getPercentages: function(){
            var allPerc = data.allItems.expense.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
         },
        
        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            
            index = ids.indexOf(id);
        
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        
        },
        
        testing: function(){
            console.log(data);
        }
    };
    
})();

/////////////////////////UI CONTROLLER//////////////////////////////
var UIController = (function(){
    
    //Centralized place for all the classes and ids on the html file
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    
    var formatNumber = function(num, type){
            var numSplit, int, dec
            num = Math.abs(num);
            num = num.toFixed(2); //method on the number prototype
            numSplit = num.split('.');
            
            int = numSplit[0];

            if(int.length > 3){
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            dec = numSplit[1];
        
            return (type === 'expense' ? '-' : '+') + ' ' + int + '.' + dec;
        }
    
    var nodeListForEach = function(list, callback){
                for(var i = 0; i < list.length; i++){
                    callback(list[i], i);
                }
            };
    
    
    return{
        getinput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value, //says either expense or income
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
                
            };
        },
        
        getDOMstrings: function(){
            return DOMstrings;
        },
        
        addListItem: function(obj, type){
            var html, newHtml, element;
            
            //Create HTML string with placeholder text
            if(type === 'income'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div>                     <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else{
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div>             <div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            //Replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value));
            
            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function(selectorID){
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },
        
        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj){
            
            
            obj.budget > 0 ? type = 'income' : type = 'expense';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'income');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'expense');
            if(obj.percentage > 0){
               document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%'; 
            }
            else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },
        
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
//            console.log(fields);
            
            
            
            nodeListForEach(fields, function(current, index){
//                console.log(percentages, current, index)
                if(percentages[index] > 0){
                   current.textContent = percentages[index] + '%';  
                }
                else{
                    current.textContent = '---';
                }
                
            });
        },
        
        displayMonth: function(){
            var now, year, month, months; 
            
            months = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
            now = new Date();
            year = now.getFullYear();
            month = months[now.getMonth()];
            document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;
            
        },
        
        changedType: function(){
            var fields;
            fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        }
        
        
    };
    
})();


/////////////////////////GLOBAL APP CONTROLLER//////////////////////////////
var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListeners = function(){
        
        var DOM = UICtrl.getDOMstrings(); //This is only required for envent listeners
        
        //event listeners for button click
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        //key press event listner
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){ //key code for ENTER
                ctrlAddItem();
            }

        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    
    //Calculate and update budget
    var updateBudget = function(){
        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        //2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        
        //6. Display the budget on the UI
        //console.log(budget);
        UICtrl.displayBudget(budget);
    };
    
    //update percentages
    var updatePercentages = function(){
      
        //calculate percentages
        budgetCtrl.calculatePercentages();
        
        //read from budget controller
        var percentages = budgetCtrl.getPercentages();
        
        //update the ui with new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    
    
    //Add Item method. This will be called by event listeners
    var ctrlAddItem = function(){
        
        var input, newItem;
        
        //1. Get the field input data
        input = UICtrl.getinput();
        
        //2. Add the item to budget controller
        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
            
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            
            //3. Add new item to UI
            UICtrl.addListItem(newItem, input.type);
            
            //4. Clear the fields
            UICtrl.clearFields();
            
            //5.Calculate and update budget
            updateBudget();
            
            //update percentages
            updatePercentages();
        }
        

    };
    
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, id;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
            
            //1. delete item from data structure
            console.log(type, id)
            budgetCtrl.deleteItem(type, id);
            
            
            //2. delete item from UI
            UICtrl.deleteListItem(itemID);
            
            //3. update budget
            updateBudget();
            
            //update percentages
            updatePercentages();
        }
        
    };
    
    return{
        init: function(){
            console.log('Application has started successfully. You may work on budget now!!!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({ budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
             });
            setupEventListeners();
        }
    }


})(budgetController, UIController);


controller.init();