
import { defineComponent, ref, watch, computed } from 'vue';
import { css } from 'goober';
// import { animate } from 'motion';


// Group styles into a single object
const styles = {
    container: css`
        max-width: 400px;
        margin: 0 auto;
        padding: 20px;
        font-family: Arial, sans-serif;
      `,
    title: css`
        color: #333;
        text-align: center;
      `,
    input: css`
        width: 100%;
        padding: 10px;
        margin-bottom: 20px;
        border: 1px solid #ccc;
        border-radius: 4px;
      `,
    list: css`
        list-style: none;
        padding: 0;
        color: black;
      `,
    listItem: css`
        padding: 10px;
        margin-bottom: 8px;
        background: #f5f5f5;
        border-radius: 4px;
        transition: background 0.2s;

        &:hover {
          background: #e0e0e0;
        }
      `,
    highlight: css`
        background-color: yellow;
        font-weight: bold;
      `,
};

// Simple fuzzy search function
const fuzzySearch = (query, items) => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((item) => {
        const text = item.text.toLowerCase();
        return text.includes(q);
    }).map((item) => {
        const q = new RegExp(query, 'gi');
        const text = item.text;
        const parts = text.split(q);
        const matches = text.match(q) || [];
        return {
            ...item,
            parts,
            matches,
        };
    });
};

export default defineComponent({
    setup() {
        const searchQuery = ref('');
        const items = ref([
            { id: 1, text: 'Apple' },
            { id: 2, text: 'Banana' },
            { id: 3, text: 'Orange' },
            { id: 4, text: 'Grapes' },
            { id: 5, text: 'Pineapple' },
            { id: 6, text: 'Strawberry' },
            { id: 7, text: 'Watermelon' },
        ]);

        // Computed filtered and highlighted items
        const filteredItems = computed(() => {
            return fuzzySearch(searchQuery.value, items.value);
        });

        return () => (
            <div class={styles.container}>
                <h1 class={styles.title}>Fuzzy Search List</h1>
                <input
                    type="text"
                    v-model={searchQuery.value}
                    class={styles.input}
                    placeholder="Search..."
                />
                <ul class={styles.list}>
                    {filteredItems.value.map((item) => (
                        <>
                            {/* <pre>{JSON.stringify(item, null, 2)}</pre> */}
                            <li key={item.id} class={styles.listItem}>
                                {!item.parts && item.text}

                                {item.parts && item.parts.map((part, i) => (
                                    <>
                                        {part}
                                        {item.matches[i] && (
                                            <span class={styles.highlight}>
                                                {item.matches[i]}
                                            </span>
                                        )}

                                    </>
                                ))}
                            </li>
                        </>
                    ))}
                </ul>
            </div>
        );
    },
});
