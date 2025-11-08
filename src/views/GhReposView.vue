<script setup>
// Flat data source
const flatOfferings = [
  {
    title: "Premium Laptop",
    type: "Product",
    description: "A high-performance laptop designed for professionals and creators.",
    price: 1299,
    rating: 5, // Five Star
  },
  {
    title: "Web Development Service",
    type: "Service",
    description: "Custom websites built with modern frameworks and responsive design.",
    price: 2500,
    rating: 4.5, // Half Star Five Star
  },
  {
    title: "Cloud Hosting",
    type: "Service",
    description: "Reliable, scalable hosting solutions with 24/7 support.",
    price: 99,
    rating: 4, // One Star from Five
  },
  {
    title: "Noise-Cancelling Headphones",
    type: "Product",
    description: "Immersive sound experience with active noise cancellation.",
    price: 299,
    rating: 4.5, // Half Star Five Star
  },
];

// Grouping logic
const groupsMap = {
  5: {
    title: "⭐️⭐️⭐️⭐️⭐️ | Premium Tier (5.0)",
    items: [],
    class: 'group-five-star',
    color: '#42b983'
  },
  4.5: {
    title: "⭐️⭐️⭐️⭐️½ | Excellent Value (4.5)",
    items: [],
    class: 'group-half-star',
    color: '#00bcd4'
  },
  4: {
    title: "⭐️⭐️⭐️⭐️ | Solid Performance (4.0)",
    items: [],
    class: 'group-four-star',
    color: '#ffc107'
  }
};

// Populate groups
flatOfferings.forEach(item => {
    if (groupsMap[item.rating]) {
        groupsMap[item.rating].items.push(item);
    }
});

// Convert the map to a sorted array (5 -> 4.5 -> 4) and filter out empty groups
const sortedGroups = [groupsMap[5], groupsMap[4.5], groupsMap[4]].filter(g => g.items.length > 0);


// Methods defined as simple functions, automatically exposed to the template
const formatPrice = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

// Renders star icons based on the rating value
const renderStars = (rating) => {
  const fullStar = '★'; // Full star icon
  const emptyStar = '☆'; // Empty star icon
  const halfStar = '½'; // Placeholder for half star

  let stars = '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars += fullStar;
  }

  // Add half star
  if (hasHalfStar) {
    stars += halfStar;
  }

  // Add empty stars (to complete the 5-star total)
  const totalFilledSlots = fullStars + (hasHalfStar ? 1 : 0);
  const emptyStarsCount = 5 - totalFilledSlots;

  for (let i = 0; i < emptyStarsCount; i++) {
    stars += emptyStar;
  }

  return stars;
};
</script>

<template>
  <div class="offerings-container">
    <h2 class="section-title">Our Offerings</h2>

    <div class="offerings-grid-groups">
      <div v-for="(group, groupIndex) in sortedGroups" :key="group.rating" class="rating-group">
        <!-- Group Separator (The clear border the user asked for) -->
        <h3 
          class="group-separator" 
          :style="{ borderColor: group.color, color: group.color }"
        >
          {{ group.title }}
        </h3>
        
        <!-- Grid of Cards within this specific group -->
        <div class="group-cards">
          <div
            v-for="(item, itemIndex) in group.items"
            :key="itemIndex"
            class="offering-card"
            :class="group.class"
          >
            <h3 class="offering-title">{{ item.title }}</h3>
            
            <!-- Star Rating Display -->
            <div class="offering-rating">
              <span class="stars">{{ renderStars(item.rating) }}</span>
              <span class="rating-value">({{ item.rating }}/5)</span>
            </div>

            <p class="offering-type">{{ item.type }}</p>
            <p class="offering-description">{{ item.description }}</p>
            <p class="offering-price" v-if="item.price">
              {{ formatPrice(item.price) }}
            </p>
            <button class="cta-button">Learn More</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.offerings-container {
  background-color: #121212; /* dark theme */
  color: #ffffff;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
}

.section-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 700;
}

.offerings-grid-groups {
  max-width: 1200px;
  margin: 0 auto;
}

.group-cards {
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Responsive grid */
  gap: 1.5rem; 
  padding-bottom: 3rem; /* Padding at the bottom of the group */
}

/* Group Separator/Border Style */
.group-separator {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 3rem 0 2rem 0; /* Clear vertical space */
  padding-bottom: 0.5rem;
  
  /* The "Separation Border" */
  border-bottom: 4px solid; 
  letter-spacing: 1px;
  text-transform: uppercase;
}

.offering-card {
  background-color: #1e1e1e;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 6px 20px rgba(0,0,0,0.5);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 2px solid transparent; /* Base border */
}

.offering-card:hover {
  transform: translateY(-8px);
}

/* --- Individual Card Styles (Kept for visual distinction within groups) --- */

.group-five-star {
  border-color: #42b983; 
}
.group-five-star:hover {
  box-shadow: 0 10px 30px rgba(66, 185, 131, 0.8);
}

.group-half-star {
  border-color: #00bcd4; 
}
.group-half-star:hover {
  box-shadow: 0 10px 30px rgba(0, 188, 212, 0.6);
}

.group-four-star {
  border-color: #ffc107; 
}
.group-four-star:hover {
  box-shadow: 0 10px 30px rgba(255, 193, 7, 0.4);
}

/* --- General Card Content Styles --- */

.offering-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #42b983;
}

.offering-rating {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.stars {
  font-size: 1.5rem;
  color: #FFD700; 
  letter-spacing: 0.1rem; 
  margin-right: 0.5rem;
}

.rating-value {
  font-size: 0.9rem;
  color: #cccccc;
}

.offering-type {
  font-size: 0.9rem;
  color: #aaaaaa;
  margin-bottom: 1rem;
}

.offering-description {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  flex-grow: 1; 
}

.offering-price {
  font-weight: bold;
  font-size: 1.5rem;
  color: #42b983; 
  margin-bottom: 1.5rem;
}

.cta-button {
  background-color: #42b983;
  color: #1e1e1e;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 700;
  transition: background-color 0.3s, transform 0.1s;
  box-shadow: 0 4px 10px rgba(66, 185, 131, 0.4);
}

.cta-button:hover {
  background-color: #63d297;
  transform: translateY(-2px);
}

/* Mobile Responsiveness */
@media (max-width: 600px) {
  .offerings-container {
    padding: 1rem;
  }
  .section-title {
    font-size: 1.75rem;
  }
  .group-separator {
    font-size: 1.2rem;
    margin: 2rem 0 1.5rem 0;
  }
  .offering-card {
    padding: 1.25rem;
  }
}
</style>
