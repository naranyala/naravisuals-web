---
title: "Vue JSX with Typescript"
date: "December 23, 2025"
tags:
 - vue
 - typescript
 - web
references:
---


Perfect! Yes, Vue 3 fully supports JSX/TSX and it works great with goober.css and clsx. Let me create a comprehensive markdown article covering Vue 3 JSX with TypeScript, goober.css, and clsx using your preferred styling approach.

# Vue 3 JSX with TypeScript: Modern Frontend Development with goober.css and clsx

## Introduction

Vue 3 offers excellent support for JSX/TSX, providing developers with the full power of JavaScript while maintaining Vue's renowned reactivity system. Combined with lightweight solutions like goober.css for CSS-in-JS and clsx for conditional styling, you can create highly maintainable and performant applications.

This article explores building Vue 3 applications using JSX/TSX with TypeScript-first approach, styled with goober.css using the `const styles = {}` format and `css`` ` template literal syntax.

## Why Vue 3 JSX?

Vue 3 JSX provides several advantages over traditional templates:

- **Full JavaScript Power**: Use JavaScript's complete expressiveness for dynamic logic, loops, and conditionals without Vue-specific directives
- **TypeScript Integration**: Superior type checking and IntelliSense support
- **Familiar Syntax**: Especially beneficial for developers transitioning from React
- **No Template Compilation**: Direct JavaScript execution without compilation overhead
- **Programmatic Control**: Complete control over rendering logic and component structure

## Project Setup

### 1. Create Vue 3 Project with JSX Support

```bash
npm create vue@latest my-vue-jsx-app
cd my-vue-jsx-app
```

During setup, select:
- ✅ **TypeScript**: Yes
- ✅ **JSX Support**: Yes
- ✅ **ESLint**: Yes (for code quality)

### 2. Install Additional Dependencies

```bash
npm install goober clsx
npm install -D @types/goober
```

### 3. Configure TypeScript for JSX

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "jsxImportSource": "vue",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 4. Configure Vite for JSX

Ensure `vite.config.ts` includes JSX support:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx({
      // Enable optimization
      optimize: true,
      // Enable merge props
      mergeProps: true,
      // Enable object assignment for props
      enableObjectAssign: true
    })
  ],
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
})
```

## Core Concepts

### goober.css Integration

goober is a lightweight (< 1KB) CSS-in-JS library perfect for Vue 3 applications. It provides:

- Server-side rendering support
- Automatic vendor prefixing
- CSS parsing and optimization
- Keyframe animations
- Media query support

### clsx for Conditional Styling

clsx is a tiny utility for constructing className strings conditionally, similar to classnames but smaller and faster.

## Basic Component Structure

### 1. Simple Component with goober.css

```typescript
// components/Button.tsx
import { defineComponent, ref } from 'vue'
import { css } from 'goober'
import clsx from 'clsx'

const styles = {
  button: css`
    background-color: #3b82f6;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease-in-out;

    &:hover {
      background-color: #2563eb;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  `,

  primary: css`
    background-color: #3b82f6;

    &:hover {
      background-color: #2563eb;
    }
  `,

  secondary: css`
    background-color: #6b7280;

    &:hover {
      background-color: #4b5563;
    }
  `,

  large: css`
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  `,

  small: css`
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  `
}

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  onClick?: () => void
}

export default defineComponent({
  name: 'Button',
  props: {
    variant: {
      type: String as () => 'primary' | 'secondary',
      default: 'primary'
    },
    size: {
      type: String as () => 'small' | 'medium' | 'large',
      default: 'medium'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  setup(props, { emit, slots }) {
    const handleClick = () => {
      if (!props.disabled) {
        emit('click')
      }
    }

    return () => (
      <button
        class={clsx(
          styles.button,
          styles[props.variant],
          styles[props.size]
        )}
        disabled={props.disabled}
        onClick={handleClick}
      >
        {slots.default?.()}
      </button>
    )
  }
})
```

### 2. Advanced Component with Dynamic Styling

```typescript
// components/Card.tsx
import { defineComponent, computed, ref } from 'vue'
import { css } from 'goober'
import clsx from 'clsx'

const styles = {
  card: css`
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    transition: all 0.2s ease-in-out;
    border: 1px solid #e5e7eb;

    &:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
  `,

  elevated: css`
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

    &:hover {
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
  `,

  outlined: css`
    background: transparent;
    border: 2px solid #3b82f6;

    &:hover {
      background: #eff6ff;
    }
  `,

  dark: css`
    background: #1f2937;
    color: white;
    border-color: #374151;

    &:hover {
      background: #111827;
    }
  `,

  rounded: css`
    border-radius: 1rem;
  `,

  compact: css`
    padding: 1rem;
  `,

  header: css`
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  `,

  content: css`
    color: #6b7280;
    line-height: 1.5;
  `
}

interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined'
  theme?: 'light' | 'dark'
  rounded?: boolean
  compact?: boolean
  header?: string
}

export default defineComponent({
  name: 'Card',
  props: {
    variant: {
      type: String as () => 'default' | 'elevated' | 'outlined',
      default: 'default'
    },
    theme: {
      type: String as () => 'light' | 'dark',
      default: 'light'
    },
    rounded: {
      type: Boolean,
      default: false
    },
    compact: {
      type: Boolean,
      default: false
    },
    header: {
      type: String,
      default: ''
    }
  },
  setup(props, { slots }) {
    const cardClasses = computed(() =>
      clsx(
        styles.card,
        styles[props.variant],
        props.theme === 'dark' && styles.dark,
        props.rounded && styles.rounded,
        props.compact && styles.compact
      )
    )

    return () => (
      <div class={cardClasses.value}>
        {props.header && (
          <div class={styles.header}>
            {props.header}
          </div>
        )}
        <div class={styles.content}>
          {slots.default?.()}
        </div>
      </div>
    )
  }
})
```

## Advanced Patterns

### 1. Dynamic Component with Theme Support

```typescript
// components/DynamicComponent.tsx
import { defineComponent, computed, inject, provide } from 'vue'
import { css } from 'goober'
import clsx from 'clsx'

// Theme context
const ThemeContext = Symbol('theme')

const styles = {
  container: css`
    padding: 1rem;
    margin: 0.5rem;
    border-radius: 0.375rem;
    transition: all 0.2s ease;
  `,

  light: css`
    background-color: #ffffff;
    color: #1f2937;
    border: 1px solid #e5e7eb;
  `,

  dark: css`
    background-color: #1f2937;
    color: #ffffff;
    border: 1px solid #374151;
  `,

  primary: css`
    background-color: #3b82f6;
    color: white;
  `,

  success: css`
    background-color: #10b981;
    color: white;
  `,

  warning: css`
    background-color: #f59e0b;
    color: white;
  `,

  danger: css`
    background-color: #ef4444;
    color: white;
  `
}

interface DynamicComponentProps {
  theme?: 'light' | 'dark'
  variant?: 'primary' | 'success' | 'warning' | 'danger'
}

export const useTheme = () => {
  const theme = inject(ThemeContext, 'light')
  return theme
}

export default defineComponent({
  name: 'DynamicComponent',
  props: {
    theme: {
      type: String as () => 'light' | 'dark',
      required: false
    },
    variant: {
      type: String as () => 'primary' | 'success' | 'warning' | 'danger',
      default: 'primary'
    }
  },
  setup(props, { slots }) {
    const inheritedTheme = useTheme()
    const activeTheme = computed(() => props.theme || inheritedTheme)

    provide(ThemeContext, activeTheme.value)

    const classes = computed(() =>
      clsx(
        styles.container,
        styles[activeTheme.value],
        styles[props.variant]
      )
    )

    return () => (
      <div class={classes.value}>
        {slots.default?.()}
      </div>
    )
  }
})
```

### 2. Form Component with Validation

```typescript
// components/FormInput.tsx
import { defineComponent, ref, computed, watch } from 'vue'
import { css, keyframes } from 'goober'
import clsx from 'clsx'

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`

const styles = {
  inputContainer: css`
    margin-bottom: 1rem;
    position: relative;
  `,

  label: css`
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
  `,

  input: css`
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    &.error {
      border-color: #ef4444;
      animation: ${shake} 0.3s ease-in-out;
    }
  `,

  errorMessage: css`
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  `,

  hint: css`
    color: #6b7280;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  `
}

interface FormInputProps {
  modelValue: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  pattern?: string
  minLength?: number
  maxLength?: number
  hint?: string
  validate?: (value: string) => string | null
}

export default defineComponent({
  name: 'FormInput',
  props: {
    modelValue: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      default: ''
    },
    minLength: {
      type: Number,
      default: 0
    },
    maxLength: {
      type: Number,
      default: Infinity
    },
    hint: {
      type: String,
      default: ''
    },
    validate: {
      type: Function as () => (value: string) => string | null,
      default: null
    }
  },
  emits: ['update:modelValue', 'validation'],
  setup(props, { emit }) {
    const error = ref<string | null>(null)
    const touched = ref(false)

    const validateInput = (value: string) => {
      if (props.required && !value.trim()) {
        return `${props.label} is required`
      }

      if (props.pattern && !new RegExp(props.pattern).test(value)) {
        return `Invalid format for ${props.label}`
      }

      if (value.length < props.minLength) {
        return `${props.label} must be at least ${props.minLength} characters`
      }

      if (value.length > props.maxLength) {
        return `${props.label} must be no more than ${props.maxLength} characters`
      }

      if (props.validate) {
        return props.validate(value)
      }

      return null
    }

    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement
      const value = target.value

      emit('update:modelValue', value)

      if (touched.value) {
        error.value = validateInput(value)
        emit('validation', { valid: !error.value, error: error.value })
      }
    }

    const handleBlur = () => {
      touched.value = true
      error.value = validateInput(props.modelValue)
      emit('validation', { valid: !error.value, error: error.value })
    }

    watch(() => props.modelValue, (newValue) => {
      if (touched.value) {
        error.value = validateInput(newValue)
        emit('validation', { valid: !error.value, error: error.value })
      }
    })

    return () => (
      <div class={styles.inputContainer}>
        <label class={styles.label}>
          {props.label}
          {props.required && <span>*</span>}
        </label>
        <input
          class={clsx(styles.input, error.value && styles.error)}
          type={props.type}
          value={props.modelValue}
          placeholder={props.placeholder}
          onInput={handleInput}
          onBlur={handleBlur}
        />
        {error.value && (
          <div class={styles.errorMessage}>
            {error.value}
          </div>
        )}
        {props.hint && !error.value && (
          <div class={styles.hint}>
            {props.hint}
          </div>
        )}
      </div>
    )
  }
})
```

## Composition Patterns

### 1. Reusable Style Compositions

```typescript
// composables/useStyles.ts
import { css } from 'goober'
import { computed } from 'vue'

export const useButtonStyles = () => {
  const baseButton = css`
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    font-weight: 500;
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  `

  const variants = {
    primary: css`
      background-color: #3b82f6;
      color: white;

      &:hover {
        background-color: #2563eb;
      }
    `,

    secondary: css`
      background-color: #6b7280;
      color: white;

      &:hover {
        background-color: #4b5563;
      }
    `,

    outline: css`
      background-color: transparent;
      border: 2px solid #3b82f6;
      color: #3b82f6;

      &:hover {
        background-color: #eff6ff;
      }
    `
  }

  const sizes = {
    sm: css`
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    `,

    md: css`
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
    `,

    lg: css`
      padding: 1rem 2rem;
      font-size: 1.125rem;
    `
  }

  return {
    baseButton,
    variants,
    sizes
  }
}

export const useLayoutStyles = () => {
  const container = css`
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  `

  const grid = css`
    display: grid;
    gap: 1rem;
  `

  const flex = css`
    display: flex;
    align-items: center;
    gap: 1rem;
  `

  const card = css`
    background: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  `

  return {
    container,
    grid,
    flex,
    card
  }
}
```

### 2. Type-Safe Theme Provider

```typescript
// providers/ThemeProvider.tsx
import { defineComponent, provide, ref, computed, InjectionKey } from 'vue'
import { css } from 'goober'

export type Theme = 'light' | 'dark'
export type ThemeContext = {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeInjectionKey: InjectionKey<ThemeContext> = Symbol('theme')

const styles = {
  provider: css`
    min-height: 100vh;
    transition: background-color 0.3s ease, color 0.3s ease;
  `,

  light: css`
    background-color: #ffffff;
    color: #1f2937;
  `,

  dark: css`
    background-color: #1f2937;
    color: #ffffff;
  `
}

export const useTheme = () => {
  const context = inject(ThemeInjectionKey)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export default defineComponent({
  name: 'ThemeProvider',
  setup(_, { slots }) {
    const theme = ref<Theme>('light')

    const toggleTheme = () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
    }

    const context: ThemeContext = {
      theme: theme.value,
      toggleTheme
    }

    provide(ThemeInjectionKey, context)

    const providerClasses = computed(() =>
      clsx(styles.provider, styles[theme.value])
    )

    return () => (
      <div class={providerClasses.value}>
        {slots.default?.()}
      </div>
    )
  }
})
```

## Performance Optimization

### 1. Memoized Styles

```typescript
// utils/memoizedStyles.ts
import { css } from 'goober'
import { shallowRef, triggerRef } from 'vue'

const styleCache = new Map<string, string>()

export const createMemoizedStyle = (key: string, styleFn: () => string) => {
  if (styleCache.has(key)) {
    return styleCache.get(key)!
  }

  const style = css(styleFn())
  styleCache.set(key, style)
  return style
}

export const clearStyleCache = () => {
  styleCache.clear()
}

// Usage in component
export default defineComponent({
  setup() {
    const dynamicStyle = createMemoizedStyle('unique-key', () => `
      background: ${getComputedBackground()};
      color: ${getComputedColor()};
    `)

    return () => <div class={dynamicStyle}>Content</div>
  }
})
```

### 2. Lazy Style Loading

```typescript
// composables/useLazyStyles.ts
import { ref, onMounted } from 'vue'
import { css } from 'goober'

export const useLazyStyles = (styleLoader: () => Promise<string>) => {
  const styles = ref<string | null>(null)
  const loaded = ref(false)

  onMounted(async () => {
    const styleString = await styleLoader()
    styles.value = css(styleString)
    loaded.value = true
  })

  return {
    styles,
    loaded
  }
}

// Usage
export default defineComponent({
  setup() {
    const { styles, loaded } = useLazyStyles(async () => {
      // Simulate async style loading
      const response = await fetch('/api/styles/heavy-component')
      return response.text()
    })

    return () => loaded.value ? (
      <div class={styles.value}>Heavy component content</div>
    ) : (
      <div>Loading styles...</div>
    )
  }
})
```

## Testing Vue 3 JSX Components

### 1. Unit Testing with Vitest

```typescript
// components/__tests__/Button.test.tsx
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Button from '../Button.tsx'

describe('Button', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me'
      }
    })

    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('button')
  })

  it('applies variant classes correctly', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'secondary'
      },
      slots: {
        default: 'Secondary Button'
      }
    })

    expect(wrapper.classes()).toContain('secondary')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Clickable'
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      },
      slots: {
        default: 'Disabled'
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })
})
```

### 2. Testing Style Application

```typescript
// components/__tests__/Card.test.tsx
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Card from '../Card.tsx'

describe('Card', () => {
  it('applies theme classes correctly', () => {
    const wrapper = mount(Card, {
      props: {
        theme: 'dark'
      },
      slots: {
        default: 'Dark card content'
      }
    })

    const cardElement = wrapper.find('.card')
    expect(cardElement.classes()).toContain('dark')
  })

  it('conditionally applies rounded classes', () => {
    const wrapper = mount(Card, {
      props: {
        rounded: true
      },
      slots: {
        default: 'Rounded card'
      }
    })

    expect(wrapper.classes()).toContain('rounded')
  })
})
```

## Best Practices

### 1. Type Safety
- Always define prop types with TypeScript interfaces
- Use proper type assertions for CSS-in-JS
- Leverage Vue's built-in type inference

### 2. Performance
- Memoize complex style computations
- Use computed properties for dynamic classes
- Implement lazy loading for heavy styles

### 3. Maintainability
- Organize styles in dedicated files or composables
- Use consistent naming conventions
- Document complex style logic

### 4. Testing
- Write unit tests for style logic
- Test conditional styling behavior
- Verify accessibility compliance

## Conclusion

Vue 3 JSX with TypeScript, goober.css, and clsx provides a powerful, type-safe development experience. This combination offers:

- **Type Safety**: Full TypeScript support throughout your components
- **Performance**: Lightweight CSS-in-JS with optimization capabilities
- **Maintainability**: Clear separation of concerns and reusable patterns
- **Developer Experience**: Excellent tooling support and IntelliSense

The approach demonstrated here scales well from small components to large applications while maintaining code quality and performance. Whether you're building a simple UI library or a complex application, this stack provides the flexibility and power needed for modern frontend development.

## Additional Resources

- [Vue 3 JSX Documentation](https://vuejs.org/guide/extras/render-function.html#jsx)
- [goober.css Documentation](https://github.com/cristianbote/goober)
- [clsx Documentation](https://github.com/lukeed/clsx)
- [Vue 3 TypeScript Guide](https://vuejs.org/guide/typescript/overview.html)

This comprehensive guide should help you build robust, type-safe Vue 3 applications using JSX with modern styling approaches!
