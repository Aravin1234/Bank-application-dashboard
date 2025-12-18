// Authentication and User Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is logged in
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser && window.location.pathname.includes('index.html')) {
            window.location.href = 'dashboard.html';
            return;
        }

        if (!currentUser && window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'index.html';
            return;
        }

        if (currentUser) {
            this.currentUser = JSON.parse(currentUser);
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Toggle between login and register
        const registerLink = document.getElementById('registerLink');
        const loginLink = document.getElementById('loginLink');
        
        if (registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleForms();
            });
        }

        if (loginLink) {
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleForms();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Display current user
        const currentUserSpan = document.getElementById('currentUser');
        if (currentUserSpan && this.currentUser) {
            currentUserSpan.textContent = `Welcome, ${this.currentUser.username}`;
        }
    }

    toggleForms() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const errorMessage = document.getElementById('errorMessage');

        if (loginForm && registerForm) {
            loginForm.classList.toggle('hidden');
            registerForm.classList.toggle('hidden');
            if (errorMessage) {
                errorMessage.classList.add('hidden');
            }
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const users = this.getUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'dashboard.html';
        } else {
            this.showError('Invalid username or password');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const email = document.getElementById('regEmail').value;

        const users = this.getUsers();
        
        if (users.find(u => u.username === username)) {
            this.showError('Username already exists');
            return;
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            password,
            email,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Auto login after registration
        this.currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        window.location.href = 'dashboard.html';
    }

    handleLogout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    getUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    getCurrentUser() {
        return this.currentUser;
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('hidden');
            setTimeout(() => {
                errorMessage.classList.add('hidden');
            }, 5000);
        }
    }
}

// Initialize auth manager
const authManager = new AuthManager();

