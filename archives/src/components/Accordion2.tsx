import { defineComponent, inject, PropType, provide, ref } from 'vue';

// Context key for accordion state
const AccordionContext = Symbol('accordion-context');

interface AccordionItemProps {
  id: string;
  title: string;
  disabled?: boolean;
}

interface AccordionContextType {
  activeItem: string | null;
  toggleItem: (id: string) => void;
  multiple: boolean;
}

// Accordion Container
export const Accordion = defineComponent({
  name: 'Accordion',

  props: {
    multiple: Boolean,
    defaultActiveItem: String,
    className: String,
  },

  setup(props, { slots }) {
    const activeItem = ref<string | null>(props.defaultActiveItem || null);
    const activeItems = ref<Set<string>>(new Set());

    const toggleItem = (id: string) => {
      if (props.multiple) {
        if (activeItems.value.has(id)) {
          activeItems.value.delete(id);
        } else {
          activeItems.value.add(id);
        }
      } else {
        activeItem.value = activeItem.value === id ? null : id;
      }
    };

    const isItemActive = (id: string) => {
      return props.multiple
        ? activeItems.value.has(id)
        : activeItem.value === id;
    };

    provide(AccordionContext, {
      activeItem: activeItem.value,
      toggleItem,
      multiple: props.multiple,
    });

    return () => (
      <div class={['accordion', props.className]}>{slots.default?.()}</div>
    );
  },
});

// Accordion Item
export const AccordionItem = defineComponent({
  name: 'AccordionItem',

  props: {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    disabled: Boolean,
  },

  setup(props, { slots }) {
    const context = inject<AccordionContextType>(AccordionContext);

    if (!context) {
      throw new Error('AccordionItem must be used within Accordion');
    }

    const isActive = computed(() =>
      context.multiple
        ? (context as any).activeItems.has(props.id)
        : context.activeItem === props.id,
    );

    const handleToggle = () => {
      if (!props.disabled) {
        context.toggleItem(props.id);
      }
    };

    return () => (
      <div class={['accordion-item', isActive.value && 'active']}>
        <button
          class="accordion-header"
          onClick={handleToggle}
          disabled={props.disabled}
        >
          {props.title}
          <span class="accordion-icon">{isActive.value ? '−' : '+'}</span>
        </button>

        {isActive.value && (
          <div class="accordion-content">{slots.default?.()}</div>
        )}
      </div>
    );
  },
});

// Usage example:
// <Accordion multiple>
//   <AccordionItem id="1" title="Section 1">Content 1</AccordionItem>
//   <AccordionItem id="2" title="Section 2">Content 2</AccordionItem>
// </Accordion>
