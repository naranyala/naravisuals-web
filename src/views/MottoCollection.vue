<script setup>


const msg = {
  someMotto: [
    "acceptable yet agressive enabler;",
    "sophisticated compounding;",
    "mastering the industry, fulfill missing part of it;",
    "mutual yet equal treatment;",
    "is that relevant?",
    // "relevant, relevant, relevant;"
    "facilitate message-delivery;",
    "modular and bare-minimum;"
  ],
}

</script>

<template>
  <div class="motto-container">
    <h2 class="message">
      <div v-for="motto in msg.someMotto" :key="motto">
        {{ motto }}<br />
      </div>
    </h2>
  </div>
</template>

<style scoped>
.motto-container {
  border: 1px solid gray;
  border-radius: 20px;
  max-width:
    500px;
  margin: 60px auto 60px auto;
}

small,
h2 {
  text-align: center;
  font-style: italic;
  padding-bottom: 200px;
  background: rgba(0 0 0 0);
  text: white;
}

.message {
  padding-top: 200px;
  font-size: 21px;
}
</style>
