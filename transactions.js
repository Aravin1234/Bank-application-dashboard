// Transaction Management
class TransactionManager {
    constructor() {
        this.transactions = [];
        this.init();
    }

    init() {
        this.loadTransactions();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const transactionForm = document.getElementById('transactionForm');
        if (transactionForm) {
            transactionForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    loadTransactions() {
        const currentUser = authManager.getCurrentUser();
        if (!currentUser) return;

        const transactionsData = localStorage.getItem(`transactions_${currentUser.id}`);
        this.transactions = transactionsData ? JSON.parse(transactionsData) : [];
        
        // Sort by date (newest first)
        this.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    saveTransactions() {
        const currentUser = authManager.getCurrentUser();
        if (!currentUser) return;

        localStorage.setItem(`transactions_${currentUser.id}`, JSON.stringify(this.transactions));
    }

    populateAccountSelect() {
        const select = document.getElementById('transAccount');
        if (!select) return;

        const accounts = window.accountManager ? window.accountManager.accounts : [];
        
        select.innerHTML = '<option value="">Select Account</option>' + 
            accounts.map(account => 
                `<option value="${account.id}">${account.accountName} (${account.accountNumber})</option>`
            ).join('');
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const accountId = document.getElementById('transAccount').value;
        const type = document.getElementById('transType').value;
        const amount = parseFloat(document.getElementById('transAmount').value);
        const date = document.getElementById('transDate').value;
        const description = document.getElementById('transDescription').value;

        if (!accountId || !type || !amount || !date) {
            alert('Please fill in all required fields');
            return;
        }

        // Update account balance
        if (window.accountManager) {
            const success = window.accountManager.updateAccountBalance(accountId, amount, type);
            if (!success) {
                alert('Insufficient balance for this transaction');
                return;
            }
        }

        // Create transaction
        const transaction = {
            id: Date.now().toString(),
            accountId,
            type,
            amount,
            date,
            description,
            createdAt: new Date().toISOString()
        };

        this.transactions.unshift(transaction); // Add to beginning
        this.saveTransactions();
        
        // Reset form
        document.getElementById('transactionForm').reset();
        document.getElementById('transDate').value = new Date().toISOString().split('T')[0];
        
        this.loadTransactions();
        this.displayTransactions();
    }

    displayTransactions() {
        const container = document.getElementById('transactionsContainer');
        if (!container) return;

        if (this.transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No Transactions Found</h3>
                    <p>Add your first transaction to get started</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.transactions.map(transaction => {
            const account = window.accountManager ? 
                window.accountManager.getAccountById(transaction.accountId) : null;
            const accountName = account ? account.accountName : 'Unknown Account';
            const accountNumber = account ? account.accountNumber : '-';
            
            const isPositive = transaction.type === 'Deposit';
            const amountClass = isPositive ? 'positive' : 'negative';
            const amountSign = isPositive ? '+' : '-';
            
            const formattedDate = new Date(transaction.date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            return `
                <div class="transaction-item ${transaction.type.toLowerCase()}">
                    <div class="transaction-header">
                        <span class="transaction-type">${transaction.type}</span>
                        <span class="transaction-amount ${amountClass}">
                            ${amountSign}₹${transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div class="transaction-details">
                        <p><strong>Account:</strong> ${accountName} (${accountNumber})</p>
                        <p><strong>Date:</strong> ${formattedDate}</p>
                        ${transaction.description ? `<p><strong>Description:</strong> ${transaction.description}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Initialize transaction manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.transactionManager = new TransactionManager();
    
    // Set default date to today
    const dateInput = document.getElementById('transDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
});

