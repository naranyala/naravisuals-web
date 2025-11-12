<script setup>
import DisplayTwitterTweets from "./reusables/DisplayTwittetTweets.vue"
import OnlineMarkdownReader from "./reusables/OnlineMarkdownReader.vue"

import { ref } from 'vue';


const articleSources = ref([
  {
    title: 'modular-dotfiles README',
    url: 'https://raw.githubusercontent.com/naranyala/modular-dotfiles/refs/heads/main/README.md'
  },
  {
    title: 'naravisuals-web README',
    url: 'https://raw.githubusercontent.com/naranyala/naravisuals-web/refs/heads/main/README.md'
  },
  {
    title: "sample article",
    url: "https://raw.githubusercontent.com/naranyala/naravisuals-web/refs/heads/main/src/articles/01-02-system-computer.md"
  }, {
    title: "mindset rewind",
    url: "https://raw.githubusercontent.com/naranyala/naravisuals-web/refs/heads/main/src/articles/00-00-mindset-rewind.md"
  }
])

// const tweetUrls = ref([
//   "https://x.com/gema_naranyala/status/1847247187547500701",
//   "https://x.com/gema_naranyala/status/1855420347409211571",
//   "https://x.com/gema_naranyala/status/1855457345280573561",
//   "https://x.com/gema_naranyala/status/1860904088356983213",
//   "https://x.com/gema_naranyala/status/1870797021202063848",
//   "https://x.com/gema_naranyala/status/1899981156764049874",
//   "https://x.com/gema_naranyala/status/1921514843707773254",
// ]);

</script>

<template>
  <OnlineMarkdownReader :sources="articleSources"/>

<!--   <DisplayTwitterTweets -->
<!-- v-for="url in tweetUrls"  -->
<!--       :key="url"  -->
<!--       :tweetUrl="url" -->
<!--   /> -->
</template>
