import { defineComponent, ref, onMounted, nextTick, watch } from 'vue'
import { css } from 'goober'
import clsx from 'clsx'

export default defineComponent({
  name: 'Navbar',
  setup() {
    /* Data */
    const tabs = [
      { label: 'Home', url: '?tab=home' },
      { label: 'About', url: '?tab=about' },
      { label: 'Services', url: '?tab=services' },
      { label: 'Portfolio', url: '?tab=portofolio' },
      { label: 'Contact', url: '?tab=contact' }
    ]

    /* State */
    const activeTab = ref(0)
    const sliderStyle = ref>({ left: '0px', width: '0px' })
    const navContainerRef = ref(null)

    /* Navigation */
    const changeRoute = (url) => {
      console.log(url)
      window.location = url
    }


    /* Combined base class for nav items */
    const navItemBase = `${styles.navItem} ${styles.navItemHover}`

    /* Slider update logic */
    const updateSlider = () => {
      nextTick(() => {
        const container = navContainerRef.value
        if (!container) return

        const navItems = Array.from(container.querySelectorAll<HTMLElement>('[data-nav-item]'))
        const activeEl = navItems[activeTab.value]
        if (activeEl) {
          sliderStyle.value = {
            left: `${activeEl.offsetLeft}px`,
            width: `${activeEl.offsetWidth}px`
          }
        }
      })
    }

    const setActiveTab = (index) => {
      activeTab.value = index
      updateSlider()
    }

    onMounted(updateSlider)
    watch(activeTab, updateSlider)


    return (
      <nav class={styles.navbar}>
        <div ref={navContainerRef} class={styles.navContainer}>
          {tabs.map((tab, index) => (
            <div
              key={index}
              data-nav-item
              class={clsx(navItemBase, { [styles.navItemActive]: activeTab === index })}
              onClick={() => {
                setActiveTab(index)
                changeRoute(tab.url)
              }}
            >
              {tab.label}
            </div>
          ))}

          <div
            class={styles.slider}
            style={{ left: sliderStyle.left, width: sliderStyle.width }}
          />
        </div>
      </nav>
    )
  }
})


    /* Styles merged into one object */
    const styles = {
      navbar: css`
        background: #1e1e1e;
        padding: 0;
        font-family: 'Inter', system-ui, sans-serif;
        position: fixed;
        bottom: 0;
        width: 100%;
      `,
      navContainer: css`
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: stretch;
      `,
      navItem: css`
        flex: 1;
        text-align: center;
        padding: 4px;
        border-radius: 50px;
        cursor: pointer;
        font-weight: 600;
        color: #a0a0a0;
        transition: color 0.3s ease;
        position: relative;
        z-index: 2;
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
      `,
      navItemHover: css`
        &:hover {
          color: #e0e0e0;
        }
      `,
      navItemActive: css`
        color: #ffffff;
        font-weight: 700;
      `,
      slider: css`
        position: absolute;
        height: 100%;
        border-radius: 50px;
        background: linear-gradient(135deg, #8a2be2, #4a00e0);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        z-index: 1;
        top: 0;
      `
    }
