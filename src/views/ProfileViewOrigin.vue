<script setup>

const profile = {
  name: "Fudzer M Huda",
  location: "East Java, Indonesia",
  tldr: "linux enthusiast and 3D modeling warrior/survival, mainly use Blender and Inkscape as creative work",
  stories: [
    `my journey begin when internet cafe rise in my regional place, then online
    gaming came, but I'm not so interesting compared to my friend about online
    gaming, instead my curiosity spark of fast knowledge internet exploration.`,
    `social media exist, redefining how we socialize. we found meme culture as
early creative pursuit,
    then time comes into high school, I pick TKJ (Teknik Komputer dan Jaringan)
    a.k.a Computer Technician and Networking. in the school we start learning basics
    multimedia, computer troubleshoot, simple coding (borland) and web. in this
    time also Android rise with internet access become better (at that time 3G
      and few year become 4G), you know what I do? changing my Android ROM
    (operating system) to custom OS. my journey never stop beside my primary
    skills of computer in the school.`
  ],
  socialMedia: [
    { link: "https://github.com/naranyala", label: "Github" },
    { link: "https://x.com/gema_naranyala", label: "Twitter" },
    { link: "https://id.quora.com/profile/Fudzer-M-Huda", label: "Quora" },
  ]
}

</script>

<template>
  <main>
    <img src="../assets/img/hari-libur-masa-kuliah.jpg" width="240">
    <p>
      my name is <a :href="`https://google.com/search?q=${profile.name}`">{{
        profile.name }}</a> born and grew in <a
        :href="`https://google.com/search?q=${profile.location}`">{{ profile.location }}.</a>
    </p>
    <p>
    <div v-for="story in profile.stories">
      {{story}}
    </div>
    </p>

    <p id="media-buttons">
      you can connect with me in some place: <br/>
      <a v-for="media in profile.socialMedia"
        :href="media.link" target="_blank">
        {{media.label}}

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6 6v2h8.59L5 17.59L6.41 19L16 9.41V18h2V6z"/></svg>
      </a>  
    </p>
  </main>
</template>

<style>

main {
  padding: 0 200px;
}

p{ padding: 20px 0; }
p div { padding: 10px 0; }

#media-buttons {
  display: flex;
  flex-direction: column;

  a {
    border: 1px solid gray;
    padding: 5px;
    border-radius: 0px;
    margin: 5px;
    text-align: center;
    justify-content: center;    /* Center horizontally */
    align-items: center; 

    svg { width: 20px; margin-left: 0px; margin-bottom: -5px; } 
  }

  /* a {  */
  /*   margin: 0;  */
  /*   padding: auto 20px; */
  /*   border-radius: 10px; */
  /*   width: 200px; */
  /*   text-align: center; */
  /*   &:hover { text-decoration: underline; } */
  /* } */
}
</style>
