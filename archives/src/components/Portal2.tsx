// src/components/Portal.tsx
import { defineComponent, Teleport } from 'vue';

interface PortalProps {
  to?: string;
  disabled?: boolean;
}

export const Portal = defineComponent({
  name: 'Portal',
  props: {
    to: {
      type: String,
      default: 'body',
    },
    disabled: Boolean,
  },
  setup(props) {
    // Create portal target if it doesn't exist
    const ensurePortalTarget = () => {
      if (typeof document === 'undefined') return;

      const targetId = props.to;
      if (targetId.startsWith('#')) {
        const id = targetId.slice(1);
        let element = document.getElementById(id);

        if (!element) {
          element = document.createElement('div');
          element.id = id;
          document.body.appendChild(element);
        }
      }
    };

    return {
      ensurePortalTarget,
    };
  },
  mounted() {
    this.ensurePortalTarget();
  },
  render() {
    if (this.disabled) {
      return this.$slots.default?.();
    }

    return <Teleport to={this.to}>{this.$slots.default?.()}</Teleport>;
  },
});
