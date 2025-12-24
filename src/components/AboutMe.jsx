// FullscreenModal.jsx
import { ref, defineComponent } from 'vue'
import { css } from 'goober'
import clsx from 'clsx'

import Navbar from "./Navbar.jsx"

export default defineComponent({
  name: "AboutMe",
  setup(props){},
  render(){
    return (
                <div class={styles.content}>
                  <h3 class={styles.h3}>Hi, I’m Alex Johnson</h3>
                  <p>
                    I’m a full-stack developer who loves turning ideas into polished, performant
                    applications. I care deeply about clean code, intuitive UX, and open-source.
                  </p>

                  <h4 class={styles.h4}>Core Skills</h4>
                  <ul class={styles.ul}>
                    <li class={styles.li}>Vue / React / TypeScript</li>
                    <li class={styles.li}>Node.js & Rust</li>
                    <li class={styles.li}>Tailwind, goober, css-in-js</li>
                    <li class={styles.li}>Docker, CI/CD, AWS</li>
                  </ul>

                  <h4 class={styles.h4}>When I’m not coding</h4>
                  <p>
                    You’ll find me hiking local trails, contributing to open-source, or experimenting
                    with new recipes in the kitchen.
                  </p>

                </div>
    )
  }
})

const styles = {
  triggerContainer: css`
    text-align: center;
    margin: 100px;
  `,
  // Trigger button
  trigger: css`
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    /*border: 1px solid #374151;*/
    /*border-radius: 0px;*/
    /* background: #1f2937; */
    background: none;
    color: #e5e7eb;
    transition: all 0.2s ease;
    &:hover {
      background: #374151;
      border-color: #4b5563;
    }
  `,

  // Backdrop
  backdrop: css`
    position: fixed;
    inset: 0;
    background: #000000;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,

  // Modal card
  card: css`
    background: #111827;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.35s ease-out;
    @keyframes slideUp {
      from {
        transform: translateY(24px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,

  // Header
  header: css`
    padding: 16px 24px;
    border-bottom: 1px solid #374151;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
    background: #111827;
  `,

  // Back button
  backBtn: css`
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
    color: #9ca3af;
    transition: color 0.2s;
    &:hover {
      color: #e5e7eb;
    }
  `,

  title: css`
    font-size: 20px;
    font-weight: 600;
    color: #f9fafb;
  `,

  // Body
  body: css`
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    color: #d1d5db;
    line-height: 1.6;
    background: #111827;
  `,

  content: css`
    max-width: 720px;
    margin: 50px 0;
  `,

  h3: css`
    font-size: 18px;
    color: #f9fafb;
    margin-bottom: 12px;
  `,

  h4: css`
    font-size: 16px;
    color: #f9fafb;
    margin-top: 20px;
    margin-bottom: 8px;
  `,

  p: css`
    margin-bottom: 16px;
    color: #d1d5db;
  `,

  ul: css`
    padding-left: 20px;
    margin-bottom: 16px;
  `,

  li: css`
    margin-bottom: 4px;
    color: #d1d5db;
  `,

  links: css`
    margin-top: 20px;
    display: flex;
    gap: 20px;
  `,

  link: css`
    color: #60a5fa;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
    &:hover {
      color: #93c5fd;
    }
  `
}
