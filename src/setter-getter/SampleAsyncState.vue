<script setup>
const [{ data, loading }, { execute }] = useAsyncState(
  () => fetch('/api/user').then(r => r.json()),
  null
)

execute() // trigger on mount or button
</script>
