# CLAUDE.md

## Project Overview
Kodero is a Vue 3 + TypeScript application built with Vite, following TDD principles and modern web development best practices.

## System Requirements
- Node.js: v18.0.0 or higher
- npm: v9.0.0 or higher
- Git: v2.30.0 or higher

## Project Setup Instructions
```bash
# Initialize Vue 3 + Vite project with TypeScript
npm create vue@latest kodero-app -- --typescript --jsx --router --pinia --vitest --eslint --prettier
cd kodero-app
npm install

# Install additional development dependencies
npm install -D @types/node @vue/test-utils @vitest/ui @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Start development server
npm run dev
```

## Development Workflow

### Working Style
- **Language**: TypeScript with strict mode enabled for maximum type safety
- **Test Driven Development**: Components should be implemented in a TDD workflow.
- **Incremental Development**: Build one component at a time, test immediately
- **Hot Reload First**: Always ensure `npm run dev` is running for instant feedback
- **Component-Driven**: Create reusable Vue components, start with the simplest ones first
- **Test Early**: Each component should work in isolation before integration

### File Organization Preferences
```
src/
├── App.vue
├── components/          # One component per file, PascalCase naming
├── composables/         # Reusable logic, camelCase with 'use' prefix
├── assets/             # CSS and static files
└── types/              # TypeScript definitions if needed
```

### Development Order
1. **Setup**: Basic Vue app structure and routing (if needed)
2. **Static UI**: Build components without interactivity first
3. **State Management**: Add reactive data and basic interactions
4. **Drag & Drop**: Implement complex interactions last
5. **Polish**: Styling, animations, error handling

### Development Playground Approach
- **Visual Development**: Home.vue serves as a live playground for completed components
- **Real-time Testing**: See components working as you build them in the browser
- **Interactive Demos**: Each phase shows interactive examples of completed features
- **Hot Reload**: Changes to components immediately visible in the playground
- **Event Monitoring**: Console logging shows component interactions in real-time

### Code Style Preferences
- **Vue 3 Composition API**: Use `<script setup>` syntax
- **CSS**: Scoped styles in components, CSS Grid/Flexbox for layouts
- **No External Libraries**: Keep dependencies minimal, prefer native solutions
- **Clear Naming**: Descriptive function and variable names, avoid abbreviations

### Testing Strategy
- **Framework**: Vitest with Vue Test Utils for component testing
- **TDD Workflow**: 
  1. Write failing test first
  2. Write minimal code to pass
  3. Refactor with confidence
- **Test Structure**:
  ```typescript
  // ComponentName.test.ts
  import { describe, it, expect } from 'vitest'
  import { mount } from '@vue/test-utils'
  import ComponentName from './ComponentName.vue'
  
  describe('ComponentName', () => {
    it('should render correctly', () => {
      const wrapper = mount(ComponentName)
      expect(wrapper.exists()).toBe(true)
    })
  })
  ```
- **Coverage Goals**: Minimum 80% code coverage
- **Console Debugging**: Use browser dev tools extensively
- **Progressive Enhancement**: Start with basic functionality, add features incrementally

### Communication Protocol
- **Ask Before Major Decisions**: Confirm architecture choices before implementing
- **Show Progress**: Share working code snippets for feedback
- **Describe Blockers**: Explain exactly what isn't working with error messages
- **Request Specific Help**: "Help me implement X" rather than "Fix this"

### Files to Always Keep Updated
- `package.json` - Dependencies and scripts
- `PLAN.md` - Current development plan and status
- `src/App.vue` - Main application entry point
- Component files - As we build them

### Error Handling Approach
- Check browser console first for JavaScript errors
- Verify all imports/exports are correct
- Test drag & drop in Chrome/Firefox for compatibility
- Use Vue DevTools for component debugging

### Questions to Ask When Stuck
1. "What's the Vue 3 way to handle this pattern?"
2. "How should this component communicate with its parent?"
3. "What's the best practice for managing this state?"
4. "Should this be a composable or stay in the component?"

### Deployment Considerations
- Build process: `npm run build`
- Static hosting compatible (no server needed)
- Modern browser support (ES6+)
- Mobile-responsive design from the start

## TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"]
}
```

## Git Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `fix/*`: Bug fixes
- `chore/*`: Maintenance tasks

### Commit Convention (Conventional Commits)
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples**:
```bash
git commit -m "feat(drag-drop): add drag preview component"
git commit -m "fix(auth): resolve login validation error"
git commit -m "test(button): add click event tests"
```

## Code Quality Tools

### ESLint Configuration
```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'vue/component-api-style': ['error', ['script-setup']]
  }
}
```

### Prettier Configuration
```json
// .prettierrc.json
{
  "semi": false,
  "tabWidth": 2,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "none",
  "arrowParens": "avoid"
}
```

### Pre-commit Hooks
```bash
# Install husky and lint-staged
npm install -D husky lint-staged
npx husky-init

# .husky/pre-commit
npm run lint-staged
```

```json
// package.json
"lint-staged": {
  "*.{js,ts,vue}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

## State Management Guidelines

### Pinia Store Pattern
```typescript
// stores/useExampleStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useExampleStore = defineStore('example', () => {
  // State
  const items = ref<Item[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Getters
  const itemCount = computed(() => items.value.length)
  
  // Actions
  async function fetchItems() {
    loading.value = true
    error.value = null
    try {
      const response = await api.getItems()
      items.value = response.data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  return { items, loading, error, itemCount, fetchItems }
})
```

### Composables vs Stores
- **Use Composables**: For reusable logic without global state
- **Use Pinia Stores**: For global state management
- **Keep stores focused**: One store per domain (auth, user, products)

## API Integration Patterns

### API Client Setup
```typescript
// api/client.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle authentication error
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

### Error Handling Pattern
```typescript
// composables/useAsyncData.ts
import { ref, Ref } from 'vue'

export function useAsyncData<T>() {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  async function execute(promise: Promise<T>) {
    loading.value = true
    error.value = null
    
    try {
      data.value = await promise
    } catch (err) {
      error.value = err as Error
      console.error('Async operation failed:', err)
    } finally {
      loading.value = false
    }
  }
  
  return { data, loading, error, execute }
}
```

## Environment Configuration

### Environment Variables
```bash
# .env.development
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=Kodero Development
VITE_ENABLE_MOCK=true

# .env.production
VITE_API_URL=https://api.kodero.com
VITE_APP_TITLE=Kodero
VITE_ENABLE_MOCK=false
```

### Type Safety for Env Variables
```typescript
// env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_ENABLE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## Performance Guidelines

### Component Optimization
- Use `defineAsyncComponent` for code splitting
- Implement `v-memo` for expensive list renders
- Leverage `shallowRef` for large objects
- Use `markRaw` for non-reactive external objects

### Bundle Optimization
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['@vueuse/core']
        }
      }
    },
    chunkSizeWarningLimit: 500
  }
})
```

## Security Best Practices

### Input Validation
```typescript
// utils/validation.ts
import DOMPurify from 'dompurify'

export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  })
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

### XSS Prevention
- Always use Vue's template syntax (automatic escaping)
- Avoid `v-html` unless absolutely necessary
- Sanitize user input before storage
- Use Content Security Policy headers

## Accessibility Standards

### WCAG 2.1 Level AA Compliance
- All interactive elements must be keyboard accessible
- Provide proper ARIA labels and roles
- Maintain 4.5:1 color contrast ratio
- Support screen readers

### Component Accessibility Pattern
```vue
<template>
  <button
    :aria-label="ariaLabel"
    :aria-pressed="isPressed"
    :disabled="disabled"
    @click="handleClick"
    @keydown.enter.space="handleClick"
  >
    <slot />
  </button>
</template>
```

### Testing Accessibility
```bash
# Install axe-core for a11y testing
npm install -D @axe-core/vue
```

```typescript
// In tests
import axe from '@axe-core/vue'

it('should be accessible', async () => {
  const wrapper = mount(Component)
  const results = await axe(wrapper.element)
  expect(results.violations).toHaveLength(0)
})
```

## Error Boundaries

### Global Error Handler
```typescript
// main.ts
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Component:', instance)
  console.error('Error info:', info)
  
  // Send to error tracking service
  if (import.meta.env.PROD) {
    // Sentry, LogRocket, etc.
  }
}
```

### Component Error Boundary
```vue
<!-- ErrorBoundary.vue -->
<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err
  return false // Prevent propagation
})
</script>

<template>
  <div v-if="error" class="error-boundary">
    <h2>Something went wrong</h2>
    <p>{{ error.message }}</p>
    <button @click="error = null">Try Again</button>
  </div>
  <slot v-else />
</template>
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:unit -- --coverage
      - run: npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
```

## Scripts Reference
```json
// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "run-p type-check build-only",
    "preview": "vite preview",
    "test:unit": "vitest",
    "test:unit:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "build-only": "vite build",
    "type-check": "vue-tsc --noEmit -p tsconfig.vitest.json --composite false",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore",
    "format": "prettier --write src/",
    "prepare": "husky install"
  }
}
```