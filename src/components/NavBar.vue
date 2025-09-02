<template>
	<nav class="bg-dark/80 backdrop-blur-md py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50 border-b border-primary/20">
		<div class="flex items-center gap-2">
			<i class="fa fa-ethereum text-accent text-2xl"></i>
			<span class="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> EthAccountManager </span>
		</div>
		<div class="hidden md:flex items-center gap-8">
			<a href="#" class="hover:text-accent transition-colors">首页</a>
			<a href="#" class="hover:text-accent transition-colors">账户</a>
			<a href="#" class="hover:text-accent transition-colors">交易</a>
			<a href="#" class="hover:text-accent transition-colors">帮助</a>
		</div>
		<button @click="$emit('toggle-mobile-menu')" class="md:hidden text-2xl">
			<i class="fa fa-bars"></i>
		</button>
	</nav>
</template>

<script>
export default {
  name: 'NavBar',
  emits: ['toggle-mobile-menu']
}
</script>
