// Enhanced script.js with setup process and animations
class PersonalFinanceManager {
    constructor() {
        this.transactions = [];
        this.prefixSum = [0.0];
        this.categoryExpenses = new Map();
        this.categoryCount = new Map();
        this.nextId = 1;
        this.currentBalance = 0.0;
        this.undoStack = [];
        this.recentTransactions = [];
        
        // Budget setup data
        this.budgetData = {
            salary: 0,
            rent: 0,
            food: 0,
            transportation: 0,
            entertainment: 0,
            other: 0
        };
        
        this.currentStep = 1;
        this.initializeEventListeners();
        this.showWelcomeScreen();
    }

    showWelcomeScreen() {
        document.getElementById('welcome-screen').classList.add('active');
    }

    initializeEventListeners() {
        // Welcome screen
        document.getElementById('start-setup').addEventListener('click', () => {
            this.showSetupScreen();
        });

        // Main form
        document.getElementById('transaction-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addTransactionFromForm();
        });

        // Other buttons
        document.getElementById('undo-btn').addEventListener('click', () => this.undoTransaction());
        document.getElementById('detect-fraud').addEventListener('click', () => this.detectFraudFromForm());

        // Set today's date
        document.getElementById('date').value = new Date().toISOString().split('T')[0];
    }

    showSetupScreen() {
        document.getElementById('welcome-screen').classList.remove('active');
        setTimeout(() => {
            document.getElementById('setup-screen').classList.add('active');
        }, 100);
    }

    // Budget setup functions
    nextStep(step) {
        // Validate current step
        const currentInput = document.querySelector(`#step-${this.currentStep} input`);
        if (!currentInput.value) {
            this.showNotification('Please fill in the required field!', 'error');
            return;
        }

        // Save current step data
        this.saveBudgetStep(this.currentStep, parseFloat(currentInput.value));

        // Update progress
        this.updateProgress(step);

        // Show next step
        document.getElementById(`step-${this.currentStep}`).classList.remove('active');
        document.getElementById(`step-${step}`).classList.add('active');
        this.currentStep = step;
    }

    prevStep(step) {
        document.getElementById(`step-${this.currentStep}`).classList.remove('active');
        document.getElementById(`step-${step}`).classList.add('active');
        this.currentStep = step;
        this.updateProgress(step);
    }

    saveBudgetStep(step, value) {
        switch(step) {
            case 1: this.budgetData.salary = value; break;
            case 2: this.budgetData.rent = value; break;
            case 3: this.budgetData.food = value; break;
            case 4: this.budgetData.transportation = value; break;
            case 5: this.budgetData.entertainment = value; break;
            case 6: this.budgetData.other = value; break;
        }
    }

    updateProgress(step) {
        const progress = (step / 6) * 100;
        document.getElementById('setup-progress').style.width = progress + '%';
    }

    completeSetup() {
        const currentInput = document.querySelector(`#step-${this.currentStep} input`);
        if (!currentInput.value) {
            this.showNotification('Please fill in the required field!', 'error');
            return;
        }

        this.saveBudgetStep(this.currentStep, parseFloat(currentInput.value));

        // Add initial salary as income
        this.addTransaction(this.budgetData.salary, "Salary", "Monthly Salary", new Date().toISOString().split('T')[0], true);
        
        // Add budget items as actual expenses (not just allocations)
        if (this.budgetData.rent > 0) {
            this.addTransaction(this.budgetData.rent, "Rent", "Monthly Rent", new Date().toISOString().split('T')[0], false);
        }
        if (this.budgetData.food > 0) {
            this.addTransaction(this.budgetData.food, "Food", "Monthly Food Budget", new Date().toISOString().split('T')[0], false);
        }
        if (this.budgetData.transportation > 0) {
            this.addTransaction(this.budgetData.transportation, "Transportation", "Monthly Transportation", new Date().toISOString().split('T')[0], false);
        }
        if (this.budgetData.entertainment > 0) {
            this.addTransaction(this.budgetData.entertainment, "Entertainment", "Monthly Entertainment", new Date().toISOString().split('T')[0], false);
        }
        if (this.budgetData.other > 0) {
            this.addTransaction(this.budgetData.other, "Other", "Monthly Other Expenses", new Date().toISOString().split('T')[0], false);
        }

        this.showMainScreen();
    }

    showMainScreen() {
        document.getElementById('setup-screen').classList.remove('active');
        setTimeout(() => {
            document.getElementById('main-screen').classList.add('active');
            this.updateBudgetDisplay();
            this.updateAnalysis();
            this.updateDisplay();
        }, 100);
    }

    updateBudgetDisplay() {
        document.getElementById('display-salary').textContent = this.budgetData.salary.toFixed(2);
        document.getElementById('display-rent').textContent = this.budgetData.rent.toFixed(2);
        document.getElementById('display-food').textContent = this.budgetData.food.toFixed(2);
        document.getElementById('display-transportation').textContent = this.budgetData.transportation.toFixed(2);
        document.getElementById('display-entertainment').textContent = this.budgetData.entertainment.toFixed(2);
        document.getElementById('display-other').textContent = this.budgetData.other.toFixed(2);

        // Update usage bars
        this.updateUsageBars();
    }

    updateUsageBars() {
        const categories = ['rent', 'food', 'transportation', 'entertainment', 'other'];
        categories.forEach(category => {
            const spent = this.categoryExpenses.get(category.charAt(0).toUpperCase() + category.slice(1)) || 0;
            const budget = this.budgetData[category];
            const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
            
            const usageBar = document.getElementById(`${category}-usage`);
            if (usageBar) {
                usageBar.style.width = percentage + '%';
                // Change color based on usage
                if (percentage > 90) {
                    usageBar.style.background = 'linear-gradient(90deg, #ff6b6b, #ff5252)';
                } else if (percentage > 70) {
                    usageBar.style.background = 'linear-gradient(90deg, #ffd93d, #ff6b35)';
                } else {
                    usageBar.style.background = 'linear-gradient(90deg, #00ff87, #60efff)';
                }
            }
        });
    }

    updateAnalysis() {
        const totalBudgetedExpenses = this.budgetData.rent + this.budgetData.food + 
                                      this.budgetData.transportation + this.budgetData.entertainment + 
                                      this.budgetData.other;
        const totalIncome = this.budgetData.salary;
        const availableForSavings = totalIncome - totalBudgetedExpenses;

        document.getElementById('total-income').textContent = totalIncome.toFixed(2);
        document.getElementById('total-budgeted').textContent = totalBudgetedExpenses.toFixed(2);
        document.getElementById('savings-amount').textContent = availableForSavings.toFixed(2);

        const resultDiv = document.getElementById('analysis-result');
        if (availableForSavings > 0) {
            resultDiv.className = 'analysis-result profit';
            resultDiv.innerHTML = `<i class="fas fa-arrow-up"></i> Great! You can save $${availableForSavings.toFixed(2)} this month!`;
        } else {
            resultDiv.className = 'analysis-result loss';
            resultDiv.innerHTML = `<i class="fas fa-arrow-down"></i> Warning! You're overspending by $${Math.abs(availableForSavings).toFixed(2)}`;
        }
    }

    // Add transaction method
    addTransaction(amount, category, description, date, isIncome) {
        const transaction = {
            id: this.nextId++,
            amount: amount,
            category: category,
            description: description,
            date: date,
            isIncome: isIncome
        };

        this.transactions.push(transaction);
        
        // Update balance
        const balanceChange = isIncome ? amount : -amount;
        this.currentBalance += balanceChange;
        this.prefixSum.push(this.currentBalance);

        // Update categories for expenses
        if (!isIncome) {
            const currentExpense = this.categoryExpenses.get(category) || 0;
            this.categoryExpenses.set(category, currentExpense + amount);
            
            const currentCount = this.categoryCount.get(category) || 0;
            this.categoryCount.set(category, currentCount + 1);
        }

        // Add to undo stack
        this.undoStack.push(transaction);
        if (this.undoStack.length > 5) {
            this.undoStack.splice(0, this.undoStack.length - 5);
        }

        return transaction;
    }

    async addTransactionFromForm() {
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        const date = document.getElementById('date').value;
        const type = document.getElementById('type').value;
        const isIncome = type === 'income';

        if (!amount || !category || !description || !date) {
            this.showNotification('Please fill all fields!', 'error');
            return;
        }

        this.addTransaction(amount, category, description, date, isIncome);
        this.updateDisplay();
        this.updateBudgetDisplay();
        this.updateAnalysis();
        
        // Reset form
        document.getElementById('transaction-form').reset();
        document.getElementById('date').value = new Date().toISOString().split('T')[0];
        
        this.showNotification('Transaction added successfully!', 'success');
    }

    updateDisplay() {
        // Update balance
        document.getElementById('current-balance').textContent = this.currentBalance.toFixed(2);
        
        // Update top expenses
        this.updateTopExpenses();
        
        // Update top categories
        this.updateTopCategories();
        
        // Update monthly average
        this.updateMonthlyAverage();
        
        // Update transaction history
        this.updateTransactionHistory();
    }

    updateMonthlyAverage() {
        if (this.transactions.length === 0) {
            document.getElementById('monthly-average').textContent = '0.00';
            return;
        }
        
        // Group expenses by month
        const monthlyTotals = new Map();
        
        this.transactions.forEach(transaction => {
            if (!transaction.isIncome) {
                // Extract year-month from date
                const yearMonth = transaction.date.substring(0, 7); // Gets "YYYY-MM"
                const currentTotal = monthlyTotals.get(yearMonth) || 0;
                monthlyTotals.set(yearMonth, currentTotal + transaction.amount);
            }
        });
        
        if (monthlyTotals.size === 0) {
            document.getElementById('monthly-average').textContent = '0.00';
            return;
        }
        
        // Calculate total expenses
        let totalExpenses = 0;
        monthlyTotals.forEach(monthTotal => {
            totalExpenses += monthTotal;
        });
        
        // Calculate monthly average
        const monthlyAverage = totalExpenses / monthlyTotals.size;
        document.getElementById('monthly-average').textContent = monthlyAverage.toFixed(2);
    }

    updateTopExpenses() {
        const expenses = this.transactions
            .filter(t => !t.isIncome)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        const container = document.getElementById('top-expenses-list');
        container.innerHTML = '';

        expenses.forEach(expense => {
            const div = document.createElement('div');
            div.className = 'expense-item';
            div.innerHTML = `
                <span>${expense.description}</span>
                <span>$${expense.amount.toFixed(2)}</span>
            `;
            container.appendChild(div);
        });
    }

    updateTopCategories() {
        const categoryTotals = Array.from(this.categoryExpenses.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const container = document.getElementById('top-categories-list');
        container.innerHTML = '';

        categoryTotals.forEach(([category, total]) => {
            const div = document.createElement('div');
            div.className = 'category-item';
            div.innerHTML = `
                <span>${category}</span>
                <span>$${total.toFixed(2)}</span>
            `;
            container.appendChild(div);
        });
    }

    updateTransactionHistory() {
        const tbody = document.querySelector('#transaction-history tbody');
        tbody.innerHTML = '';

        this.transactions.slice(-10).reverse().forEach(transaction => {
            const row = document.createElement('tr');
            row.className = transaction.isIncome ? 'income-row' : 'expense-row';
            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>$${transaction.amount.toFixed(2)}</td>
                <td>${transaction.category}</td>
                <td>${transaction.description}</td>
                <td>${transaction.date}</td>
                <td>${transaction.isIncome ? 'Income' : 'Expense'}</td>
            `;
            tbody.appendChild(row);
        });
    }

    undoTransaction() {
        if (this.undoStack.length === 0) {
            this.showNotification('No transactions to undo!', 'error');
            return;
        }

        const lastTransaction = this.undoStack.pop();
        
        // Remove from transactions array
        const index = this.transactions.findIndex(t => t.id === lastTransaction.id);
        if (index !== -1) {
            this.transactions.splice(index, 1);
        }

        // Update balance
        const balanceChange = lastTransaction.isIncome ? -lastTransaction.amount : lastTransaction.amount;
        this.currentBalance += balanceChange;
        this.prefixSum.pop();

        // Update categories
        if (!lastTransaction.isIncome) {
            const currentExpense = this.categoryExpenses.get(lastTransaction.category) || 0;
            const newExpense = currentExpense - lastTransaction.amount;
            if (newExpense <= 0) {
                this.categoryExpenses.delete(lastTransaction.category);
            } else {
                this.categoryExpenses.set(lastTransaction.category, newExpense);
            }
        }

        this.updateDisplay();
        this.updateBudgetDisplay();
        this.updateAnalysis();
        this.showNotification('Transaction undone successfully!', 'success');
    }

    detectFraudFromForm() {
        const duplicates = new Map();
        const largeExpenses = [];
        
        // Check for duplicates
        this.transactions.forEach(transaction => {
            const pattern = `${transaction.amount}-${transaction.category}-${transaction.date}`;
            duplicates.set(pattern, (duplicates.get(pattern) || 0) + 1);
        });

        // Check for large expenses
        const expenses = this.transactions.filter(t => !t.isIncome).map(t => t.amount);
        if (expenses.length > 0) {
            expenses.sort((a, b) => a - b);
            const median = expenses[Math.floor(expenses.length / 2)];
            const threshold = median * 3;
            
            this.transactions.forEach(transaction => {
                if (!transaction.isIncome && transaction.amount > threshold) {
                    largeExpenses.push(transaction);
                }
            });
        }

        // Display results
        const container = document.getElementById('fraud-results');
        container.innerHTML = '';

        let foundIssues = false;

        // Show duplicates
        duplicates.forEach((count, pattern) => {
            if (count > 1) {
                foundIssues = true;
                const div = document.createElement('div');
                div.className = 'fraud-item duplicate';
                div.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Duplicate pattern found: ${pattern} (${count} times)`;
                container.appendChild(div);
            }
        });

        // Show large expenses
        largeExpenses.forEach(expense => {
            foundIssues = true;
            const div = document.createElement('div');
            div.className = 'fraud-item large';
            div.innerHTML = `<i class="fas fa-warning"></i> Large expense: $${expense.amount.toFixed(2)} in ${expense.category}`;
            container.appendChild(div);
        });

        if (!foundIssues) {
            const div = document.createElement('div');
            div.className = 'fraud-item safe';
            div.innerHTML = `<i class="fas fa-check-circle"></i> No suspicious activity detected`;
            container.appendChild(div);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notification-container') || this.createNotificationContainer();
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
        return container;
    }
}

// Initialize the application
const pfm = new PersonalFinanceManager();

// Global functions for HTML onclick events
function nextStep(step) {
    pfm.nextStep(step);
}

function prevStep(step) {
    pfm.prevStep(step);
}

function completeSetup() {
    pfm.completeSetup();
}
