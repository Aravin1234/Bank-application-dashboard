// Account CRUD Operations
class AccountManager {
    constructor() {
        this.accounts = [];
        this.editingAccountId = null;
        this.init();
    }

    init() {
        this.loadAccounts();
        this.setupEventListeners();
        this.displayAccounts();
    }

    setupEventListeners() {
        const accountForm = document.getElementById('accountForm');
        if (accountForm) {
            accountForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelEdit());
        }
    }

    loadAccounts() {
        const currentUser = authManager.getCurrentUser();
        if (!currentUser) return;

        const accountsData = localStorage.getItem(`accounts_${currentUser.id}`);
        this.accounts = accountsData ? JSON.parse(accountsData) : [];
    }

    saveAccounts() {
        const currentUser = authManager.getCurrentUser();
        if (!currentUser) return;

        localStorage.setItem(`accounts_${currentUser.id}`, JSON.stringify(this.accounts));
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const accountName = document.getElementById('accountName').value;
        const accountType = document.getElementById('accountType').value;
        const accountNumber = document.getElementById('accountNumber').value;
        const balance = parseFloat(document.getElementById('balance').value);
        const description = document.getElementById('description').value;

        if (this.editingAccountId) {
            // Update existing account
            const index = this.accounts.findIndex(acc => acc.id === this.editingAccountId);
            if (index !== -1) {
                this.accounts[index] = {
                    ...this.accounts[index],
                    accountName,
                    accountType,
                    accountNumber,
                    balance,
                    description,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Create new account
            const newAccount = {
                id: Date.now().toString(),
                accountName,
                accountType,
                accountNumber,
                balance,
                description,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.accounts.push(newAccount);
        }

        this.saveAccounts();
        this.resetForm();
        this.displayAccounts();
        this.loadAccountsTable();
    }

    editAccount(accountId) {
        const account = this.accounts.find(acc => acc.id === accountId);
        if (!account) return;

        this.editingAccountId = accountId;
        
        document.getElementById('accountId').value = account.id;
        document.getElementById('accountName').value = account.accountName;
        document.getElementById('accountType').value = account.accountType;
        document.getElementById('accountNumber').value = account.accountNumber;
        document.getElementById('balance').value = account.balance;
        document.getElementById('description').value = account.description || '';

        document.getElementById('formTitle').textContent = 'Edit Account';
        document.getElementById('submitBtn').textContent = 'Update Account';
        document.getElementById('cancelBtn').style.display = 'block';

        // Scroll to form
        document.querySelector('.crud-form').scrollIntoView({ behavior: 'smooth' });
    }

    deleteAccount(accountId) {
        if (confirm('Are you sure you want to delete this account?')) {
            this.accounts = this.accounts.filter(acc => acc.id !== accountId);
            this.saveAccounts();
            this.displayAccounts();
            this.loadAccountsTable();
        }
    }

    cancelEdit() {
        this.editingAccountId = null;
        this.resetForm();
    }

    resetForm() {
        document.getElementById('accountForm').reset();
        document.getElementById('accountId').value = '';
        document.getElementById('formTitle').textContent = 'Create New Account';
        document.getElementById('submitBtn').textContent = 'Create Account';
        document.getElementById('cancelBtn').style.display = 'none';
        this.editingAccountId = null;
    }

    displayAccounts() {
        this.loadAccounts();
        
        // Display primary account
        const primaryAccount = this.accounts[0] || null;
        
        const primaryBalanceEl = document.getElementById('primaryBalance');
        const primaryAccountNumberEl = document.getElementById('primaryAccountNumber');
        const primaryAccountHolderEl = document.getElementById('primaryAccountHolder');
        
        if (primaryAccount) {
            const currentUser = authManager.getCurrentUser();
            if (primaryBalanceEl) primaryBalanceEl.textContent = `₹${primaryAccount.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            if (primaryAccountNumberEl) primaryAccountNumberEl.textContent = primaryAccount.accountNumber;
            if (primaryAccountHolderEl) primaryAccountHolderEl.textContent = currentUser ? currentUser.username : '-';
        } else {
            if (primaryBalanceEl) primaryBalanceEl.textContent = '₹0.00';
            if (primaryAccountNumberEl) primaryAccountNumberEl.textContent = '-';
            if (primaryAccountHolderEl) primaryAccountHolderEl.textContent = '-';
        }

        // Display all accounts
        const accountsContainer = document.getElementById('accountsContainer');
        if (!accountsContainer) return;

        if (this.accounts.length === 0) {
            accountsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No Accounts Found</h3>
                    <p>Create your first account to get started</p>
                </div>
            `;
            return;
        }

        accountsContainer.innerHTML = this.accounts.map(account => `
            <div class="account-item">
                <div class="account-item-info">
                    <h4>${account.accountName}</h4>
                    <p><strong>Type:</strong> ${account.accountType}</p>
                    <p><strong>Account Number:</strong> ${account.accountNumber}</p>
                </div>
                <div class="account-item-balance">
                    <div class="balance">₹${account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
            </div>
        `).join('');
    }

    loadAccountsTable() {
        this.loadAccounts();
        
        const tableBody = document.getElementById('accountsTableBody');
        if (!tableBody) return;

        if (this.accounts.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px;">
                        <div class="empty-state">
                            <h3>No Accounts Found</h3>
                            <p>Create your first account to get started</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.accounts.map(account => `
            <tr>
                <td>${account.accountName}</td>
                <td>${account.accountType}</td>
                <td>${account.accountNumber}</td>
                <td><strong>₹${account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-success" onclick="window.accountManager.editAccount('${account.id}')">Edit</button>
                        <button class="btn btn-danger" onclick="window.accountManager.deleteAccount('${account.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getAccountById(accountId) {
        return this.accounts.find(acc => acc.id === accountId);
    }

    updateAccountBalance(accountId, amount, type) {
        const account = this.getAccountById(accountId);
        if (!account) return false;

        if (type === 'Deposit') {
            account.balance += amount;
        } else if (type === 'Withdrawal') {
            if (account.balance >= amount) {
                account.balance -= amount;
            } else {
                return false; // Insufficient balance
            }
        }

        account.updatedAt = new Date().toISOString();
        this.saveAccounts();
        this.displayAccounts();
        this.loadAccountsTable();
        return true;
    }
}

// Initialize account manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.accountManager = new AccountManager();
});

