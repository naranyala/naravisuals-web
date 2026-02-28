import { defineComponent, h } from 'vue';

export const Dynamic = defineComponent({
  name: 'Dynamic',

  props: {
    is: {
      type: [Object, Function, String],
      required: true,
    },
  },

  setup(props, { slots, attrs }) {
    return () => h(props.is as any, attrs, slots);
  },
});
