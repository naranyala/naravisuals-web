// src/components/ClickOutside.tsx
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'

interface ClickOutsideProps {
  active?: boolean
  onClickOutside: (event: MouseEvent) => void
}

export const ClickOutside = defineComponent({
  name: 'ClickOutside',
  props: {
    active: {
      type: Boolean,
      default: true
    },
    onClickOutside: {
      type: Function as PropType<ClickOutsideProps['onClickOutside']>,
      required: true
    }
  },
  setup(props) {
    const containerRef = ref<HTMLElement>()

    const handleClickOutside = (event: MouseEvent) => {
      if (!props.active) return

      const target = event.target as Node
      if (containerRef.value && !containerRef.value.contains(target)) {
        props.onClickOutside(event)
      }
    }

    onMounted(() => {
      document.addEventListener('mousedown', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('mousedown', handleClickOutside)
    })

    return {
      containerRef
    }
  },
  render() {
    return (
      <div ref="containerRef">
        {this.$slots.default?.()}
      </div>
    )
  }
})
