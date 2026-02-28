import { defineComponent, Fragment as VueFragment } from 'vue';

export const Fragment = defineComponent({
  name: 'Fragment',

  setup(_, { slots }) {
    return () => <VueFragment>{slots.default?.()}</VueFragment>;
  },
});
