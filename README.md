<h1 align="center">💰 Planner Financeiro — Sistema de Controle Financeiro Pessoal</h1>

<p align="center">
  Sistema completo e profissional para controle de financas pessoais, disponivel como app web (PWA) e programa desktop (.exe) via Tauri. Dashboard interativo, graficos dinamicos, importacao de extratos bancarios (OFX/CSV), orcamentos, investimentos e muito mais.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Tauri-24C8D8?style=for-the-badge&logo=tauri&logoColor=white" alt="Tauri">
  <img src="https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Rust">
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js">
  <img src="https://img.shields.io/badge/Font_Awesome-528DD7?style=for-the-badge&logo=fontawesome&logoColor=white" alt="Font Awesome">
  <img src="https://img.shields.io/badge/Status-Concluido-brightgreen?style=for-the-badge" alt="Status">
</p>

---

## Sobre o Projeto

O **Planner Financeiro** e uma aplicacao completa para gerenciamento de financas pessoais, disponivel como **app web (PWA)** e **programa desktop (.exe)** usando **Tauri** (Rust). Desenvolvido com HTML5, CSS3 e JavaScript puro, oferece dashboard visual, graficos interativos, importacao de extratos bancarios e ferramentas avancadas de analise financeira.

### App Desktop (Tauri)
- **Executavel nativo** de apenas ~3 MB (vs ~150 MB do Electron)
- **Instalador NSIS** profissional (~1 MB)
- **Sem dependencias** — usa WebView2 nativo do Windows
- **Offline completo** — funciona sem internet

## Funcionalidades

### Dashboard Financeiro
- **5 cards resumo** com receitas, despesas, saldo, transacoes e media diaria
- **3 graficos interativos** — pizza (categorias), barras (mensal), linha (evolucao)
- **Relatorio mensal** com analise detalhada
- **Sugestoes de investimento** baseadas no perfil
- **Atualizacao em tempo real** dos graficos

### Gestao de Transacoes
- **CRUD completo**: Adicionar, editar e excluir transacoes
- **Tags personalizadas** para classificacao extra
- **Paginacao** para listas grandes
- **Busca e filtros** por texto, categoria, tipo e periodo

### Importacao de Extratos Bancarios (OFX/CSV)
- **Parser OFX** — suporte ao formato padrao de extratos bancarios
- **Parser CSV** — deteccao automatica de separador e colunas
- **Auto-categorizacao** inteligente por palavras-chave (bancos BR)
- **Preview** com selecao individual e edicao de categorias
- **Drag & Drop** para importacao de arquivos

### Orcamentos e Metas
- **Orcamento por categoria** com barra de progresso visual
- **Alertas** quando o gasto se aproxima do limite
- **Transacoes recorrentes** com frequencia configuravel

### Categorias Personalizaveis
- Adicionar/remover categorias de receita e despesa
- Categorias padrao abrangentes para o mercado brasileiro

### Tema Escuro/Claro
- **Toggle** com persistencia da preferencia
- **Transicao suave** entre temas

### Atalhos de Teclado
- `Ctrl+N` — Nova transacao
- `Ctrl+E` — Exportar dados
- `Ctrl+D` — Alternar tema
- `Escape` — Fechar modal

## Tecnologias Utilizadas

| Tecnologia | Aplicacao |
|---|---|
| **HTML5** | Estrutura semantica da aplicacao |
| **CSS3** | Layout responsivo, Custom Properties, Flexbox, Grid, temas |
| **JavaScript (ES6+)** | Classes OOP, LocalStorage, parsers OFX/CSV |
| **Tauri 2** | Framework desktop nativo (Rust) |
| **Rust** | Backend do app desktop |
| **Chart.js** | 3 graficos interativos (pizza, barras, linha) |
| **Font Awesome** | Icones modernos para a interface |
| **PWA** | Service Worker, manifest, instalavel |

## Estrutura do Projeto

```
plannerfinanceiro/
|-- index.html          # Estrutura principal da aplicacao
|-- styles.css          # Estilos, temas claro/escuro
|-- script.js           # Logica (FinanceController, parsers OFX/CSV)
|-- manifest.json       # PWA manifest
|-- sw.js               # Service Worker (offline)
|-- exemplo-dados.json  # Dados de exemplo
|-- package.json        # Scripts npm/Tauri
|-- .gitignore          # Ignorar node_modules, target, releases
|-- src-tauri/          # Projeto Tauri (desktop)
|   |-- Cargo.toml      # Dependencias Rust
|   |-- tauri.conf.json # Configuracao do app desktop
|   |-- build.rs        # Build script
|   |-- src/main.rs     # Ponto de entrada desktop
|   |-- src/lib.rs      # Setup da janela
|   |-- icons/          # Icones do app
|-- README.md           # Documentacao
```

## Como Executar

### Versao Web (navegador)
```bash
# Clone o repositorio
git clone https://github.com/jovemegidio/plannerfinanceiro.git
cd plannerfinanceiro

# Abra no navegador (nao requer servidor)
# Basta abrir o index.html diretamente

# Ou use um servidor local:
npx serve .
```

### Versao Desktop (.exe via Tauri)
```bash
# Pre-requisitos:
# - Node.js 18+
# - Rust (rustup.rs)
# - Visual Studio Build Tools 2022 (workload C++)

# Instalar dependencias
npm install

# Modo desenvolvimento (hot reload)
npm run tauri:dev

# Build final (.exe + instalador NSIS)
npm run tauri:build

# O executavel estara em:
# src-tauri/target/release/planner-financeiro.exe
# O instalador estara em:
# src-tauri/target/release/bundle/nsis/Planner Financeiro_1.0.0_x64-setup.exe
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

- **App Desktop nativo** via Tauri 2 (Rust) — apenas ~3 MB
- **Arquitetura OOP** com Classes ES6+
- **Importacao OFX/CSV** com auto-categorizacao inteligente
- **PWA completa** — instalavel, funciona offline
- **Tema escuro/claro** com CSS Custom Properties
- **Design responsivo** — Mobile-first (desktop, tablet e mobile)
- **Sem dependencia de framework** — JavaScript puro
- **Persistencia automatica** via LocalStorage + auto-backup
- **Graficos reativos** atualizados em tempo real (3 tipos)
- **Orcamentos com alertas** — controle de gastos por categoria
- **Transacoes recorrentes** — automatizacao financeira
- **Seguranca** — sanitizacao XSS, confirmacao em acoes destrutivas
- **Atalhos de teclado** para produtividade
- **Codigo customizavel** — categorias, cores e moeda facilmente editaveis

## Licenca

Este projeto e de codigo aberto e esta disponivel sob a licenca MIT.

## Autor

**Antonio Egidio Neto**

[![GitHub](https://img.shields.io/badge/GitHub-jovemegidio-181717?style=flat-square&logo=github)](https://github.com/jovemegidio)
[![Instagram](https://img.shields.io/badge/Instagram-egidiocode-E4405F?style=flat-square&logo=instagram&logoColor=white)](https://instagram.com/egidiocode)
