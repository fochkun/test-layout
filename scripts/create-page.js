import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pageName = process.argv[2]

if (!pageName) {
  console.error('Укажите имя страницы: npm run create:page <name>')
  process.exit(1)
}

const srcDir = path.resolve(__dirname, '../src')
const pagesDir = path.resolve(srcDir, 'pages')
const stylesPagesDir = path.resolve(srcDir, 'styles/pages')

// Создаем директории, если их нет
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true })
}

if (!fs.existsSync(stylesPagesDir)) {
  fs.mkdirSync(stylesPagesDir, { recursive: true })
}

// 1. Создаем HTML
const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageName.charAt(0).toUpperCase() + pageName.slice(1)}</title>
  <script type="module" src="../${pageName}.js"></script>
</head>
<body>
  <h1>${pageName.charAt(0).toUpperCase() + pageName.slice(1)}</h1>
</body>
</html>
`
fs.writeFileSync(path.resolve(pagesDir, `${pageName}.html`), htmlContent)

// 2. Создаем JS
const jsContent = `import './styles/main.scss'\nimport './styles/pages/${pageName}.scss'\n\nconsole.log('✅ ${pageName} loaded')\n`
fs.writeFileSync(path.resolve(srcDir, `${pageName}.js`), jsContent)

// 3. Создаем SCSS
const scssContent = `/* Стили для страницы ${pageName} */\n`
fs.writeFileSync(path.resolve(stylesPagesDir, `${pageName}.scss`), scssContent)

// 4. Обновляем vite.config.js
const configPath = path.resolve(__dirname, '../vite.config.js')
let configContent = fs.readFileSync(configPath, 'utf-8')

// Проверяем, есть ли уже такая страница
if (configContent.includes(`${pageName}:`)) {
  console.log(`Страница "${pageName}" уже существует в конфиге`)
} else {
  // Добавляем новую точку входа
  const newEntry = `    ${pageName}: resolve(__dirname, 'src/pages/${pageName}.html'),`
  
  // Находим место перед закрывающей скобкой input
  configContent = configContent.replace(
    /(input:\s*\{[\s\S]*?)(\n\s*\},)/,
    `$1\n${newEntry}$2`
  )
  
  fs.writeFileSync(configPath, configContent)
  console.log(`vite.config.js обновлен`)
}

console.log(`Страница "${pageName}" создана успешно!`)
console.log(`Файлы:`)
console.log(`   - src/pages/${pageName}.html`)
console.log(`   - src/${pageName}.js`)
console.log(`   - src/styles/pages/${pageName}.scss`)