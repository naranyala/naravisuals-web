/** @jsxImportSource vue */
import { defineComponent, onMounted, ref } from "vue";
import { css } from "goober";

const styles = {
  header: css`
    min-height: 400px;
    /* min-height: 100dvh; */
    background: #0b0c1a;
    color: white;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

    /* Moving gradient orb background */
    &::before {
      content: '';
      position: absolute;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 70%, #7f5af0 0%, #5e17eb 40%, transparent 70%);
      filter: blur(100px);
      opacity: 0.4;
      top: -200px;
      left: -200px;
      animation: float 25s infinite ease-in-out;
    }

    &::after {
      content: '';
      position: absolute;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle at 80% 20%, #ff2e63 0%, #08f5ff 50%, transparent 70%);
      filter: blur(120px);
      opacity: 0.3;
      bottom: -150px;
      right: -150px;
      animation: float 30s infinite ease-in-out reverse;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      50% { transform: translate(100px, -100px) rotate(10deg); }
    }
  `,


  logo: css`
    font-size: 1.75rem;
    font-weight: 800;
    background: linear-gradient(90deg, #7f5af0, #ff2e63);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
  `,

  navLinks: css`
    display: flex;
    gap: 40px;

    a {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      font-weight: 500;
      position: relative;
      transition: color 0.3s ease;

      &:hover {
        color: white;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 0;
        height: 2px;
        background: linear-gradient(90deg, #7f5af0, #ff2e63);
        transition: width 0.4s ease;
      }

      &:hover::after {
        width: 100%;
      }
    }
  `,

  container: css`
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 40px;
    text-align: center;
    position: relative;
    z-index: 2;
  `,

  card: css`
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 32px;
    padding: 60px 80px;
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    opacity: 0;
    transform: translateY(40px);
    transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1);
    
    &.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `,

  title: css`
    font-size: 4rem;
    font-weight: 900;
    margin: 0 0 20px 0;
    max-width: 600px;
    line-height: 1.1;
    letter-spacing: -2px;
    background: linear-gradient(90deg, #ffffff, #aaaaaa);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  `,

  subtitle: css`
    font-size: 1.4rem;
    opacity: 0.8;
    max-width: 680px;
    margin: 0 auto 40px;
    line-height: 1.6;
    color: #e0e0ff;
  `,

  ctaRow: css`
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 48px;
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s s ease 0.4s;

    &.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `,

  primaryBtn: css`
    background: linear-gradient(135deg, #7f5af0, #5e17eb);
    color: white;
    padding: 16px 36px;
    border-radius: 16px;
    font-weight: 600;
    font-size: 1.1rem;
    border: none;
    cursor: pointer;
    box-shadow: 0 10px 30px rgba(127, 90, 240, 0.4);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(127, 90, 240, 0.5);
    }
  `,

  secondaryBtn: css`
    background: transparent;
    color: white;
    padding: 16px 36px;
    border: 1.5px solid rgba(255, 255, 255, 0.3);
    border-radius: 16px;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: white;
    }
  `,
};

export default defineComponent({
  name: "PageHeader",
  props: {
    title: { type: String, default: "Welcome to the Future" },
    subtitle: { type: String }
  },

  setup(props) {
    const cardRef = ref(null);
    const ctaRef = ref(null);

    onMounted(() => {
      setTimeout(() => {
        if (cardRef.value) cardRef.value.classList.add("visible");
      }, 200);

      setTimeout(() => {
        if (ctaRef.value) ctaRef.value.classList.add("visible");
      }, 600);
    });

    return () => (
      <header class={styles.header}>

        <div class={styles.container}>
            <h1 class={styles.title}>
              {props.title}
            </h1>
            <p class={styles.subtitle}>
              {props.subtitle || "Ship faster. Build smarter. Scale infinitely. The all-in-one platform for modern development teams."}
            </p>

        </div>
      </header>
    );
  },
});
