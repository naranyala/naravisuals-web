<template>
  <div class="word-cloud-container">
    <div class="word-cloud">
      <div
        v-for="(word, index) in positionedWords"
        :key="index"
        class="word-wrapper"
        :style="getWordWrapperStyle(word)"
      >
        <span
          class="word"
          :class="word.sizeClass"
          :style="getWordStyle(word)"
          @click="handleWordClick(word.text)"
        >
          {{ word.text }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClassicWordCloud',
  props: {
    words: {
      type: Array,
      default: () => [
        'knowledge', 'learning', 'education', 'student', 'school', 'teacher', 
        'development', 'comprehension', 'wisdom', 'value', 'proficiency', 
        'motivation', 'awareness', 'consciousness', 'theory', 'principles', 
        'acquaintance', 'philosophy', 'discipline', 'observation', 'graduate', 
        'curriculum', 'concept', 'erudition', 'expertise', 'experience', 
        'instruction', 'perception', 'ability', 'grasp', 'picture', 'lore', 
        'attainments', 'degree', 'tuition', 'career', 'university', 'idea', 
        'familiarity', 'genius', 'tolerance', 'insight', 'substance', 'apprehension', 
        'coaching', 'vision', 'dogma', 'scoop', 'potential', 'facts', 'semantics', 
        'discernment', 'academics', 'notion', 'reading', 'doctrine', 'science', 
        'sense', 'brilliance', 'global', 'attitude', 'attention', 'enlightenment'
      ]
    },
    smallSize: {
      type: String,
      default: '12px'
    },
    mediumSize: {
      type: String,
      default: '18px'
    },
    largeSize: {
      type: String,
      default: '26px'
    }
  },
  data() {
    return {
      positionedWords: [],
      containerWidth: 0,
      containerHeight: 0
    }
  },
  mounted() {
    this.initialize();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    initialize() {
      this.containerWidth = this.$el.clientWidth;
      this.containerHeight = this.$el.clientHeight;
      this.generateLayout();
    },
    
    generateLayout() {
      const wordsWithSize = this.getWordsWithSize();
      this.positionedWords = [];
      
      // Create grid positions to prevent overlaps
      const gridSize = 40; // Size of each grid cell
      const cols = Math.floor(this.containerWidth / gridSize);
      const rows = Math.floor(this.containerHeight / gridSize);
      const grid = Array(rows).fill().map(() => Array(cols).fill(false));
      
      // Place words in grid positions
      wordsWithSize.forEach((word, index) => {
        let placed = false;
        let attempts = 0;
        const maxAttempts = 100;
        
        while (!placed && attempts < maxAttempts) {
          // Random grid position
          const row = Math.floor(Math.random() * rows);
          const col = Math.floor(Math.random() * cols);
          
          // Check if grid cell is available
          if (!grid[row][col]) {
            // Mark surrounding cells as occupied
            for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
              for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
                grid[r][c] = true;
              }
            }
            
            // Calculate position with padding
            const x = col * gridSize + gridSize / 2;
            const y = row * gridSize + gridSize / 2;
            
            // Random rotation between -20 and 20 degrees
            const rotation = (Math.random() * 40) - 20;
            
            this.positionedWords.push({
              ...word,
              x,
              y,
              rotation
            });
            placed = true;
          }
          attempts++;
        }
        
        // Fallback: place randomly if no space found
        if (!placed) {
          const x = Math.random() * this.containerWidth;
          const y = Math.random() * this.containerHeight;
          const rotation = (Math.random() * 40) - 20;
          
          this.positionedWords.push({
            ...word,
            x,
            y,
            rotation
          });
        }
      });
    },
    
    getWordsWithSize() {
      // Create 3 distinct size groups based on position in array
      const sortedWords = [...this.words].sort(() => Math.random() - 0.5);
      
      return sortedWords.map((word, index) => {
        let sizeClass;
        if (index < Math.floor(sortedWords.length / 3)) {
          sizeClass = 'large';
        } else if (index < Math.floor(sortedWords.length * 2 / 3)) {
          sizeClass = 'medium';
        } else {
          sizeClass = 'small';
        }
        
        return {
          text: word,
          sizeClass
        };
      });
    },
    
    getWordWrapperStyle(word) {
      return {
        position: 'absolute',
        left: `${word.x}px`,
        top: `${word.y}px`,
        transform: `translate(-50%, -50%) rotate(${word.rotation}deg)`,
        transformOrigin: 'center center'
      };
    },
    
    getWordStyle(word) {
      const baseStyles = {
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '4px',
        userSelect: 'none',
        whiteSpace: 'nowrap'
      };
      
      // Add specific styles based on size class
      if (word.sizeClass === 'small') {
        baseStyles.fontSize = this.smallSize;
        baseStyles.color = '#6b7280';
        baseStyles.fontWeight = '300';
        baseStyles.opacity = '0.8';
      } else if (word.sizeClass === 'medium') {
        baseStyles.fontSize = this.mediumSize;
        baseStyles.color = '#4b5563';
        baseStyles.fontWeight = '500';
      } else { // large
        baseStyles.fontSize = this.largeSize;
        baseStyles.color = '#166534';
        baseStyles.fontWeight = '700';
        baseStyles.textShadow = '0 2px 4px rgba(0,0,0,0.2)';
      }
      
      return baseStyles;
    },
    
    handleWordClick(text) {
      this.$emit('word-click', text);
    },
    
    handleResize() {
      this.$nextTick(() => {
        this.containerWidth = this.$el.clientWidth;
        this.containerHeight = this.$el.clientHeight;
        this.generateLayout();
      });
    }
  }
}
</script>

<style scoped>
.word-cloud-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #ffffff;
  position: relative;
}

.word-cloud {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 40px;
  box-sizing: border-box;
}

.word-wrapper {
  position: absolute;
  transform-origin: center center;
  transition: transform 0.3s ease;
}

.word {
  padding: 6px 10px;
  border-radius: 6px;
  display: inline-block;
  line-height: 1.4;
  white-space: nowrap;
  user-select: none;
  transition: all 0.3s ease;
  text-align: center;
}

.word:hover {
  transform: scale(1.1) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  background: rgba(240, 240, 240, 0.5);
}

/* Size classes */
.word.small {
  font-size: v-bind(smallSize);
  color: #6b7280;
  font-weight: 300;
  opacity: 0.8;
}

.word.medium {
  font-size: v-bind(mediumSize);
  color: #4b5563;
  font-weight: 500;
}

.word.large {
  font-size: v-bind(largeSize);
  color: #166534;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
</style>
