// Dashboard Navigation and Page Management
class DashboardManager {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        this.setupMenuListeners();
        this.loadPage(this.currentPage);
    }

    setupMenuListeners() {
        const menuItems = document.querySelectorAll('.nav-link');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                this.switchPage(page);
            });
        });
    }

    switchPage(pageName) {
        // Update menu active state
        document.querySelectorAll('.nav-link').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === pageName) {
                item.classList.add('active');
            }
        });

        // Update page visibility
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
            this.loadPage(pageName);
        }
    }

    loadPage(pageName) {
        switch(pageName) {
            case 'home':
                // Initialize carousel if not already initialized
                if (window.carouselManager && !window.carouselManager.autoPlayInterval) {
                    window.carouselManager.startAutoPlay();
                }
                break;
            case 'account-status':
                if (window.accountManager) {
                    window.accountManager.displayAccounts();
                }
                break;
            case 'manage-accounts':
                if (window.accountManager) {
                    window.accountManager.loadAccountsTable();
                }
                break;
            case 'transactions':
                if (window.transactionManager) {
                    window.transactionManager.loadTransactions();
                    window.transactionManager.displayTransactions();
                    window.transactionManager.populateAccountSelect();
                }
                break;
            case 'grievance':
                this.setupGrievanceForm();
                break;
        }
    }

    setupGrievanceForm() {
        const grievanceForm = document.getElementById('grievanceForm');
        if (grievanceForm && !grievanceForm.dataset.listenerAdded) {
            grievanceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const type = document.getElementById('grievanceType').value;
                const subject = document.getElementById('grievanceSubject').value;
                const description = document.getElementById('grievanceDescription').value;

                // Save grievance (using localStorage)
                const currentUser = authManager.getCurrentUser();
                if (currentUser) {
                    const grievances = JSON.parse(localStorage.getItem(`grievances_${currentUser.id}`) || '[]');
                    const newGrievance = {
                        id: Date.now().toString(),
                        type,
                        subject,
                        description,
                        status: 'Submitted',
                        createdAt: new Date().toISOString()
                    };
                    grievances.push(newGrievance);
                    localStorage.setItem(`grievances_${currentUser.id}`, JSON.stringify(grievances));

                    // Show success message
                    const statusDiv = document.getElementById('grievanceStatus');
                    if (statusDiv) {
                        statusDiv.textContent = 'Grievance submitted successfully! Reference ID: ' + newGrievance.id;
                        statusDiv.classList.add('show');
                        setTimeout(() => {
                            statusDiv.classList.remove('show');
                        }, 5000);
                    }

                    // Reset form
                    grievanceForm.reset();
                }
            });
            grievanceForm.dataset.listenerAdded = 'true';
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});

