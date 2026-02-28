import {
  defineComponent,
  onMounted,
  onUnmounted,
  type PropType,
  ref,
} from 'vue';

interface MediaQueryProps {
  query: string;
  fallback?: any;
  render?: (matches: boolean) => any;
}

export default defineComponent({
  name: 'MediaQuery',

  props: {
    query: {
      type: String,
      required: true,
    },
    fallback: null,
    render: Function as PropType<(matches: boolean) => any>,
  },

  setup(props, { slots }) {
    const matches = ref(false);
    let mediaQuery: MediaQueryList | null = null;

    onMounted(() => {
      if (typeof window !== 'undefined' && window.matchMedia) {
        mediaQuery = window.matchMedia(props.query);
        matches.value = mediaQuery.matches;

        const handler = (e: MediaQueryListEvent) => {
          matches.value = e.matches;
        };

        mediaQuery.addEventListener('change', handler);

        onUnmounted(() => {
          mediaQuery?.removeEventListener('change', handler);
        });
      }
    });

    return () => {
      if (props.render) {
        return props.render(matches.value);
      }

      if (matches.value) {
        return slots.default?.();
      }

      return slots.fallback?.() || props.fallback || null;
    };
  },
});
