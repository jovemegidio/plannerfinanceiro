// =============================================
// Planner Financeiro - Sistema Completo
// =============================================

class FinanceController {
    constructor() {
        // Dados persistidos
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.budgets = JSON.parse(localStorage.getItem('budgets')) || {};
        this.recurringTransactions = JSON.parse(localStorage.getItem('recurringTransactions')) || [];
        this.customCategories = JSON.parse(localStorage.getItem('customCategories')) || { income: [], expense: [] };
        this.darkMode = localStorage.getItem('darkMode') === 'true';

        // Categorias padrão
        this.defaultCategories = {
            income: ['Salário', 'Freelance', 'Investimentos', 'Vendas', 'Presente', 'Bonificação', 'Aluguel Recebido', 'Dividendos', 'Outros'],
            expense: ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Entretenimento', 'Roupas', 'Tecnologia', 'Contas', 'Academia', 'Restaurantes', 'Viagens', 'Pets', 'Beleza', 'Presentes', 'Doações', 'Seguros', 'Impostos', 'Outros']
        };

        // Paginação
        this.currentPage = 1;
        this.itemsPerPage = 20;

        // Estado
        this.currentEditId = null;
        this.charts = {};
        this.chartAvailable = typeof Chart !== 'undefined';

        this.init();
    }

    // Categorias = padrão + personalizadas (sem duplicatas)
    get categories() {
        return {
            income: [...new Set([...this.defaultCategories.income, ...this.customCategories.income])],
            expense: [...new Set([...this.defaultCategories.expense, ...this.customCategories.expense])]
        };
    }

    // =============================================
    // INICIALIZAÇÃO
    // =============================================
    init() {
        this.applyDarkMode();
        this.processRecurringTransactions();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.updateDisplay();
        this.setDefaultDate();
        this.waitForChartJs();
        this.setupAutoBackup();
        this.registerServiceWorker();
    }

    waitForChartJs() {
        if (typeof Chart !== 'undefined') {
            this.chartAvailable = true;
            this.initializeCharts();
            return;
        }
        let retries = 0;
        const interval = setInterval(() => {
            if (typeof Chart !== 'undefined') {
                this.chartAvailable = true;
                this.initializeCharts();
                clearInterval(interval);
            } else if (++retries >= 15) {
                clearInterval(interval);
                console.warn('Chart.js não carregou. Gráficos desabilitados.');
                document.querySelectorAll('.chart-wrapper').forEach(el => {
                    el.innerHTML = '<p class="chart-error"><i class="fas fa-exclamation-triangle"></i> Gráficos indisponíveis (Chart.js não carregou)</p>';
                });
            }
        }, 500);
    }

    // =============================================
    // EVENT LISTENERS
    // =============================================
    setupEventListeners() {
        // Transações
        document.getElementById('addTransactionBtn').addEventListener('click', () => this.openModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal('transactionModal'));
        document.getElementById('transactionForm').addEventListener('submit', (e) => { e.preventDefault(); this.handleFormSubmit(); });
        document.getElementById('transactionType').addEventListener('change', (e) => this.updateCategoryOptions(e.target.value, 'transactionCategory'));

        // Event delegation para ações de transação (XSS-safe)
        document.getElementById('transactionsList').addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const { action, id } = btn.dataset;
            if (action === 'edit') {
                const t = this.transactions.find(t => t.id === id);
                if (t) this.openModal(t);
            } else if (action === 'delete') {
                this.deleteTransaction(id);
            }
        });

        // Fechar modais
        document.querySelectorAll('.close[data-modal]').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(btn.dataset.modal));
        });
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(btn.dataset.closeModal));
        });
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Orçamentos
        document.getElementById('manageBudgetsBtn').addEventListener('click', () => this.openBudgetModal());
        document.getElementById('budgetForm').addEventListener('submit', (e) => { e.preventDefault(); this.handleBudgetSubmit(); });

        // Recorrentes
        document.getElementById('addRecurringBtn').addEventListener('click', () => this.openRecurringModal());
        document.getElementById('recurringForm').addEventListener('submit', (e) => { e.preventDefault(); this.handleRecurringSubmit(); });
        document.getElementById('recurringType').addEventListener('change', (e) => this.updateCategoryOptions(e.target.value, 'recurringCategory'));

        // Categorias personalizadas
        document.getElementById('manageCategoriesBtn').addEventListener('click', () => this.openCategoriesModal());
        document.getElementById('categoryForm').addEventListener('submit', (e) => { e.preventDefault(); this.handleCategorySubmit(); });

        // Filtros
        ['categoryFilter', 'typeFilter', 'monthFilter', 'tagFilter'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => { this.currentPage = 1; this.applyFilters(); });
        });
        document.getElementById('searchFilter').addEventListener('input', () => { this.currentPage = 1; this.applyFilters(); });
        document.getElementById('dateFrom').addEventListener('change', () => { this.currentPage = 1; this.applyFilters(); });
        document.getElementById('dateTo').addEventListener('change', () => { this.currentPage = 1; this.applyFilters(); });
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());

        // Paginação
        document.getElementById('prevPage').addEventListener('click', () => this.changePage(-1));
        document.getElementById('nextPage').addEventListener('click', () => this.changePage(1));

        // Exportar / Importar
        document.getElementById('exportJsonBtn').addEventListener('click', () => this.exportData());
        document.getElementById('exportPdfBtn').addEventListener('click', () => this.exportPdf());
        document.getElementById('importBtn').addEventListener('click', () => this.triggerImport());

        // Dark mode
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());

        // Validação em tempo real
        this.setupFormValidation();

        // Voltar ao topo
        this.setupBackToTop();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.openModal();
            }
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(m => {
                    if (m.style.display === 'block') this.closeModal(m.id);
                });
            }
        });
    }

    setupFormValidation() {
        const fields = ['transactionType', 'transactionAmount', 'transactionCategory', 'transactionDescription', 'transactionDate'];
        fields.forEach(id => {
            const field = document.getElementById(id);
            field.addEventListener('input', () => this.validateField(id));
            field.addEventListener('blur', () => this.validateField(id));
        });
    }

    setupBackToTop() {
        const btn = document.getElementById('backToTop');
        window.addEventListener('scroll', () => {
            btn.style.display = window.pageYOffset > 300 ? 'block' : 'none';
        });
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // =============================================
    // DARK MODE
    // =============================================
    applyDarkMode() {
        if (this.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            const icon = document.getElementById('darkModeIcon');
            if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
        }
    }

    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        localStorage.setItem('darkMode', this.darkMode);
        document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : '');
        const icon = document.getElementById('darkModeIcon');
        icon.classList.toggle('fa-moon', !this.darkMode);
        icon.classList.toggle('fa-sun', this.darkMode);
        if (this.chartAvailable) this.updateCharts();
    }

    // =============================================
    // MODAIS
    // =============================================
    openModal(transaction = null) {
        const modal = document.getElementById('transactionModal');
        const title = document.getElementById('modalTitle');
        if (transaction) {
            title.textContent = 'Editar Transação';
            this.currentEditId = transaction.id;
            this.populateForm(transaction);
        } else {
            title.textContent = 'Nova Transação';
            this.currentEditId = null;
            this.clearForm();
        }
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        this.trapFocus(modal);
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (modalId === 'transactionModal') {
            this.clearForm();
            this.currentEditId = null;
        }
    }

    openBudgetModal() {
        this.populateBudgetCategorySelect();
        this.updateBudgetModalList();
        document.getElementById('budgetModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    openRecurringModal() {
        this.updateRecurringModalList();
        document.getElementById('recurringModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    openCategoriesModal() {
        this.updateCategoriesModalList();
        document.getElementById('categoriesModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    trapFocus(modal) {
        const focusable = modal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        modal.addEventListener('keydown', function handler(e) {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === first) { last.focus(); e.preventDefault(); }
            } else {
                if (document.activeElement === last) { first.focus(); e.preventDefault(); }
            }
        });
        setTimeout(() => first.focus(), 100);
    }

    // =============================================
    // FORMULÁRIO DE TRANSAÇÃO
    // =============================================
    populateForm(t) {
        document.getElementById('transactionType').value = t.type;
        this.updateCategoryOptions(t.type, 'transactionCategory');
        document.getElementById('transactionAmount').value = t.amount;
        document.getElementById('transactionCategory').value = t.category;
        document.getElementById('transactionDescription').value = t.description;
        document.getElementById('transactionDate').value = t.date;
        document.getElementById('transactionTags').value = (t.tags || []).join(', ');
    }

    clearForm() {
        document.getElementById('transactionForm').reset();
        document.getElementById('transactionCategory').innerHTML = '<option value="">Selecione a categoria</option>';
        document.getElementById('formProgress').style.width = '0%';
        document.querySelectorAll('#transactionForm .error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('#transactionForm .error-message').forEach(el => el.style.display = 'none');
    }

    updateCategoryOptions(type, selectId) {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Selecione a categoria</option>';
        if (type && this.categories[type]) {
            this.categories[type].forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                select.appendChild(opt);
            });
        }
    }

    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const err = field.parentNode.querySelector('.error-message');
        let valid = true;
        field.classList.remove('error');
        if (err) err.style.display = 'none';

        switch (fieldId) {
            case 'transactionAmount':
                if (!field.value || parseFloat(field.value) <= 0) valid = false;
                break;
            default:
                if (!field.value.trim()) valid = false;
        }

        if (!valid) {
            field.classList.add('error');
            if (err) err.style.display = 'block';
        }
        this.updateFormProgress();
        return valid;
    }

    updateFormProgress() {
        const fields = ['transactionType', 'transactionAmount', 'transactionCategory', 'transactionDescription', 'transactionDate'];
        let filled = 0;
        fields.forEach(id => {
            const f = document.getElementById(id);
            if (f.value && !f.classList.contains('error')) filled++;
        });
        document.getElementById('formProgress').style.width = `${(filled / fields.length) * 100}%`;
    }

    handleFormSubmit() {
        const data = {
            type: document.getElementById('transactionType').value,
            amount: parseFloat(document.getElementById('transactionAmount').value),
            category: document.getElementById('transactionCategory').value,
            description: document.getElementById('transactionDescription').value,
            date: document.getElementById('transactionDate').value,
            tags: document.getElementById('transactionTags').value
                .split(',').map(t => t.trim()).filter(t => t.length > 0)
        };

        if (!data.type || !data.amount || data.amount <= 0 || !data.category || !data.description || !data.date) {
            this.showNotification('Preencha todos os campos obrigatórios.', 'error');
            return;
        }

        if (this.currentEditId) {
            this.updateTransaction(this.currentEditId, data);
        } else {
            this.addTransaction(data);
        }
        this.closeModal('transactionModal');
    }

    // =============================================
    // CRUD DE TRANSAÇÕES
    // =============================================
    addTransaction(data) {
        const transaction = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            ...data,
            createdAt: new Date().toISOString()
        };
        this.transactions.push(transaction);
        this.saveTransactions();
        this.updateDisplay();
        this.showNotification('Transação adicionada com sucesso!', 'success');
    }

    updateTransaction(id, data) {
        const idx = this.transactions.findIndex(t => t.id === id);
        if (idx !== -1) {
            this.transactions[idx] = { ...this.transactions[idx], ...data };
            this.saveTransactions();
            this.updateDisplay();
            this.showNotification('Transação atualizada!', 'success');
        }
    }

    deleteTransaction(id) {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveTransactions();
            this.updateDisplay();
            this.showNotification('Transação excluída!', 'success');
        }
    }

    saveTransactions() { localStorage.setItem('transactions', JSON.stringify(this.transactions)); }

    // =============================================
    // ORÇAMENTOS
    // =============================================
    populateBudgetCategorySelect() {
        const select = document.getElementById('budgetCategory');
        select.innerHTML = '<option value="">Selecione a categoria</option>';
        this.categories.expense.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            select.appendChild(opt);
        });
    }

    handleBudgetSubmit() {
        const category = document.getElementById('budgetCategory').value;
        const amount = parseFloat(document.getElementById('budgetAmount').value);
        if (!category || !amount || amount <= 0) {
            this.showNotification('Preencha categoria e valor.', 'error');
            return;
        }
        this.budgets[category] = amount;
        this.saveBudgets();
        document.getElementById('budgetForm').reset();
        this.updateBudgetModalList();
        this.updateBudgetDisplay();
        this.showNotification(`Orçamento de ${category} definido!`, 'success');
    }

    deleteBudget(category) {
        delete this.budgets[category];
        this.saveBudgets();
        this.updateBudgetModalList();
        this.updateBudgetDisplay();
    }

    saveBudgets() { localStorage.setItem('budgets', JSON.stringify(this.budgets)); }

    updateBudgetModalList() {
        const list = document.getElementById('budgetModalList');
        const entries = Object.entries(this.budgets);
        if (entries.length === 0) {
            list.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 16px; font-size: 13px;">Nenhum orçamento definido</p>';
            return;
        }
        list.innerHTML = entries.map(([cat, amount]) => `
            <div class="modal-list-item">
                <div>
                    <div class="modal-list-info">${this.sanitize(cat)}</div>
                    <div class="modal-list-detail">Limite: ${this.formatCurrency(amount)}</div>
                </div>
                <button class="btn btn-danger btn-sm" data-budget-delete="${this.sanitize(cat)}" aria-label="Remover orçamento">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        list.querySelectorAll('[data-budget-delete]').forEach(btn => {
            btn.addEventListener('click', () => this.deleteBudget(btn.dataset.budgetDelete));
        });
    }

    updateBudgetDisplay() {
        const section = document.getElementById('budgetSection');
        const list = document.getElementById('budgetList');
        const entries = Object.entries(this.budgets);

        if (entries.length === 0) { section.style.display = 'none'; return; }

        section.style.display = 'block';
        const currentMonth = new Date().toISOString().substring(0, 7);
        const monthExpenses = this.transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));

        list.innerHTML = entries.map(([cat, limit]) => {
            const spent = monthExpenses.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0);
            const pct = Math.min((spent / limit) * 100, 100);
            const over = spent > limit;
            const near = pct >= 80;
            const cls = over ? 'budget-over' : near ? 'budget-warning' : 'budget-ok';
            return `
                <div class="budget-item ${cls}">
                    <div class="budget-info">
                        <span class="budget-category">${this.sanitize(cat)}</span>
                        <span class="budget-values">${this.formatCurrency(spent)} / ${this.formatCurrency(limit)}</span>
                    </div>
                    <div class="budget-bar"><div class="budget-progress" style="width: ${pct}%"></div></div>
                    ${over ? `<span class="budget-alert"><i class="fas fa-exclamation-triangle"></i> Acima em ${this.formatCurrency(spent - limit)}</span>` : ''}
                </div>
            `;
        }).join('');
    }

    // =============================================
    // TRANSAÇÕES RECORRENTES
    // =============================================
    handleRecurringSubmit() {
        const data = {
            id: Date.now().toString(),
            type: document.getElementById('recurringType').value,
            amount: parseFloat(document.getElementById('recurringAmount').value),
            category: document.getElementById('recurringCategory').value,
            description: document.getElementById('recurringDescription').value,
            dayOfMonth: parseInt(document.getElementById('recurringDay').value),
            active: true,
            lastApplied: null
        };

        if (!data.type || !data.amount || data.amount <= 0 || !data.category || !data.description || !data.dayOfMonth) {
            this.showNotification('Preencha todos os campos.', 'error');
            return;
        }

        this.recurringTransactions.push(data);
        this.saveRecurring();
        document.getElementById('recurringForm').reset();
        document.getElementById('recurringCategory').innerHTML = '<option value="">Selecione</option>';
        this.updateRecurringModalList();
        this.updateRecurringDisplay();
        this.showNotification('Transação recorrente adicionada!', 'success');
    }

    deleteRecurring(id) {
        this.recurringTransactions = this.recurringTransactions.filter(r => r.id !== id);
        this.saveRecurring();
        this.updateRecurringModalList();
        this.updateRecurringDisplay();
    }

    saveRecurring() { localStorage.setItem('recurringTransactions', JSON.stringify(this.recurringTransactions)); }

    processRecurringTransactions() {
        const now = new Date();
        const monthKey = now.toISOString().substring(0, 7);
        let updated = false;

        this.recurringTransactions.forEach(rec => {
            if (!rec.active || rec.lastApplied === monthKey) return;
            const day = Math.min(rec.dayOfMonth, 28);
            const dateStr = `${monthKey}-${String(day).padStart(2, '0')}`;
            this.transactions.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                type: rec.type,
                amount: rec.amount,
                category: rec.category,
                description: `${rec.description} (Recorrente)`,
                date: dateStr,
                tags: ['recorrente'],
                createdAt: new Date().toISOString()
            });
            rec.lastApplied = monthKey;
            updated = true;
        });

        if (updated) {
            this.saveTransactions();
            this.saveRecurring();
        }
    }

    updateRecurringModalList() {
        const list = document.getElementById('recurringModalList');
        if (this.recurringTransactions.length === 0) {
            list.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 16px; font-size: 13px;">Nenhuma transação recorrente</p>';
            return;
        }
        list.innerHTML = this.recurringTransactions.map(r => `
            <div class="modal-list-item">
                <div>
                    <div class="modal-list-info">${this.sanitize(r.description)}</div>
                    <div class="modal-list-detail">${r.type === 'income' ? 'Receita' : 'Despesa'} • ${this.sanitize(r.category)} • Dia ${r.dayOfMonth} • ${this.formatCurrency(r.amount)}</div>
                </div>
                <button class="btn btn-danger btn-sm" data-recurring-delete="${r.id}" aria-label="Remover recorrente">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        list.querySelectorAll('[data-recurring-delete]').forEach(btn => {
            btn.addEventListener('click', () => this.deleteRecurring(btn.dataset.recurringDelete));
        });
    }

    updateRecurringDisplay() {
        const section = document.getElementById('recurringSection');
        const list = document.getElementById('recurringList');
        if (this.recurringTransactions.length === 0) { section.style.display = 'none'; return; }

        section.style.display = 'block';
        list.innerHTML = this.recurringTransactions.map(r => `
            <div class="recurring-item">
                <div class="recurring-info">
                    <h4>${this.sanitize(r.description)}</h4>
                    <div class="recurring-meta">${r.type === 'income' ? '📈 Receita' : '📉 Despesa'} • ${this.sanitize(r.category)} • Dia ${r.dayOfMonth}</div>
                </div>
                <span class="transaction-amount ${r.type}">${r.type === 'income' ? '+' : '-'}${this.formatCurrency(r.amount)}</span>
            </div>
        `).join('');
    }

    // =============================================
    // CATEGORIAS PERSONALIZADAS
    // =============================================
    handleCategorySubmit() {
        const type = document.getElementById('newCategoryType').value;
        const name = document.getElementById('newCategoryName').value.trim();
        if (!name) { this.showNotification('Insira um nome para a categoria.', 'error'); return; }

        const allCats = this.categories[type];
        if (allCats.includes(name)) {
            this.showNotification('Esta categoria já existe.', 'error');
            return;
        }

        this.customCategories[type].push(name);
        this.saveCustomCategories();
        document.getElementById('newCategoryName').value = '';
        this.updateCategoriesModalList();
        this.showNotification(`Categoria "${name}" adicionada!`, 'success');
    }

    deleteCustomCategory(type, name) {
        this.customCategories[type] = this.customCategories[type].filter(c => c !== name);
        this.saveCustomCategories();
        this.updateCategoriesModalList();
    }

    saveCustomCategories() { localStorage.setItem('customCategories', JSON.stringify(this.customCategories)); }

    updateCategoriesModalList() {
        const list = document.getElementById('categoriesModalList');
        const allCustom = [
            ...this.customCategories.income.map(c => ({ type: 'income', name: c })),
            ...this.customCategories.expense.map(c => ({ type: 'expense', name: c }))
        ];

        if (allCustom.length === 0) {
            list.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 16px; font-size: 13px;">Nenhuma categoria personalizada</p>';
            return;
        }

        list.innerHTML = allCustom.map(c => `
            <div class="modal-list-item">
                <div>
                    <div class="modal-list-info">${this.sanitize(c.name)}</div>
                    <div class="modal-list-detail">${c.type === 'income' ? 'Receita' : 'Despesa'}</div>
                </div>
                <button class="btn btn-danger btn-sm" data-cat-type="${c.type}" data-cat-name="${this.sanitize(c.name)}" aria-label="Remover categoria">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        list.querySelectorAll('[data-cat-name]').forEach(btn => {
            btn.addEventListener('click', () => this.deleteCustomCategory(btn.dataset.catType, btn.dataset.catName));
        });
    }

    // =============================================
    // ATUALIZAÇÃO DA INTERFACE
    // =============================================
    updateDisplay() {
        this.updateSummary();
        this.updateTransactionsList();
        this.updateFilterOptions();
        this.updateQuickStats();
        this.updateBudgetDisplay();
        this.updateRecurringDisplay();
        this.updateMonthlyReport();
        if (this.chartAvailable) this.updateCharts();
    }

    updateSummary() {
        const currentTxns = this.getCurrentMonthTransactions();
        const summary = this.calculateSummary(currentTxns);
        const salaryInfo = this.calculateSalaryInfo();
        const savingsRate = this.calculateSavingsRate();

        document.getElementById('totalIncome').textContent = this.formatCurrency(summary.income);
        document.getElementById('totalExpense').textContent = this.formatCurrency(summary.expense);
        document.getElementById('totalSalary').textContent = this.formatCurrency(salaryInfo.totalSalary);
        document.getElementById('availableBalance').textContent = this.formatCurrency(salaryInfo.availableBalance);
        document.getElementById('savingsRate').textContent = `${savingsRate.toFixed(1)}%`;

        const label = document.getElementById('savingsLabel');
        if (savingsRate > 20) {
            label.textContent = '🎉 Excelente!';
        } else if (savingsRate > 10) {
            label.textContent = '👍 Bom ritmo';
        } else if (savingsRate > 0) {
            label.textContent = '⚠️ Pode melhorar';
        } else {
            label.textContent = 'Do salário';
        }

        this.updateInvestmentSuggestions(salaryInfo.availableBalance);
    }

    getCurrentMonthTransactions() {
        const currentMonth = new Date().toISOString().substring(0, 7);
        return this.transactions.filter(t => t.date.startsWith(currentMonth));
    }

    // ===== FIX: calculateSummary agora calcula balance corretamente =====
    calculateSummary(transactions) {
        const result = transactions.reduce((acc, t) => {
            if (t.type === 'income') acc.income += t.amount;
            else acc.expense += t.amount;
            return acc;
        }, { income: 0, expense: 0 });
        result.balance = result.income - result.expense;
        return result;
    }

    calculateSalaryInfo() {
        const txns = this.getCurrentMonthTransactions();
        const totalSalary = txns.filter(t => t.type === 'income' && t.category === 'Salário').reduce((s, t) => s + t.amount, 0);
        const totalExpenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return { totalSalary, availableBalance: Math.max(0, totalSalary - totalExpenses) };
    }

    calculateSavingsRate() {
        const txns = this.getCurrentMonthTransactions();
        const totalIncome = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        if (totalIncome <= 0) return 0;
        return ((totalIncome - totalExpense) / totalIncome) * 100;
    }

    updateQuickStats() {
        const txns = this.getCurrentMonthTransactions();
        const expenses = txns.filter(t => t.type === 'expense');
        const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
        const days = new Date().getDate();

        document.getElementById('dailyAverage').textContent = this.formatCurrency(days > 0 ? totalExp / days : 0);
        document.getElementById('highestExpense').textContent = this.formatCurrency(expenses.length > 0 ? Math.max(...expenses.map(t => t.amount)) : 0);

        const catTotals = expenses.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});
        const topCat = Object.keys(catTotals).length > 0
            ? Object.keys(catTotals).reduce((a, b) => catTotals[a] > catTotals[b] ? a : b)
            : '-';
        document.getElementById('topCategory').textContent = topCat;
        document.getElementById('totalTransactions').textContent = txns.length.toString();
    }

    // =============================================
    // LISTA DE TRANSAÇÕES + PAGINAÇÃO
    // =============================================
    updateTransactionsList() {
        const container = document.getElementById('transactionsList');
        const filtered = this.getFilteredTransactions();
        const total = filtered.length;

        document.getElementById('transactionCount').textContent = `${total} transaç${total !== 1 ? 'ões' : 'ão'}`;

        if (total === 0) {
            container.innerHTML = `
                <div class="no-transactions">
                    <i class="fas fa-receipt"></i>
                    <p>Nenhuma transação encontrada</p>
                    <p>Adicione sua primeira transação ou ajuste os filtros</p>
                </div>`;
            document.getElementById('pagination').style.display = 'none';
            return;
        }

        const sorted = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        const totalPages = Math.ceil(total / this.itemsPerPage);
        this.currentPage = Math.min(this.currentPage, totalPages);
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const paged = sorted.slice(start, start + this.itemsPerPage);

        container.innerHTML = paged.map(t => this.createTransactionElement(t)).join('');

        // Paginação
        const pag = document.getElementById('pagination');
        if (totalPages > 1) {
            pag.style.display = 'flex';
            document.getElementById('pageInfo').textContent = `Página ${this.currentPage} de ${totalPages}`;
            document.getElementById('prevPage').disabled = this.currentPage <= 1;
            document.getElementById('nextPage').disabled = this.currentPage >= totalPages;
        } else {
            pag.style.display = 'none';
        }
    }

    // ===== XSS-SAFE: sem inline onclick, usa data attributes =====
    createTransactionElement(t) {
        const date = new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR');
        const amount = this.formatCurrency(t.amount);
        const sign = t.type === 'income' ? '+' : '-';
        const tags = (t.tags && t.tags.length)
            ? `<div class="transaction-tags">${t.tags.map(tag => `<span class="tag">${this.sanitize(tag)}</span>`).join('')}</div>`
            : '';

        return `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-icon ${t.type}">
                        <i class="fas fa-${t.type === 'income' ? 'arrow-up' : 'arrow-down'}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${this.sanitize(t.description)}</h4>
                        <div class="transaction-meta">${this.sanitize(t.category)} • ${date}</div>
                        ${tags}
                    </div>
                </div>
                <div class="transaction-right">
                    <span class="transaction-amount ${t.type}">${sign}${amount}</span>
                    <div class="transaction-actions">
                        <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${this.sanitize(t.id)}" aria-label="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" data-action="delete" data-id="${this.sanitize(t.id)}" aria-label="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>`;
    }

    changePage(delta) {
        this.currentPage += delta;
        this.updateTransactionsList();
        document.querySelector('.transactions-section').scrollIntoView({ behavior: 'smooth' });
    }

    // =============================================
    // FILTROS
    // =============================================
    getFilteredTransactions() {
        const cat = document.getElementById('categoryFilter').value;
        const type = document.getElementById('typeFilter').value;
        const month = document.getElementById('monthFilter').value;
        const search = document.getElementById('searchFilter').value.toLowerCase();
        const tag = document.getElementById('tagFilter').value;
        const from = document.getElementById('dateFrom').value;
        const to = document.getElementById('dateTo').value;

        return this.transactions.filter(t => {
            if (cat && t.category !== cat) return false;
            if (type && t.type !== type) return false;
            if (month && !t.date.startsWith(month)) return false;
            if (search && !t.description.toLowerCase().includes(search)) return false;
            if (tag && !(t.tags || []).includes(tag)) return false;
            if (from && t.date < from) return false;
            if (to && t.date > to) return false;
            return true;
        });
    }

    applyFilters() {
        this.updateTransactionsList();
        this.updateActiveFilterIndicators();
    }

    clearFilters() {
        ['categoryFilter', 'typeFilter', 'monthFilter', 'searchFilter', 'tagFilter', 'dateFrom', 'dateTo'].forEach(id => {
            document.getElementById(id).value = '';
        });
        this.currentPage = 1;
        this.updateTransactionsList();
        this.updateActiveFilterIndicators();
    }

    updateActiveFilterIndicators() {
        const filters = [
            { id: 'searchFilter', label: 'Busca' },
            { id: 'categoryFilter', label: 'Categoria' },
            { id: 'typeFilter', label: 'Tipo' },
            { id: 'monthFilter', label: 'Mês' },
            { id: 'tagFilter', label: 'Tag' },
            { id: 'dateFrom', label: 'De' },
            { id: 'dateTo', label: 'Até' }
        ];

        const active = filters.filter(f => document.getElementById(f.id).value);
        const container = document.getElementById('activeFilters');
        const tags = document.getElementById('activeFilterTags');

        // Adicionar/remover classe de filtro ativo
        filters.forEach(f => {
            const el = document.getElementById(f.id);
            el.classList.toggle('filter-active', !!el.value);
        });

        if (active.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'flex';
        tags.innerHTML = active.map(f => {
            const val = document.getElementById(f.id).value;
            const display = val.length > 20 ? val.substring(0, 20) + '...' : val;
            return `<span class="filter-tag">${f.label}: ${this.sanitize(display)} <button data-clear-filter="${f.id}" aria-label="Remover filtro">&times;</button></span>`;
        }).join('');

        tags.querySelectorAll('[data-clear-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById(btn.dataset.clearFilter).value = '';
                this.currentPage = 1;
                this.applyFilters();
            });
        });
    }

    updateFilterOptions() {
        // Categorias
        const catFilter = document.getElementById('categoryFilter');
        const currentCat = catFilter.value;
        const allCats = [...new Set(this.transactions.map(t => t.category))].sort();
        catFilter.innerHTML = '<option value="">Todas as categorias</option>';
        allCats.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c; opt.textContent = c;
            catFilter.appendChild(opt);
        });
        catFilter.value = currentCat;

        // Tags
        const tagFilter = document.getElementById('tagFilter');
        const currentTag = tagFilter.value;
        const allTags = [...new Set(this.transactions.flatMap(t => t.tags || []))].sort();
        tagFilter.innerHTML = '<option value="">Todas as tags</option>';
        allTags.forEach(tag => {
            const opt = document.createElement('option');
            opt.value = tag; opt.textContent = tag;
            tagFilter.appendChild(opt);
        });
        tagFilter.value = currentTag;

        this.updateActiveFilterIndicators();
    }

    // =============================================
    // GRÁFICOS
    // =============================================
    initializeCharts() {
        this.createCategoryChart();
        this.createMonthlyChart();
        this.createBalanceChart();
    }

    getChartColors() {
        const dark = this.darkMode;
        return {
            text: dark ? '#e2e8f0' : '#333',
            grid: dark ? 'rgba(148,163,184,0.15)' : 'rgba(0,0,0,0.08)',
            tick: dark ? '#94a3b8' : '#64748b'
        };
    }

    createCategoryChart() {
        if (!this.chartAvailable) return;
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        const expenses = this.transactions.filter(t => t.type === 'expense');
        const catData = expenses.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});
        const labels = Object.keys(catData);
        const data = Object.values(catData);
        const empty = document.getElementById('categoryEmpty');

        if (labels.length === 0) {
            ctx.style.display = 'none';
            if (empty) empty.style.display = 'block';
            return;
        }
        ctx.style.display = 'block';
        if (empty) empty.style.display = 'none';

        const colors = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4', '#e11d48'];
        const c = this.getChartColors();

        if (this.charts.category) this.charts.category.destroy();
        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels, datasets: [{
                    data, backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2, borderColor: this.darkMode ? '#1e293b' : '#fff'
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, color: c.text, font: { size: 12 } } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${this.formatCurrency(ctx.raw)} (${((ctx.raw / data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)`
                        }
                    }
                }
            }
        });
    }

    createMonthlyChart() {
        if (!this.chartAvailable) return;
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;

        const months = [], incomeData = [], expenseData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(); d.setMonth(d.getMonth() - i);
            const key = d.toISOString().substring(0, 7);
            months.push(d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
            const txns = this.transactions.filter(t => t.date.startsWith(key));
            const s = this.calculateSummary(txns);
            incomeData.push(s.income);
            expenseData.push(s.expense);
        }

        const c = this.getChartColors();
        if (this.charts.monthly) this.charts.monthly.destroy();
        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    { label: 'Receitas', data: incomeData, backgroundColor: 'rgba(16, 185, 129, 0.8)', borderColor: '#10b981', borderWidth: 1, borderRadius: 6 },
                    { label: 'Despesas', data: expenseData, backgroundColor: 'rgba(239, 68, 68, 0.8)', borderColor: '#ef4444', borderWidth: 1, borderRadius: 6 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { callback: v => 'R$ ' + v.toLocaleString('pt-BR'), color: c.tick }, grid: { color: c.grid } },
                    x: { ticks: { color: c.tick }, grid: { color: c.grid } }
                },
                plugins: {
                    legend: { labels: { color: c.text } },
                    tooltip: {
                        callbacks: { label: ctx => `${ctx.dataset.label}: R$ ${ctx.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` }
                    }
                }
            }
        });
    }

    createBalanceChart() {
        if (!this.chartAvailable) return;
        const ctx = document.getElementById('balanceChart');
        if (!ctx) return;

        const months = [], balanceData = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(); d.setMonth(d.getMonth() - i);
            const key = d.toISOString().substring(0, 7);
            months.push(d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
            const txns = this.transactions.filter(t => t.date.startsWith(key));
            const s = this.calculateSummary(txns);
            balanceData.push(s.balance);
        }

        const c = this.getChartColors();
        if (this.charts.balance) this.charts.balance.destroy();
        this.charts.balance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Saldo Mensal',
                    data: balanceData,
                    borderColor: '#059669',
                    backgroundColor: this.darkMode ? 'rgba(5, 150, 105, 0.15)' : 'rgba(5, 150, 105, 0.1)',
                    fill: true, tension: 0.4, borderWidth: 3,
                    pointBackgroundColor: '#059669', pointBorderColor: this.darkMode ? '#1e293b' : '#fff',
                    pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    y: { ticks: { callback: v => 'R$ ' + v.toLocaleString('pt-BR'), color: c.tick }, grid: { color: c.grid } },
                    x: { ticks: { color: c.tick }, grid: { color: c.grid } }
                },
                plugins: {
                    legend: { labels: { color: c.text } },
                    tooltip: {
                        callbacks: { label: ctx => `Saldo: R$ ${ctx.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` }
                    }
                }
            }
        });
    }

    updateCharts() {
        this.createCategoryChart();
        this.createMonthlyChart();
        this.createBalanceChart();
    }

    // =============================================
    // RELATÓRIO MENSAL
    // =============================================
    updateMonthlyReport() {
        const content = document.getElementById('reportContent');
        const now = new Date();
        const curKey = now.toISOString().substring(0, 7);
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevKey = prev.toISOString().substring(0, 7);

        const curTxns = this.transactions.filter(t => t.date.startsWith(curKey));
        const prevTxns = this.transactions.filter(t => t.date.startsWith(prevKey));
        const cur = this.calculateSummary(curTxns);
        const prv = this.calculateSummary(prevTxns);

        const pctChange = (c, p) => p !== 0 ? ((c - p) / Math.abs(p) * 100) : (c > 0 ? 100 : 0);
        const fmtChange = (val, invert = false) => {
            const sign = val >= 0 ? '+' : '';
            const cls = invert
                ? (val <= 0 ? 'positive' : 'negative')
                : (val >= 0 ? 'positive' : 'negative');
            return val === 0 ? '<span class="change">0%</span>' : `<span class="change ${cls}">${sign}${val.toFixed(1)}%</span>`;
        };

        const curMonthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const prevMonthName = prev.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        content.innerHTML = `
            <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 16px; text-align: center;">
                Comparação: <strong>${curMonthName}</strong> vs <strong>${prevMonthName}</strong>
            </p>
            <div class="report-grid">
                <div class="report-item">
                    <span class="report-label">Receitas</span>
                    <span class="report-current" style="color: var(--income-color);">${this.formatCurrency(cur.income)}</span>
                    <span class="report-prev">Anterior: ${this.formatCurrency(prv.income)}</span>
                    ${fmtChange(pctChange(cur.income, prv.income))}
                </div>
                <div class="report-item">
                    <span class="report-label">Despesas</span>
                    <span class="report-current" style="color: var(--expense-color);">${this.formatCurrency(cur.expense)}</span>
                    <span class="report-prev">Anterior: ${this.formatCurrency(prv.expense)}</span>
                    ${fmtChange(pctChange(cur.expense, prv.expense), true)}
                </div>
                <div class="report-item">
                    <span class="report-label">Saldo</span>
                    <span class="report-current">${this.formatCurrency(cur.balance)}</span>
                    <span class="report-prev">Anterior: ${this.formatCurrency(prv.balance)}</span>
                    ${fmtChange(pctChange(cur.balance, prv.balance))}
                </div>
            </div>`;
    }

    // =============================================
    // SUGESTÕES DE INVESTIMENTO
    // =============================================
    updateInvestmentSuggestions(balance) {
        const section = document.getElementById('investmentSection');
        const options = document.getElementById('investmentOptions');
        if (balance < 100) { section.style.display = 'none'; return; }

        section.style.display = 'block';
        const suggestions = this.getInvestmentSuggestions(balance);
        options.innerHTML = suggestions.map(s => `
            <div class="investment-option ${s.type}">
                <div class="investment-title"><i class="${s.icon}"></i><h4>${s.name}</h4></div>
                <div class="investment-description">${s.description}</div>
                <div class="investment-details">
                    <span class="investment-return">${s.return}</span>
                    <span class="investment-risk">${s.risk}</span>
                </div>
                <div class="investment-amount">Sugerido: ${this.formatCurrency(s.suggestedAmount)}</div>
            </div>
        `).join('');
    }

    getInvestmentSuggestions(bal) {
        const s = [];
        if (bal >= 100) s.push({ type: 'conservative', name: 'Reserva de Emergência', icon: 'fas fa-shield-alt', description: 'Mantenha 6 meses de despesas em CDB com liquidez diária ou poupança.', return: '100% CDI', risk: 'Baixo', suggestedAmount: Math.min(bal * 0.6, bal) });
        if (bal >= 500) s.push({ type: 'conservative', name: 'Tesouro Selic', icon: 'fas fa-university', description: 'Investimento do governo, 100% seguro, boa liquidez.', return: '100% Selic', risk: 'Baixo', suggestedAmount: bal * 0.4 });
        if (bal >= 1000) s.push({ type: 'moderate', name: 'CDB/LCI/LCA', icon: 'fas fa-building', description: 'Boa rentabilidade e proteção do FGC até R$250 mil.', return: '110-130% CDI', risk: 'Médio', suggestedAmount: bal * 0.3 });
        if (bal >= 2000) s.push({ type: 'moderate', name: 'Fundos Imobiliários', icon: 'fas fa-home', description: 'Dividendos mensais e potencial de valorização.', return: '8-15% a.a.', risk: 'Médio', suggestedAmount: bal * 0.2 });
        if (bal >= 3000) s.push({ type: 'aggressive', name: 'Ações', icon: 'fas fa-chart-line', description: 'Potencial de crescimento a longo prazo.', return: '10-20% a.a.', risk: 'Alto', suggestedAmount: bal * 0.15 });
        if (bal >= 5000) s.push({ type: 'aggressive', name: 'ETFs Diversificados', icon: 'fas fa-globe', description: 'Diversificação com baixo custo operacional.', return: '12-18% a.a.', risk: 'Alto', suggestedAmount: bal * 0.1 });
        return s;
    }

    // =============================================
    // EXPORTAÇÃO / IMPORTAÇÃO
    // =============================================
    exportData() {
        const data = JSON.stringify(this.transactions, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `planner-financeiro-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
        this.showNotification('Dados exportados em JSON!', 'success');
    }

    exportPdf() {
        this.showNotification('Preparando impressão...', 'info');
        setTimeout(() => window.print(), 300);
    }

    triggerImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', (e) => {
            if (e.target.files[0]) this.importData(e.target.files[0]);
        });
        input.click();
    }

    // ===== Importação com confirmação =====
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!Array.isArray(data)) throw new Error('Formato inválido');

                const confirmed = confirm(
                    `Importar ${data.length} transações?\n\n` +
                    `Isso substituirá todas as ${this.transactions.length} transações atuais.\n` +
                    `Deseja continuar?`
                );
                if (!confirmed) return;

                this.transactions = data;
                this.saveTransactions();
                this.updateDisplay();
                this.showNotification(`${data.length} transações importadas!`, 'success');
            } catch (err) {
                this.showNotification('Erro ao importar: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    // =============================================
    // UTILITÁRIOS
    // =============================================
    formatCurrency(amount) {
        return (amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    setDefaultDate() {
        document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
    }

    sanitize(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        const n = document.createElement('div');
        n.className = `notification notification-${type}`;
        const icons = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle' };
        n.innerHTML = `<i class="fas fa-${icons[type] || 'info-circle'}"></i> ${message}`;
        document.body.appendChild(n);

        setTimeout(() => {
            n.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => n.remove(), 300);
        }, 3000);
    }

    // =============================================
    // PWA & BACKUP
    // =============================================
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(() => console.log('Service Worker registrado'))
                .catch(err => console.log('SW erro:', err));
        }
    }

    setupAutoBackup() {
        this.createBackup();
        setInterval(() => this.createBackup(), 5 * 60 * 1000);
    }

    createBackup() {
        try {
            const backup = {
                transactions: this.transactions,
                budgets: this.budgets,
                recurringTransactions: this.recurringTransactions,
                customCategories: this.customCategories,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('planner_backup', JSON.stringify(backup));
        } catch (e) {
            console.warn('Erro ao criar backup:', e);
        }
    }

    saveAll() {
        this.saveTransactions();
        this.saveBudgets();
        this.saveRecurring();
        this.saveCustomCategories();
    }
}

// =============================================
// INICIALIZAÇÃO
// =============================================
let financeController;

document.addEventListener('DOMContentLoaded', () => {
    financeController = new FinanceController();
});
