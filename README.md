# Sistema de Controle Financeiro Pessoal

Um sistema completo e moderno para controle de finanças pessoais, desenvolvido com HTML, CSS e JavaScript puro.

## 🚀 Funcionalidades

### Dashboard Financeiro
- **Resumo Visual**: Cards com total de receitas, despesas e saldo
- **Gráficos Interativos**: 
  - Gráfico de pizza para gastos por categoria
  - Gráfico de barras comparando receitas vs despesas dos últimos 6 meses

### Gestão de Transações
- ✅ **Adicionar** receitas e despesas
- ✏️ **Editar** transações existentes
- 🗑️ **Excluir** transações
- 📱 **Interface responsiva** para desktop e mobile

### Categorização Inteligente
- **Receitas**: Salário, Freelance, Investimentos, Vendas, Presente, Outros
- **Despesas**: Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Roupas, Tecnologia, Contas, Outros

### Sistema de Filtros Avançados
- 🏷️ **Por categoria**: Filtre transações por categoria específica
- 📊 **Por tipo**: Visualize apenas receitas ou despesas
- 📅 **Por mês**: Analise gastos de períodos específicos
- 🔄 **Limpar filtros**: Volte à visualização completa

### Armazenamento e Backup
- 💾 **Armazenamento local**: Dados salvos automaticamente no navegador
- 📤 **Exportar dados**: Backup em formato JSON
- 📥 **Importar dados**: Restaure seus dados de backup

## 🎯 Como Usar

### 1. Adicionando uma Nova Transação
1. Clique no botão **"Nova Transação"**
2. Selecione o **tipo** (Receita ou Despesa)
3. Digite o **valor**
4. Escolha a **categoria**
5. Adicione uma **descrição**
6. Selecione a **data**
7. Clique em **"Salvar"**

### 2. Editando uma Transação
1. Na lista de transações, clique no ícone de **edição** (lápis)
2. Modifique os campos desejados
3. Clique em **"Salvar"** para confirmar

### 3. Usando Filtros
1. Use os **seletores de filtro** acima da lista de transações
2. **Categoria**: Filtre por categoria específica
3. **Tipo**: Visualize apenas receitas ou despesas
4. **Mês**: Analise um período específico
5. Use **"Limpar Filtros"** para resetar

### 4. Analisando Gráficos
- **Gráfico de Pizza**: Mostra a distribuição percentual dos gastos por categoria
- **Gráfico de Barras**: Compare receitas e despesas dos últimos 6 meses

### 5. Backup de Dados
- **Exportar**: Clique em "Exportar" para baixar seus dados
- **Importar**: Clique em "Importar" e selecione um arquivo JSON de backup

## 💻 Instalação e Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Não requer servidor - funciona localmente

### Instalação
1. **Baixe** todos os arquivos para uma pasta
2. **Abra** o arquivo `index.html` no seu navegador
3. **Pronto!** O sistema já está funcionando

### Estrutura dos Arquivos
```
Sistema de Controle - Financeiro/
│
├── index.html          # Estrutura principal da aplicação
├── styles.css          # Estilos e layout responsivo
├── script.js           # Lógica da aplicação
├── README.md           # Este arquivo de documentação
└── exemplo-dados.json  # Dados de exemplo para teste
```

## 🎨 Características Técnicas

### Design Responsivo
- ✅ **Mobile-first**: Otimizado para dispositivos móveis
- ✅ **Desktop**: Interface expansiva para telas grandes
- ✅ **Tablet**: Adaptação automática para tablets

### Tecnologias Utilizadas
- **HTML5**: Estrutura semântica
- **CSS3**: 
  - Flexbox e Grid Layout
  - Gradientes e animações
  - Media queries para responsividade
- **JavaScript ES6+**:
  - Classes e módulos
  - LocalStorage API
  - Chart.js para gráficos
- **Font Awesome**: Ícones modernos
- **Chart.js**: Gráficos interativos

### Recursos Avançados
- 🎭 **Animações suaves**: Transições CSS3
- 💾 **Persistência de dados**: Armazenamento automático
- 🔔 **Notificações**: Feedback visual das ações
- 📊 **Gráficos dinâmicos**: Atualizados em tempo real
- 🎯 **Validação de formulários**: Prevenção de erros

## 📊 Dados de Exemplo

O arquivo `exemplo-dados.json` contém transações de exemplo que você pode importar para testar o sistema. Inclui:
- Receitas variadas (salário, freelance, vendas)
- Despesas categorizadas (alimentação, transporte, lazer, etc.)
- Transações distribuídas ao longo de vários meses

## 🛡️ Segurança e Privacidade

- ✅ **Dados locais**: Tudo armazenado no seu navegador
- ✅ **Sem servidor**: Não há envio de dados para terceiros
- ✅ **Backup manual**: Você controla seus backups
- ✅ **Sem rastreamento**: Privacidade total

## 🐛 Resolução de Problemas

### Os dados desapareceram
- Verifique se não limpou os dados do navegador
- Use a função de importar para restaurar um backup

### Os gráficos não aparecem
- Verifique sua conexão com a internet (Chart.js é carregado via CDN)
- Certifique-se de que JavaScript está habilitado

### Interface não responsiva
- Atualize a página
- Verifique se todos os arquivos CSS estão carregados

## 🎯 Dicas de Uso

1. **Categorize corretamente**: Use categorias consistentes para análises mais precisas
2. **Descrições claras**: Ajudam a lembrar do contexto da transação
3. **Backup regular**: Exporte seus dados periodicamente
4. **Use filtros**: Analise períodos específicos para insights
5. **Monitore tendências**: Use os gráficos mensais para identificar padrões

## 📝 Customização

Você pode personalizar:
- **Categorias**: Edite as arrays no arquivo `script.js`
- **Cores**: Modifique as variáveis CSS no arquivo `styles.css`
- **Moeda**: Altere a formatação no método `formatCurrency()`

## 🔮 Próximas Funcionalidades (Sugestões)

- [ ] Metas de gastos por categoria
- [ ] Relatórios em PDF
- [ ] Lembretes de pagamentos
- [ ] Múltiplas contas/carteiras
- [ ] Sincronização com banco
- [ ] Modo escuro
- [ ] Calculadora de investimentos

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT. Você pode usar, modificar e distribuir livremente.

---

**Desenvolvido com ❤️ para ajudar no controle financeiro pessoal**

Aproveite o seu novo sistema de controle financeiro! 💰📊