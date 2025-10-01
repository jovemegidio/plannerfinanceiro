// Classe principal do sistema financeiro
class FinanceController {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.categories = {
            income: [
                'Salário', 'Freelance', 'Investimentos', 'Vendas', 'Presente', 
                'Bonificação', 'Aluguel Recebido', 'Dividendos', 'Outros'
            ],
            expense: [
                'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 
                'Lazer', 'Entretenimento', 'Roupas', 'Tecnologia', 'Contas', 
                'Academia', 'Restaurantes', 'Viagens', 'Pets', 'Beleza',
                'Presentes', 'Doações', 'Seguros', 'Impostos', 'Outros'
            ]
        };
        
        this.currentEditId = null;
        this.charts = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.setDefaultDate();
        this.initializeCharts();
    }

    setupEventListeners() {
        // Botão de adicionar transação
        document.getElementById('addTransactionBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Fechar modal
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // Fechar modal ao clicar fora
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('transactionModal');
            if (event.target === modal) {
                this.closeModal();
            }
        });

        // Formulário de transação
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Mudança no tipo de transação
        document.getElementById('transactionType').addEventListener('change', (e) => {
            this.updateCategoryOptions(e.target.value);
        });

        // Filtros
        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('typeFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('monthFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Validação em tempo real
        this.setupFormValidation();

        // Botão voltar ao topo
        this.setupBackToTop();
    }

    setupFormValidation() {
        const fields = ['transactionType', 'transactionAmount', 'transactionCategory', 'transactionDescription', 'transactionDate'];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            field.addEventListener('input', () => this.validateField(fieldId));
            field.addEventListener('blur', () => this.validateField(fieldId));
        });
    }

    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const errorMessage = field.parentNode.querySelector('.error-message');
        let isValid = true;

        // Remove classes de erro
        field.classList.remove('error');
        errorMessage.style.display = 'none';

        // Validação específica por campo
        switch(fieldId) {
            case 'transactionAmount':
                if (!field.value || parseFloat(field.value) <= 0) {
                    isValid = false;
                    errorMessage.textContent = 'Por favor, insira um valor maior que zero';
                }
                break;
            case 'transactionType':
            case 'transactionCategory':
            case 'transactionDescription':
            case 'transactionDate':
                if (!field.value.trim()) {
                    isValid = false;
                    errorMessage.textContent = 'Este campo é obrigatório';
                }
                break;
        }

        if (!isValid) {
            field.classList.add('error');
            errorMessage.style.display = 'block';
        }

        this.updateFormProgress();
        return isValid;
    }

    updateFormProgress() {
        const fields = ['transactionType', 'transactionAmount', 'transactionCategory', 'transactionDescription', 'transactionDate'];
        let filledFields = 0;

        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field.value && !field.classList.contains('error')) {
                filledFields++;
            }
        });

        const progress = (filledFields / fields.length) * 100;
        document.getElementById('formProgress').style.width = `${progress}%`;
    }

    setupBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        
        // Mostrar/esconder botão baseado na posição do scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });

        // Funcionalidade de voltar ao topo
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    openModal(transaction = null) {
        const modal = document.getElementById('transactionModal');
        const modalTitle = document.getElementById('modalTitle');
        
        if (transaction) {
            modalTitle.textContent = 'Editar Transação';
            this.currentEditId = transaction.id;
            this.populateForm(transaction);
        } else {
            modalTitle.textContent = 'Nova Transação';
            this.currentEditId = null;
            this.clearForm();
        }
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('transactionModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.clearForm();
        this.currentEditId = null;
    }

    populateForm(transaction) {
        document.getElementById('transactionType').value = transaction.type;
        this.updateCategoryOptions(transaction.type);
        document.getElementById('transactionAmount').value = transaction.amount;
        document.getElementById('transactionCategory').value = transaction.category;
        document.getElementById('transactionDescription').value = transaction.description;
        document.getElementById('transactionDate').value = transaction.date;
    }

    clearForm() {
        document.getElementById('transactionForm').reset();
        document.getElementById('transactionCategory').innerHTML = '<option value="">Selecione a categoria</option>';
    }

    updateCategoryOptions(type) {
        const categorySelect = document.getElementById('transactionCategory');
        categorySelect.innerHTML = '<option value="">Selecione a categoria</option>';
        
        if (type && this.categories[type]) {
            this.categories[type].forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }
    }

    handleFormSubmit() {
        const formData = {
            type: document.getElementById('transactionType').value,
            amount: parseFloat(document.getElementById('transactionAmount').value),
            category: document.getElementById('transactionCategory').value,
            description: document.getElementById('transactionDescription').value,
            date: document.getElementById('transactionDate').value
        };

        if (this.validateForm(formData)) {
            if (this.currentEditId) {
                this.updateTransaction(this.currentEditId, formData);
            } else {
                this.addTransaction(formData);
            }
            this.closeModal();
        }
    }

    validateForm(data) {
        if (!data.type || !data.amount || !data.category || !data.description || !data.date) {
            alert('Por favor, preencha todos os campos.');
            return false;
        }

        if (data.amount <= 0) {
            alert('O valor deve ser maior que zero.');
            return false;
        }

        return true;
    }

    addTransaction(data) {
        const transaction = {
            id: Date.now().toString(),
            ...data,
            createdAt: new Date().toISOString()
        };

        this.transactions.push(transaction);
        this.saveTransactions();
        this.updateDisplay();
        this.showNotification('Transação adicionada com sucesso!', 'success');
    }

    updateTransaction(id, data) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            this.transactions[index] = { ...this.transactions[index], ...data };
            this.saveTransactions();
            this.updateDisplay();
            this.showNotification('Transação atualizada com sucesso!', 'success');
        }
    }

    deleteTransaction(id) {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveTransactions();
            this.updateDisplay();
            this.showNotification('Transação excluída com sucesso!', 'success');
        }
    }

    saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    updateDisplay() {
        this.updateSummary();
        this.updateTransactionsList();
        this.updateFilterOptions();
        this.updateCharts();
        this.updateQuickStats();
    }

    updateSummary() {
        const summary = this.calculateSummary();
        const salaryInfo = this.calculateSalaryInfo();
        
        document.getElementById('totalIncome').textContent = this.formatCurrency(summary.income);
        document.getElementById('totalExpense').textContent = this.formatCurrency(summary.expense);
        document.getElementById('totalSalary').textContent = this.formatCurrency(salaryInfo.totalSalary);
        document.getElementById('availableBalance').textContent = this.formatCurrency(salaryInfo.availableBalance);
        
        this.updateInvestmentSuggestions(salaryInfo.availableBalance);
    }

    calculateSummary(transactions = this.transactions) {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const currentMonthTransactions = transactions.filter(t => 
            t.date.startsWith(currentMonth)
        );
        
        return currentMonthTransactions.reduce((acc, transaction) => {
            if (transaction.type === 'income') {
                acc.income += transaction.amount;
            } else {
                acc.expense += transaction.amount;
            }
            return acc;
        }, { income: 0, expense: 0, balance: 0 });
    }

    calculateSalaryInfo() {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const currentMonthTransactions = this.transactions.filter(t => 
            t.date.startsWith(currentMonth)
        );
        
        const totalSalary = currentMonthTransactions
            .filter(t => t.type === 'income' && t.category === 'Salário')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpenses = currentMonthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const availableBalance = Math.max(0, totalSalary - totalExpenses);
        
        return { totalSalary, availableBalance };
    }

    updateTransactionsList() {
        const container = document.getElementById('transactionsList');
        const filteredTransactions = this.getFilteredTransactions();
        
        document.getElementById('transactionCount').textContent = 
            `${filteredTransactions.length} transaç${filteredTransactions.length !== 1 ? 'ões' : 'ão'}`;

        if (filteredTransactions.length === 0) {
            container.innerHTML = `
                <div class="no-transactions">
                    <i class="fas fa-receipt"></i>
                    <p>Nenhuma transação encontrada</p>
                    <p>Adicione sua primeira transação clicando no botão "Nova Transação"</p>
                </div>
            `;
            return;
        }

        // Ordenar por data (mais recente primeiro)
        const sortedTransactions = filteredTransactions.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        container.innerHTML = sortedTransactions.map(transaction => 
            this.createTransactionElement(transaction)
        ).join('');
    }

    createTransactionElement(transaction) {
        const date = new Date(transaction.date).toLocaleDateString('pt-BR');
        const amount = this.formatCurrency(transaction.amount);
        const sign = transaction.type === 'income' ? '+' : '-';
        
        return `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-icon ${transaction.type}">
                        <i class="fas fa-${transaction.type === 'income' ? 'arrow-up' : 'arrow-down'}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${transaction.description}</h4>
                        <div class="transaction-meta">
                            ${transaction.category} • ${date}
                        </div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span class="transaction-amount ${transaction.type}">
                        ${sign}${amount}
                    </span>
                    <div class="transaction-actions">
                        <button class="btn btn-secondary" onclick="financeController.openModal(${JSON.stringify(transaction).replace(/"/g, '&quot;')})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger" onclick="financeController.deleteTransaction('${transaction.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    updateFilterOptions() {
        const categoryFilter = document.getElementById('categoryFilter');
        const allCategories = [...new Set(this.transactions.map(t => t.category))];
        
        // Manter a seleção atual
        const currentValue = categoryFilter.value;
        
        categoryFilter.innerHTML = '<option value="">Todas as categorias</option>';
        allCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        
        categoryFilter.value = currentValue;
    }

    getFilteredTransactions() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const typeFilter = document.getElementById('typeFilter').value;
        const monthFilter = document.getElementById('monthFilter').value;

        return this.transactions.filter(transaction => {
            const matchesCategory = !categoryFilter || transaction.category === categoryFilter;
            const matchesType = !typeFilter || transaction.type === typeFilter;
            const matchesMonth = !monthFilter || transaction.date.startsWith(monthFilter);
            
            return matchesCategory && matchesType && matchesMonth;
        });
    }

    applyFilters() {
        this.updateTransactionsList();
        
        // Sempre mostrar o resumo do mês atual, não das transações filtradas
        this.updateSummary();
    }

    clearFilters() {
        document.getElementById('categoryFilter').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('monthFilter').value = '';
        this.updateDisplay();
    }

    initializeCharts() {
        this.createCategoryChart();
        this.createMonthlyChart();
    }

    createCategoryChart() {
        // Mostrar loading
        document.getElementById('categoryLoading').style.display = 'block';
        document.getElementById('categoryChart').style.display = 'none';
        
        setTimeout(() => {
            const ctx = document.getElementById('categoryChart').getContext('2d');
        const expenses = this.transactions.filter(t => t.type === 'expense');
        
        const categoryData = expenses.reduce((acc, transaction) => {
            acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
            return acc;
        }, {});

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ];

        if (this.charts.category) {
            this.charts.category.destroy();
        }

        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });

        // Esconder loading e mostrar gráfico
        document.getElementById('categoryLoading').style.display = 'none';
        document.getElementById('categoryChart').style.display = 'block';
        }, 500);
    }

    createMonthlyChart() {
        // Mostrar loading
        document.getElementById('monthlyLoading').style.display = 'block';
        document.getElementById('monthlyChart').style.display = 'none';
        
        setTimeout(() => {
        const ctx = document.getElementById('monthlyChart').getContext('2d');
        
        // Últimos 6 meses
        const months = [];
        const incomeData = [];
        const expenseData = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
            const monthName = date.toLocaleDateString('pt-BR', { 
                month: 'short', 
                year: 'numeric' 
            });
            
            months.push(monthName);
            
            const monthTransactions = this.transactions.filter(t => 
                t.date.startsWith(monthKey)
            );
            
            const monthSummary = this.calculateSummary(monthTransactions);
            incomeData.push(monthSummary.income);
            expenseData.push(monthSummary.expense);
        }

        if (this.charts.monthly) {
            this.charts.monthly.destroy();
        }

        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Receitas',
                        data: incomeData,
                        backgroundColor: 'rgba(40, 167, 69, 0.8)',
                        borderColor: 'rgba(40, 167, 69, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Despesas',
                        data: expenseData,
                        backgroundColor: 'rgba(220, 53, 69, 0.8)',
                        borderColor: 'rgba(220, 53, 69, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': R$ ' + 
                                       context.parsed.y.toLocaleString('pt-BR', {
                                           minimumFractionDigits: 2,
                                           maximumFractionDigits: 2
                                       });
                            }
                        }
                    }
                }
            }
        });

        // Esconder loading e mostrar gráfico
        document.getElementById('monthlyLoading').style.display = 'none';
        document.getElementById('monthlyChart').style.display = 'block';
        }, 800);
    }

    updateCharts() {
        this.createCategoryChart();
        this.createMonthlyChart();
    }

    formatCurrency(amount) {
        return amount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('transactionDate').value = today;
    }

    showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            ${message}
        `;

        // Adicionar estilos se não existirem
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                    border-left: 4px solid #28a745;
                    z-index: 1001;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideInRight 0.3s ease;
                }
                .notification-success { border-left-color: #28a745; }
                .notification-error { border-left-color: #dc3545; }
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Método para exportar dados
    exportData() {
        const dataStr = JSON.stringify(this.transactions, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'controle-financeiro.json';
        link.click();
    }

    // Método para importar dados
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    this.transactions = data;
                    this.saveTransactions();
                    this.updateDisplay();
                    this.showNotification('Dados importados com sucesso!', 'success');
                } else {
                    throw new Error('Formato inválido');
                }
            } catch (error) {
                this.showNotification('Erro ao importar dados', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Sugestões de investimento baseadas no saldo disponível
    updateInvestmentSuggestions(availableBalance) {
        const investmentSection = document.getElementById('investmentSection');
        const investmentOptions = document.getElementById('investmentOptions');
        
        if (availableBalance < 100) {
            investmentSection.style.display = 'none';
            return;
        }
        
        investmentSection.style.display = 'block';
        
        const suggestions = this.getInvestmentSuggestions(availableBalance);
        
        investmentOptions.innerHTML = suggestions.map(suggestion => `
            <div class="investment-option ${suggestion.type}">
                <div class="investment-title">
                    <i class="${suggestion.icon}"></i>
                    <h4>${suggestion.name}</h4>
                </div>
                <div class="investment-description">
                    ${suggestion.description}
                </div>
                <div class="investment-details">
                    <span class="investment-return">${suggestion.return}</span>
                    <span class="investment-risk">${suggestion.risk}</span>
                </div>
                <div class="investment-amount">
                    Valor sugerido: ${this.formatCurrency(suggestion.suggestedAmount)}
                </div>
            </div>
        `).join('');
    }
    
    getInvestmentSuggestions(balance) {
        const suggestions = [];
        
        // Reserva de emergência
        if (balance >= 100) {
            suggestions.push({
                type: 'conservative',
                name: 'Reserva de Emergência',
                icon: 'fas fa-shield-alt',
                description: 'Mantenha 6 meses de despesas em uma aplicação líquida e segura, como poupança ou CDB com liquidez diária.',
                return: '100% CDI',
                risk: 'Baixo',
                suggestedAmount: Math.min(balance * 0.6, balance)
            });
        }
        
        // Investimentos conservadores
        if (balance >= 500) {
            suggestions.push({
                type: 'conservative',
                name: 'Tesouro Selic',
                icon: 'fas fa-university',
                description: 'Investimento do governo brasileiro, 100% seguro, boa liquidez e rentabilidade que acompanha a Selic.',
                return: '100% Selic',
                risk: 'Baixo',
                suggestedAmount: balance * 0.4
            });
        }
        
        // Investimentos moderados
        if (balance >= 1000) {
            suggestions.push({
                type: 'moderate',
                name: 'CDB/LCI/LCA',
                icon: 'fas fa-building',
                description: 'Certificados de Depósito Bancário ou Letras de Crédito com boa rentabilidade e proteção do FGC.',
                return: '110-130% CDI',
                risk: 'Médio',
                suggestedAmount: balance * 0.3
            });
        }
        
        if (balance >= 2000) {
            suggestions.push({
                type: 'moderate',
                name: 'Fundos Imobiliários',
                icon: 'fas fa-home',
                description: 'Invista no mercado imobiliário através de FIIs, com dividendos mensais e potencial de valorização.',
                return: '8-15% a.a.',
                risk: 'Médio',
                suggestedAmount: balance * 0.2
            });
        }
        
        // Investimentos agressivos
        if (balance >= 3000) {
            suggestions.push({
                type: 'aggressive',
                name: 'Ações Individuais',
                icon: 'fas fa-chart-line',
                description: 'Invista em ações de empresas sólidas para potencial de crescimento a longo prazo.',
                return: '10-20% a.a.',
                risk: 'Alto',
                suggestedAmount: balance * 0.15
            });
        }
        
        if (balance >= 5000) {
            suggestions.push({
                type: 'aggressive',
                name: 'ETFs Diversificados',
                icon: 'fas fa-globe',
                description: 'Fundos que replicam índices do mercado, oferecendo diversificação com menor custo.',
                return: '12-18% a.a.',
                risk: 'Alto',
                suggestedAmount: balance * 0.1
            });
        }
        
        return suggestions;
    }

    updateQuickStats() {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const currentMonthTransactions = this.transactions.filter(t => 
            t.date.startsWith(currentMonth)
        );
        
        // Gasto médio diário
        const expenses = currentMonthTransactions.filter(t => t.type === 'expense');
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        const daysInMonth = new Date().getDate();
        const dailyAverage = daysInMonth > 0 ? totalExpenses / daysInMonth : 0;
        
        // Maior gasto
        const highestExpense = expenses.length > 0 ? Math.max(...expenses.map(t => t.amount)) : 0;
        
        // Categoria mais gasta
        const categoryTotals = expenses.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});
        
        const topCategory = Object.keys(categoryTotals).length > 0 
            ? Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b)
            : '-';
        
        // Total de transações do mês
        const totalTransactions = currentMonthTransactions.length;
        
        // Atualizar elementos
        document.getElementById('dailyAverage').textContent = this.formatCurrency(dailyAverage);
        document.getElementById('highestExpense').textContent = this.formatCurrency(highestExpense);
        document.getElementById('topCategory').textContent = topCategory;
        document.getElementById('totalTransactions').textContent = totalTransactions.toString();
    }
}

// Inicializar o sistema quando a página carregar
let financeController;

document.addEventListener('DOMContentLoaded', () => {
    financeController = new FinanceController();
    
    // Adicionar funcionalidades de exportação/importação
    const headerActions = document.querySelector('.action-bar');
    
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-secondary';
    exportBtn.innerHTML = '<i class="fas fa-download"></i> Exportar';
    exportBtn.addEventListener('click', () => financeController.exportData());
    
    const importBtn = document.createElement('button');
    importBtn.className = 'btn btn-secondary';
    importBtn.innerHTML = '<i class="fas fa-upload"></i> Importar';
    importBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                financeController.importData(e.target.files[0]);
            }
        });
        input.click();
    });
    
    headerActions.appendChild(exportBtn);
    headerActions.appendChild(importBtn);
});