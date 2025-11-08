<template>
  <div class="offerings-container">
    <h2 class="section-title">Our Offerings</h2>

    <div class="offerings-grid">
      <div
        v-for="(item, index) in offerings"
        :key="index"
        class="offering-card"
      >
        <h3 class="offering-title">{{ item.title }}</h3>
        <p class="offering-type">{{ item.type }}</p>
        <p class="offering-description">{{ item.description }}</p>
        <p class="offering-price" v-if="item.price">
          {{ formatPrice(item.price) }}
        </p>
        <button class="cta-button">Learn More</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Offerings",
  data() {
    return {
      offerings: [
        {
          title: "Premium Laptop",
          type: "Product",
          description: "A high-performance laptop designed for professionals and creators.",
          price: 1299,
        },
        {
          title: "Web Development Service",
          type: "Service",
          description: "Custom websites built with modern frameworks and responsive design.",
          price: 2500,
        },
        {
          title: "Cloud Hosting",
          type: "Service",
          description: "Reliable, scalable hosting solutions with 24/7 support.",
          price: 99,
        },
        {
          title: "Noise-Cancelling Headphones",
          type: "Product",
          description: "Immersive sound experience with active noise cancellation.",
          price: 299,
        },
      ],
    };
  },
  methods: {
    formatPrice(value) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    },
  },
};
</script>

<style scoped>
.offerings-container {
  background-color: #121212; /* dark theme */
  color: #ffffff;
  padding: 2rem;
}

.section-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.offerings-grid {
  display: flex;          /* use flex instead of grid */
  flex-direction: column; /* stack items vertically */
  gap: 1.5rem;            /* spacing between items */
}

.offering-card {
  width: 100%;            /* make each card full width */
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  transition: transform 0.2s;
}

.offering-card:hover {
  transform: translateY(-4px);
}

.offering-title {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.offering-type {
  font-size: 0.9rem;
  color: #aaaaaa;
  margin-bottom: 1rem;
}

.offering-description {
  font-size: 1rem;
  margin-bottom: 1rem;
}

.offering-price {
  font-weight: bold;
  color: #42b983; /* Vue green accent */
  margin-bottom: 1rem;
}

.cta-button {
  background-color: #42b983;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.cta-button:hover {
  background-color: #63d297;
}
</style>

