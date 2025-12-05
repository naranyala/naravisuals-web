import { defineComponent, ref, nextTick } from 'vue';
import { css } from 'goober';
import { animate } from 'motion';

const styles = {
    container: css`
        max-width: 700px;
        margin: 3rem auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 0 1.5rem;
    `,
    title: css`
        font-size: 2rem;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 2rem;
        letter-spacing: -0.02em;
    `,
    section: css`
        margin-bottom: 1rem;
        border-radius: 16px;
        overflow: hidden;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 28px rgba(102, 126, 234, 0.25);
        }
    `,
    sectionInner: css`
        background: #ffffff;
        border-radius: 14px;
        overflow: hidden;
    `,
    sectionOpen: css`
        box-shadow: 0 12px 32px rgba(102, 126, 234, 0.3);
    `,
    header: css`
        padding: 1.5rem 1.75rem;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        cursor: pointer;
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: all 0.2s ease;

        &:hover {
            background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
        }
    `,
    headerOpen: css`
        background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
    `,
    headerTitle: css`
        font-size: 1.0625rem;
        font-weight: 600;
        color: #1e293b;
        margin: 0;
        transition: color 0.2s ease;
    `,
    headerTitleOpen: css`
        color: #6d28d9;
    `,
    content: css`
        overflow: hidden;
        background: #fafafa;
        font-size: 0.9375rem;
        line-height: 1.7;
        color: #475569;
        max-height: 0;
        padding: 0 1.75rem;
        border-top: 1px solid transparent;
    `,
    contentOpen: css`
        border-top-color: #e9d5ff;
    `,
    iconWrapper: css`
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `,
    iconWrapperOpen: css`
        transform: rotate(180deg);
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    `,
    icon: css`
        color: white;
        width: 18px;
        height: 18px;
    `,
};

export default defineComponent({
    name: 'Accordion',
    setup() {
        const sections = ref([
            {
                id: 1,
                title: 'Seamless Integration',
                content: 'Our platform integrates effortlessly with your existing workflow. Connect with popular tools and services in just a few clicks, ensuring a smooth transition and immediate productivity gains.',
                open: false,
                el: null,
            },
            {
                id: 2,
                title: 'Advanced Security Features',
                content: 'Enterprise-grade security with end-to-end encryption, multi-factor authentication, and compliance with industry standards. Your data is protected at every level with continuous monitoring and automatic threat detection.',
                open: false,
                el: null,
            },
            {
                id: 3,
                title: 'Real-time Collaboration',
                content: 'Work together seamlessly with your team in real-time. See changes as they happen, communicate instantly, and maintain version control automatically. Perfect for distributed teams across different time zones.',
                open: false,
                el: null,
            },
            {
                id: 4,
                title: 'Powerful Analytics Dashboard',
                content: 'Gain deep insights into your data with our intuitive analytics dashboard. Track key metrics, identify trends, and make data-driven decisions with customizable reports and visualizations that update in real-time.',
                open: false,
                el: null,
            },
        ]);

        const toggle = async (index) => {
            const section = sections.value[index];
            section.open = !section.open;

            await nextTick();

            if (section.el) {
                const height = section.el.scrollHeight * 2;
                animate(
                    section.el,
                    {
                        maxHeight: section.open ? `${height}px` : '0px',
                        padding: section.open ? '1.5rem 1.75rem' : '0 1.75rem',
                    },
                    {
                        duration: 0.4,
                        easing: [0.4, 0, 0.2, 1],
                    }
                );
            }
        };

        return () => (
            <div class={styles.container}>
                <h1 class={styles.title}>Why Choose Us?</h1>
                {sections.value.map((section, i) => (
                    <div
                        key={section.id}
                        class={`${styles.section} ${section.open ? styles.sectionOpen : ''}`}
                    >
                        <div class={styles.sectionInner}>
                            <div
                                class={`${styles.header} ${section.open ? styles.headerOpen : ''}`}
                                onClick={() => toggle(i)}
                            >
                                <h3 class={`${styles.headerTitle} ${section.open ? styles.headerTitleOpen : ''}`}>
                                    {section.title}
                                </h3>
                                <div class={`${styles.iconWrapper} ${section.open ? styles.iconWrapperOpen : ''}`}>
                                    <svg
                                        class={styles.icon}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="3"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>
                            </div>
                            <div
                                ref={(el) => (section.el = el)}
                                class={`${styles.content} ${section.open ? styles.contentOpen : ''}`}
                            >
                                {section.content}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    },
});
