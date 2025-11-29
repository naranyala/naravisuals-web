<script setup>

import ScrollIndicator from "./reusables/ScrollIndicator.vue"
import SearchBar from "./reusables/SearchBar.vue"
import PhoneKeypad from "./reusables/PhoneKeypad.vue"

import RepoSearch from "./reusables/RepoSearch.vue"
import ReferenceSearch from "./reusables/ReferenceSearch.vue"

import RandomWordSystem from "./reusables/RandomWordSystem.vue"
import RandomWordTerms from "./reusables/RandomWordTerms.vue"
import RandomWordHeaders from "./reusables/RandomWordHeaders.vue"
import MapPicker from "./reusables/MapPicker.vue"

// import CurrentCalendar from "./reusables/views/widgets/CurrentCalendar.vue"
// import PrintAction from "./reusables/views/reusables/PrintAction.vue"
// import FloatingAction from "./reusables/FloatingAction.vue"
// import ProfileHeader from "./reusables/ProfileHeader.vue"


</script>

<template>
  <h1>CODING AS HOBBY</h1>


  <div style="margin: auto; width: 500px; height: auto;">
    <MapPicker />
  </div>
  <!-- <CurrentCalendar  -->
  <!--  style="margin: 40px auto; width: 100%;"/> -->

  <RandomWordSystem />
  <RandomWordTerms />
  <RandomWordHeaders />

  <SearchBar />
  <RepoSearch />
  <ReferenceSearch />

  <ScrollIndicator />
</template>
