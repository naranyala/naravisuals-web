<script setup>
const [{ values, errors, isValid }, { setField, touch }] = useFormValidation(
  { email: '', password: '' },
  {
    email: [
      v => v.includes('@') || 'Invalid email',
      v => v.length > 5 || 'Too short'
    ],
    password: [v => v.length >= 6 || 'Min 6 characters']
  }
)
</script>
