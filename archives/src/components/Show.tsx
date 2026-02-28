import { defineComponent } from 'vue';

export const Show = defineComponent({
  name: 'Show',

  props: {
    when: {
      type: Boolean,
      required: true,
    },
  },

  setup(props, { slots }) {
    return () => (props.when ? slots.default?.() : slots.fallback?.());
  },
});

// <Show when={ready}>
//   <Panel>Ready</Panel>
//   {{
//     fallback: () => <Text>Loading…</Text>
//   }}
// </Show>
