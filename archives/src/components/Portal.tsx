import { defineComponent, Teleport } from 'vue';

export const Portal = defineComponent({
  name: 'Portal',

  props: {
    to: {
      type: String,
      default: 'body',
    },
  },

  setup(props, { slots }) {
    return () => <Teleport to={props.to}>{slots.default?.()}</Teleport>;
  },
});
