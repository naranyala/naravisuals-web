// PantheonDiagramDark.jsx
import { defineComponent } from 'vue';
import { css } from 'goober';
import clsx from 'clsx';


export default defineComponent({
  name: 'Projects',
  props: {
    sections: {
      type: Array,
      default: () => [
        {
          title: 'vibe-docs',
          subtitle: 'exploration',
          items: ['sample-1', 'sample-2']
        },
        {
          title: 'js/vue',
          subtitle: 'exploration',
          items: ['sample-1', 'sample-2']
        },

        {
          title: 'c-related',
          subtitle: 'exploration',
          items: ['sample-1', 'sample-2']
        },

        {
          title: 'rust-related',
          subtitle: 'exploration',
          items: ['sample-1', 'sample-2'],
        },

      ],
    },
    compact: { type: Boolean, default: false },
    className: { type: String, default: '' },
  },
  setup(props) {

    const actionClick = (obj) => {
      console.log(obj)
    }

    return () => (
      <div class={clsx(styles.container, props.className)}>
        <div class={styles.row}>
          {props.sections.map((sec) => (
            <section
              key={sec.title}
              class={clsx(styles.sectionCard, props.compact && styles.compactSectionCard)}
            >
              <header class={styles.sectionHeader}>
            <div class={styles.textCenter}>
                  <h3 class={styles.title}>{sec.title}</h3>
                  {sec.subtitle ? <div class={styles.subtitle}>{sec.subtitle}</div> : null}
                </div>
              </header>

              <ul class={styles.itemList}>
            {sec.items.map((item, idx) => (
                  <li
                    key={item}
                    class={clsx(styles.item, props.compact && styles.compactItem)}
                    style={{ textAlign: 'center', width: '100%' }}
                    onClick={() => actionClick({context: sec.title, selected: item })}
                  >
                    {typeof item === 'string' ? item : item.label ?? item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

      </div>
    );
  },
});


const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    color: #e6eef8;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  `,
  row: css`
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
    align-items: flex-start;
  `,
  sectionCard: css`
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
    border-radius: 12px;
    padding: 16px;
    min-width: 240px;
    flex: 1 1 280px;
    border: 1px solid rgba(255,255,255,0.04);
    box-shadow: 0 8px 30px rgba(2,6,23,0.6);
    color: #d7e7fb;
  `,
  sectionHeader: css`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  `,
  title: css`
    font-size: 14px;
    font-weight: 700;
    margin: 0;
    color: #e6f0ff;
  `,
  subtitle: css`
    font-size: 12px;
    color: rgba(230,240,255,0.65);
  `,
  itemList: css`
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  `,
  item: css`
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
    color: #cfe7ff;
    padding: 8px 10px;
    border-radius: 10px;
    font-size: 13px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(255,255,255,0.03);
    box-shadow: 0 2px 8px rgba(2,6,23,0.45) inset;
    text-align: center;

    &:hover { background: black; }
  `,
  tagAccent: css`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(180deg, #7c9cff, #4f46e5);
    box-shadow: 0 2px 6px rgba(79,70,229,0.18);
    flex: 0 0 8px;
  `,
  compactSectionCard: css`
    padding: 10px;
  `,
  compactItem: css`
    padding: 6px 8px;
    font-size: 12px;
  `,
  footerNote: css`
    margin-top: 8px;
    font-size: 12px;
    color: rgba(230,240,255,0.55);
  `,
  textCenter: css`text-align: center; width: 100%;`
};
