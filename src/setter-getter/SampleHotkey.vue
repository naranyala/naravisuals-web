<script setup>
useHotkey('ctrl+k', () => searchInput.value?.focus())
useHotkey('meta+shift+d', () => toggleDark())
</script>
