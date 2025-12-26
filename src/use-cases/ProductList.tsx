// views/ProductList.tsx
import { defineComponent, PropType } from 'vue';
import { css } from 'goober';
import clsx from 'clsx';

// Local styles for layout
const styles = {
  root: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 220px;
  `,
  title: css`
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: #1f2937;
  `,
  meta: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  price: css`
    font-weight: 700;
    color: #111827;
    font-size: 1.125rem;
  `,
};

interface Props {
  name: string;
  price: number;
  inStock: boolean;
  featured?: boolean;
}

// Import other components
import Card from '../components/Card.tsx';
import Badge from '../components/Badge.tsx';

const ProductItem = defineComponent({
  name: 'ProductItem',
  props: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    inStock: { type: Boolean, required: true },
    featured: { type: Boolean, default: false },
  },
  setup(props) {
    return () => (
      <Card elevated={props.featured} padding="medium">
        <div class={styles.root}>
          <h3 class={styles.title}>{props.name}</h3>

          <div class={styles.meta}>
            <span class={styles.price}>${props.price.toFixed(2)}</span>

            <Badge variant={props.inStock ? 'success' : 'warning'}>
              {props.inStock ? 'In Stock' : 'Out of Stock'}
            </Badge>
          </div>
        </div>
      </Card>
    );
  },
});


const products = [
  { id: 1, name: 'Wireless Headphones', price: 129.99, inStock: true, featured: true },
  { id: 2, name: 'Mechanical Keyboard', price: 89.5, inStock: true, featured: false },
  { id: 3, name: '4K Webcam', price: 65.0, inStock: false, featured: false },
];

export default defineComponent({
  name: 'ProductList',
  setup() {
    return () => (
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', padding: '24px' }}>
        {products.map((p) => (
          <ProductItem
            key={p.id}
            name={p.name}
            price={p.price}
            inStock={p.inStock}
            featured={p.featured}
          />
        ))}
      </div>
    );
  },
});
