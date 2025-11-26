<script setup>

import ScrollIndicator from "../ScrollIndicator.vue"
import MottonCollection from "../MottoCollection.vue"
// import CurrentCalendar from "../views/widgets/CurrentCalendar.vue"
import SearchBar from "../SearchBar.vue"
import PhoneKeypad from "../PhoneKeypad.vue"
// import PrintAction from "../views/reusables/PrintAction.vue"
// import FloatingAction from "../FloatingAction.vue"
// import ProfileHeader from "../ProfileHeader.vue"
import RepoSearch from "../RepoSearch.vue"
import ReferenceSearch from "../ReferenceSearch.vue"

import RandomWordSystem from "../RandomWordSystem.vue"
import RandomWordTerms from "../RandomWordTerms.vue"
import RandomWordHeaders from "../RandomWordHeaders.vue"
import MapPicker from "../MapPicker.vue"

</script>

<template>
  <h1>CODING AS HOBBY</h1>


       <div style="margin: auto; width: 500px; height: auto;">
          <MapPicker/>
      </div>
      <!-- <CurrentCalendar  -->
      <!--  style="margin: 40px auto; width: 100%;"/> -->
      
      <RandomWordSystem/>
      <RandomWordTerms/>
      <RandomWordHeaders/>

      <SearchBar/>
      <RepoSearch/>
      <ReferenceSearch/>

      <MottonCollection/>
      <ScrollIndicator/>
</template>
