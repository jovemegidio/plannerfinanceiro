// build-dist.js — Copia os arquivos frontend para a pasta dist/
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

// Limpar dist
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Arquivos frontend para incluir no app
const files = [
    'index.html',
    'styles.css',
    'script.js',
    'manifest.json',
    'sw.js',
    'exemplo-dados.json'
];

files.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(distDir, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`  ✓ ${file}`);
    } else {
        console.warn(`  ⚠ ${file} não encontrado, pulando...`);
    }
});

console.log(`\n✅ ${files.length} arquivos copiados para dist/`);
