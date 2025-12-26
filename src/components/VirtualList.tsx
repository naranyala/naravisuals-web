import { defineComponent, PropType, ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { css } from 'goober'
import clsx from 'clsx'

interface VirtualListProps {
  items: any[]
  itemHeight: number
  containerHeight: number
  bufferSize?: number
  className?: string
}

const styles = {
  container: css`
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  `,

  viewport: css`
    position: relative;
  `,

  item: css`
    position: absolute;
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0 1rem;
    box-sizing: border-box;
    border-bottom: 1px solid #f3f4f6;

    &:hover {
      background: #f9fafb;
    }
  `,

  loading: css`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #6b7280;
  `
}

export default defineComponent({
  name: 'VirtualList',

  props: {
    items: {
      type: Array as PropType<any[]>,
      required: true
    },
    itemHeight: {
      type: Number,
      required: true
    },
    containerHeight: {
      type: Number,
      required: true
    },
    bufferSize: {
      type: Number,
      default: 5
    },
    className: String
  },

  setup(props, { slots }) {
    const scrollTop = ref(0)
    const containerRef = ref<HTMLElement>()

    const totalHeight = computed(() => props.items.length * props.itemHeight)

    const startIndex = computed(() =>
      Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.bufferSize!)
    )

    const endIndex = computed(() =>
      Math.min(
        props.items.length - 1,
        Math.ceil((scrollTop.value + props.containerHeight) / props.itemHeight) + props.bufferSize!
      )
    )

    const visibleItems = computed(() => {
      const items = []
      for (let i = startIndex.value; i <= endIndex.value; i++) {
        items.push({
          index: i,
          data: props.items[i],
          offset: i * props.itemHeight
        })
      }
      return items
    })

    const handleScroll = (e: Event) => {
      scrollTop.value = (e.target as HTMLElement).scrollTop
    }

    const scrollToIndex = (index: number) => {
      if (containerRef.value) {
        containerRef.value.scrollTop = index * props.itemHeight
      }
    }

    return () => (
      <div
        ref={containerRef}
        class={clsx(styles.container, props.className)}
        style={{ height: `${props.containerHeight}px` }}
        onScroll={handleScroll}
      >
        <div class={styles.viewport} style={{ height: `${totalHeight.value}px` }}>
          {visibleItems.value.map(item => (
            <div
              key={item.index}
              class={styles.item}
              style={{
                height: `${props.itemHeight}px`,
                transform: `translateY(${item.offset}px)`
              }}
            >
              {slots.default?.(item)}
            </div>
          ))}
        </div>
      </div>
    )
  }
})
