/* TreeView.jsx */
import { defineComponent, ref, nextTick } from 'vue';
import { css } from 'goober';
import { animate } from 'motion';


/* ---------- reusable tree-node ---------- */
const TreeNode = defineComponent({
    name: 'TreeNode',
    props: {
        node: { type: Object, required: true },        // { label, children? }
        depth: { type: Number, default: 0 },
    },
    setup({ node, depth }) {
        const isOpen = ref(true);
        const childrenEl = ref(null);                  // wrapper <ul> for animation

        const toggle = async () => {
            isOpen.value = !isOpen.value;
            await nextTick();                            // make sure <ul> is in DOM
            const el = childrenEl.value;
            if (!el) return;

            if (isOpen.value) {
                // expand: slideDown + fadeIn
                animate(el, { height: [0, el.scrollHeight], opacity: [0, 1] }, { duration: 0.25, easing: 'ease-out' })
                    .finished.then(() => (el.style.height = 'auto'));
            } else {
                // collapse: slideUp + fadeOut
                await animate(el, { height: 0, opacity: 0 }, { duration: 0.2, easing: 'ease-in' })
                    .finished;
            }
        };

        /* ---------- scoped styles via goober ---------- */
        const row = css`
          display: flex;
          align-items: center;
          padding: 4px 0;
          cursor: pointer;
          user-select: none;
          &:hover {
            color: #0ea5e9;
          }
        `;

        const indent = css`
          margin-left: ${depth * 24 * 2}px;
        `;

        const list = css`
          list-style: none;
          padding: 0;
          margin: 0;
          overflow: hidden;
        `;

        const hasChildren = Array.isArray(node.children) && node.children.length;

        return () => (
            <li>
                <div class={`${row} ${indent}`} onClick={hasChildren ? toggle : undefined}>
                    {hasChildren ? ">\t" : ""}
                    <span>{node.label}</span>
                </div>

                {hasChildren && (
                    <ul ref={childrenEl} class={list} style={{ display: isOpen.value ? 'block' : 'none' }}>
                        {node.children.map((child) => (
                            <TreeNode key={child.label} node={child} depth={depth + 1} />
                        ))}
                    </ul>
                )}
            </li>
        );
    },
});

/* ---------- root tree-view ---------- */
const TreeView = defineComponent({
    name: 'TreeView',
    props: {
        data: { type: Array, default: () => [] }, // Array of nodes
    },
    setup({ data }) {
        const rootList = css`
          list-style: none;
          padding: 0;
          margin: 0;
          font-family: system-ui, sans-serif;
          font-size: 24px;
        `;

        return () => (
            <ul class={rootList}>
                {data.map((node) => (
                    <TreeNode key={node.label} node={node} />
                ))}
            </ul>
        );
    },
});


export default {
    setup() {
        const tree = ref([
            {
                label: 'Animals',
                children: [
                    { label: 'Dog' },
                    { label: 'Cat', children: [{ label: 'Persian' }, { label: 'Siamese' }] },
                ],
            },
            {
                label: 'Plants',
                children: [{ label: 'Oak' }, { label: 'Pine' }],
            },
        ]);

        return () => (
            <div style={{ padding: '2rem' }}>
                <h3>File-tree demo</h3>
                <TreeView data={tree.value} />
            </div>
        );
    },
};
