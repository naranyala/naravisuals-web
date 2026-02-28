import { defineComponent, type PropType, provide } from 'vue';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  radii: string;
  shadows: string;
}

export const defaultTheme: Theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#ffffff',
    text: '#212529',
  },
  radii: '8px',
  shadows: '0 4px 12px rgba(0,0,0,0.15)',
};

export const ThemeProvider = defineComponent({
  props: {
    theme: {
      type: Object as PropType<Partial<Theme>>,
      default: () => ({}),
    },
  },
  setup(props, { slots }) {
    const mergedTheme = { ...defaultTheme, ...props.theme };
    provide('theme', mergedTheme); // Inject for descendants
    return () => slots.default?.();
  },
});
