import clsx from 'clsx';
import { css, setup } from 'goober';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'ArticleReferences',
  props: { references: Array },
  render(props) {
    return (
      <div class={clsx(styles.referencesContainer)}>
        <h2 class={clsx(styles.title)}>References</h2>
        <ul class={clsx(styles.referenceList)}>
          {props.references.map((ref, index) => (
            <li key={index} class={clsx(styles.referenceItem)}>
              <div class={clsx(styles.authors)}>{ref.authors}</div>
              <div class={clsx(styles.paperTitle)}>{ref.title}</div>
              <div class={clsx(styles.details)}>
                <span class={clsx(styles.journal)}>{ref.journal}</span>
                {ref.journal && ref.year && ', '}
                <span class={clsx(styles.year)}>{ref.year}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  },
});

const styles = {
  referencesContainer: css`
    max-width: 740px;
    margin: 0 24px;
    padding-top: 20px;
    padding-left: 1.5rem;
    padding-bottom: 3rem;
    background-color: #1e1e1e;
    color: #e0e0e0;
    border-radius: 10px;
    margin-bottom: 100px;
  `,

  // Title for the references section
  title: css`
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 1rem;
    text-align: left;
    padding: 20px 1.5rem;
  `,

  // List of references
  referenceList: css`
    list-style: none;
    padding: 20px 10px;
    margin: 0;
    border: 0px solid gray;
    border-radius: 20px;
  `,

  // Individual reference item (one-liner)
  referenceItem: css`
    margin-bottom: 1rem;
    padding-left: 0.8rem;
    font-size: 0.95rem;
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
  `,

  // Authors of the reference
  authors: css`
    font-weight: 600;
    margin-right: 0.5rem;
  `,

  // Title of the paper/reference
  paperTitle: css`
    font-style: italic;
    margin-right: 0.5rem;
  `,

  // Journal and year
  journal: css`
    font-weight: 500;
    margin-right: 0.3rem;
  `,

  // Year of publication
  year: css`
  `,

  // Meta information (e.g., "Read more" or "DOI")
  readerMeta: css`
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-style: italic;
  `,

  // Excerpt or abstract
  readerExcerpt: css`
    font-size: 1rem;
    line-height: 1.7;
    margin: 1rem 0 2rem;
    font-style: italic;
    border-left: 3px solid #6b7280;
    padding-left: 1rem;
    background-color: #f9f9f9;
    padding: 1rem;
  `,
};
