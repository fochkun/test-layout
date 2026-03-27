import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const componentName = process.argv[2]

if (!componentName) {
  console.error('❌ Укажите имя компонента: npm run create:component <name>')
  process.exit(1)
}

const componentsDir = path.resolve(__dirname, '../src/styles/components')
const mainScssPath = path.resolve(__dirname, '../src/styles/main.scss')

// Создаем директорию компонентов, если её нет
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true })
}

// 1. Создаем SCSS файл компонента
const scssContent = `@import '../abstracts/variables';
@import '../abstracts/mixins';

.${componentName} {
  /* Стили компонента */
}
`
const componentPath = path.resolve(componentsDir, `_${componentName}.scss`)

if (fs.existsSync(componentPath)) {
  console.error(`❌ Компонент "${componentName}" уже существует`)
  process.exit(1)
}

fs.writeFileSync(componentPath, scssContent)

// 2. Добавляем импорт в main.scss
let mainContent = fs.readFileSync(mainScssPath, 'utf-8')

const importLine = `@import './components/${componentName}';`

if (mainContent.includes(importLine)) {
  console.log(`⚠️ Импорт уже существует в main.scss`)
} else {
  // Добавляем после других импортов компонентов или в конец
  const componentSection = mainContent.indexOf("@import './components/")
  
  if (componentSection !== -1) {
    // Находим последнюю строку импорта компонента
    const lines = mainContent.split('\n')
    let lastComponentIndex = -1
    
    lines.forEach((line, index) => {
      if (line.includes("@import './components/")) {
        lastComponentIndex = index
      }
    })
    
    lines.splice(lastComponentIndex + 1, 0, importLine)
    mainContent = lines.join('\n')
  } else {
    // Если секции компонентов нет, добавляем в конец
    mainContent = mainContent.trimEnd() + '\n' + importLine + '\n'
  }
  
  fs.writeFileSync(mainScssPath, mainContent)
  console.log(`✅ main.scss обновлен`)
}

console.log(`✅ Компонент "${componentName}" создан успешно!`)
console.log(`📁 Файл: src/styles/components/_${componentName}.scss`)