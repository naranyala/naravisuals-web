import { defineComponent, PropType, ref, computed } from 'vue'
import { css } from 'goober'
import clsx from 'clsx'

interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
  expanded?: boolean
  disabled?: boolean
  icon?: string
}

interface VirtualTreeProps {
  nodes: TreeNode[]
  maxHeight?: number
  selectable?: boolean
  checkable?: boolean
  className?: string
}

const styles = {
  container: css`
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
  `,

  nodeList: css`
    overflow-y: auto;
  `,

  node: css`
    display: flex;
    align-items: center;
    padding: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid #f3f4f6;

    &:hover:not(.disabled) {
      background: #f9fafb;
    }

    &.selected {
      background: #eff6ff;
      color: #3b82f6;
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,

  nodeContent: css`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  `,

  expandIcon: css`
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: #6b7280;
    transition: transform 0.2s ease;

    &.expanded {
      transform: rotate(90deg);
    }

    &.leaf {
      opacity: 0;
    }
  `,

  checkbox: css`
    width: 1rem;
    height: 1rem;
    cursor: pointer;
  `,

  icon: css`
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  `,

  label: css`
    flex: 1;
    font-size: 0.875rem;
  `,

  indent: css`
    width: 1.5rem;
  `
}

export default defineComponent({
  name: 'VirtualTree',

  props: {
    nodes: {
      type: Array as PropType<TreeNode[]>,
      required: true
    },
    maxHeight: {
      type: Number,
      default: 400
    },
    selectable: Boolean,
    checkable: Boolean,
    className: String
  },

  emits: ['node-click', 'node-toggle', 'node-check'],

  setup(props, { emit }) {
    const expandedKeys = ref<Set<string>>(new Set())
    const selectedKey = ref<string | null>(null)
    const checkedKeys = ref<Set<string>>(new Set())

    const flattenNodes = (nodes: TreeNode[], level: number = 0): any[] => {
      const result: any[] = []

      nodes.forEach(node => {
        result.push({
          ...node,
          level,
          visible: level === 0 || expandedKeys.value.has(node.id.split('-').slice(0, -1).join('-'))
        })

        if (node.children && node.children.length > 0 && expandedKeys.value.has(node.id)) {
          result.push(...flattenNodes(node.children, level + 1))
        }
      })

      return result
    }

    const flatNodes = computed(() => flattenNodes(props.nodes))
    const visibleNodes = computed(() => flatNodes.value.filter(node => node.visible))

    const toggleNode = (node: TreeNode) => {
      if (node.children && node.children.length > 0) {
        if (expandedKeys.value.has(node.id)) {
          expandedKeys.value.delete(node.id)
        } else {
          expandedKeys.value.add(node.id)
        }
        emit('node-toggle', node)
      }
    }

    const handleNodeClick = (node: TreeNode) => {
      if (node.disabled) return

      if (props.selectable) {
        selectedKey.value = node.id
      }

      emit('node-click', node)
    }

    const handleNodeCheck = (node: TreeNode, checked: boolean) => {
      if (checked) {
        checkedKeys.value.add(node.id)
      } else {
        checkedKeys.value.delete(node.id)
      }

      emit('node-check', node, checked)
    }

    const isLeaf = (node: TreeNode) => !node.children || node.children.length === 0

    return () => (
      <div class={clsx(styles.container, props.className)}>
        <div class={styles.nodeList} style={{ maxHeight: `${props.maxHeight}px` }}>
          {visibleNodes.value.map(node => (
            <div
              key={node.id}
              class={clsx(
                styles.node,
                selectedKey.value === node.id && 'selected',
                node.disabled && 'disabled'
              )}
              onClick={() => handleNodeClick(node)}
            >
              <div class={styles.nodeContent}>
                {Array.from({ length: node.level }).map((_, i) => (
                  <div key={i} class={styles.indent} />
                ))}

                <div
                  class={clsx(
                    styles.expandIcon,
                    expandedKeys.value.has(node.id) && 'expanded',
                    isLeaf(node) && 'leaf'
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleNode(node)
                  }}
                >
                  {isLeaf(node) ? '' : '▶'}
                </div>

                {props.checkable && (
                  <input
                    type="checkbox"
                    class={styles.checkbox}
                    checked={checkedKeys.value.has(node.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleNodeCheck(node, (e.target as HTMLInputElement).checked)}
                  />
                )}

                {node.icon && (
                  <div class={styles.icon}>{node.icon}</div>
                )}

                <div class={styles.label}>{node.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
})
