import { defineComponent } from 'vue';

export const For = defineComponent({
  name: 'For',

  props: {
    each: {
      type: Array as () => readonly unknown[],
      required: true,
    },
  },

  setup(props, { slots }) {
    return () => props.each.map((item, index) => slots.default?.(item, index));
  },
});

// <For each={items}>
//   {(item) => <Text>{item}</Text>}
// </For>
