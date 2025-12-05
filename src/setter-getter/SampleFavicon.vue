<script setup>
const [, setFavicon] = useFavicon()
setFavicon(isDark.value ? '/favicon-dark.png' : '/favicon-light.png')
</script>
