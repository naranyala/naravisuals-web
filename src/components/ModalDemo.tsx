import { defineComponent, ref } from 'vue';
import { ThemeProvider, defaultTheme } from '../theme';
import Button from './Button.tsx';
import Modal from './Modal.tsx';

const darkTheme = {
  colors: {
    primary: '#0d6efd',
    secondary: '#6c757d',
    background: '#212529',
    text: '#f8f9fa',
  },
};

export default defineComponent({
  setup() {
    const showModal = ref(false);
    const hasError = ref(true);

    return () => (
      <ThemeProvider theme={darkTheme}>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h1>Themed Modal Demo</h1>
          <Button onClick={() => (showModal.value = true)}>Open Modal</Button>
          <Button variant="secondary" style={{ marginLeft: '16px' }} onClick={() => (hasError.value = !hasError.value)}>
            Toggle Error State
          </Button>

          <Modal open={showModal.value} hasError={hasError.value} onClose={() => (showModal.value = false)}>
            <h2>Modal Title</h2>
            <p>This modal uses keyframes, theme colors, and conditional borders.</p>
            <Button variant="primary" onClick={() => (showModal.value = false)}>Close</Button>
          </Modal>
        </div>
      </ThemeProvider>
    );
  },
});
