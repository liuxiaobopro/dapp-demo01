<template>
	<div
		:class="[
      'fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 z-50 max-w-sm',
      type === 'error' ? 'bg-danger/90 text-white' : 'bg-success/90 text-white'
    ]"
	>
		{{ message }}
	</div>
</template>

<script>
export default {
  name: 'Notification',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'success', // 'success' or 'error'
      validator: (value) => ['success', 'error'].includes(value)
    }
  },
  emits: ['close'],
  mounted() {
    // 3秒后自动关闭
    setTimeout(() => {
      this.$emit('close')
    }, 3000)
  }
}
</script>
