<h1 align="center">💰 Planner Financeiro — Sistema de Controle Financeiro Pessoal</h1>

<p align="center">
  Sistema completo e moderno para controle de financas pessoais, com dashboard interativo, graficos dinamicos (Chart.js), filtros avancados e exportacao/importacao de dados.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js">
  <img src="https://img.shields.io/badge/Font_Awesome-528DD7?style=for-the-badge&logo=fontawesome&logoColor=white" alt="Font Awesome">
  <img src="https://img.shields.io/badge/Status-Concluido-brightgreen?style=for-the-badge" alt="Status">
</p>

---

## Sobre o Projeto

O **Planner Financeiro** e uma aplicacao web completa para gerenciamento de financas pessoais, desenvolvida com **HTML5, CSS3 e JavaScript puro** (sem frameworks). O sistema oferece uma experiencia rica com dashboard visual, graficos interativos e ferramentas avancadas de analise financeira.

Este projeto demonstra habilidades em **desenvolvimento front-end**, **manipulacao de dados**, **visualizacao de informacoes** e **arquitetura de aplicacoes SPA**.

## Funcionalidades

### Dashboard Financeiro
- **Cards resumo** com total de receitas, despesas e saldo atual
- **Grafico de pizza** — distribuicao de gastos por categoria
- **Grafico de barras** — comparativo receitas vs despesas dos ultimos 6 meses
- **Atualizacao em tempo real** dos graficos conforme transacoes sao adicionadas

### Gestao de Transacoes
- **CRUD completo**: Adicionar, editar e excluir transacoes
- **Classificacao por tipo**: Receitas e despesas
- **Categorias inteligentes**:
  - Receitas: Salario, Freelance, Investimentos, Vendas, Presente, Outros
  - Despesas: Alimentacao, Transporte, Moradia, Saude, Educacao, Lazer, Roupas, Tecnologia, Contas, Outros
- **Descricao e data** para cada transacao

### Filtros Avancados
- Por **categoria** especifica
- Por **tipo** (receitas ou despesas)
- Por **mes/periodo**
- Botao **limpar filtros** para reset rapido

### Armazenamento e Backup
- **LocalStorage** — dados salvos automaticamente no navegador
- **Exportar JSON** — backup completo dos dados
- **Importar JSON** — restauracao de dados a partir de backup
- **Dados de exemplo** incluidos para teste

## Tecnologias Utilizadas

| Tecnologia | Aplicacao |
|---|---|
| **HTML5** | Estrutura semantica da aplicacao |
| **CSS3** | Layout responsivo, Flexbox, Grid, gradientes, animacoes |
| **JavaScript (ES6+)** | Classes OOP, LocalStorage API, manipulacao de dados |
| **Chart.js** | Graficos de pizza e barras interativos |
| **Font Awesome** | Icones modernos para a interface |

## Estrutura do Projeto

```
plannerfinanceiro/
|-- index.html          # Estrutura principal da aplicacao
|-- styles.css          # Estilos e layout responsivo
|-- script.js           # Logica da aplicacao (Classes ES6+)
|-- exemplo-dados.json  # Dados de exemplo para teste
|-- README.md           # Documentacao
```

## Como Executar

```bash
# Clone o repositorio
git clone https://github.com/jovemegidio/plannerfinanceiro.git

# Acesse a pasta
cd plannerfinanceiro

# Abra no navegador (nao requer servidor)
# Basta abrir o index.html diretamente

# Ou use um servidor local:
npx serve .
```

## Como Usar

### Adicionando Transacoes
1. Clique em **"Nova Transacao"**
2. Selecione o tipo (Receita ou Despesa)
3. Preencha valor, categoria, descricao e data
4. Clique em **"Salvar"**

### Analisando Financas
- **Cards superiores**: Resumo de receitas, despesas e saldo
- **Grafico de pizza**: Veja onde voce mais gasta
- **Grafico de barras**: Compare meses e identifique tendencias

### Backup de Dados
- **Exportar**: Clique em "Exportar" para baixar um JSON
- **Importar**: Selecione um arquivo JSON para restaurar dados

## Destaques Tecnicos

- **Arquitetura OOP** com Classes ES6+
- **Design responsivo** — Mobile-first (desktop, tablet e mobile)
- **Sem dependencia de framework** — JavaScript puro
- **Persistencia automatica** via LocalStorage
- **Graficos reativos** atualizados em tempo real
- **Validacao de formularios** com feedback visual
- **Animacoes suaves** com transicoes CSS3
- **Codigo customizavel** — categorias, cores e moeda facilmente editaveis

## Licenca

Este projeto e de codigo aberto e esta disponivel sob a licenca MIT.

## Autor

**Antonio Egidio Neto**

[![GitHub](https://img.shields.io/badge/GitHub-jovemegidio-181717?style=flat-square&logo=github)](https://github.com/jovemegidio)
[![Instagram](https://img.shields.io/badge/Instagram-egidiocode-E4405F?style=flat-square&logo=instagram&logoColor=white)](https://instagram.com/egidiocode)
