<template>
	<div class="bg-dark/95 backdrop-blur-md fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 text-xl">
		<button @click="$emit('close')" class="absolute top-6 right-6 text-2xl">
			<i class="fa fa-times"></i>
		</button>
		<a href="#" class="hover:text-accent transition-colors">首页</a>
		<a href="#" class="hover:text-accent transition-colors">账户</a>
		<a href="#" class="hover:text-accent transition-colors">交易</a>
		<a href="#" class="hover:text-accent transition-colors">帮助</a>
	</div>
</template>

<script>
export default {
  name: 'MobileMenu',
  emits: ['close']
}
</script>
