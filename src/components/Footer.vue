<template>
	<footer class="bg-dark/80 backdrop-blur-md py-8 px-6 border-t border-primary/20 mt-auto">
		<div class="max-w-6xl mx-auto">
			<div class="flex flex-col md:flex-row justify-between items-center">
				<div class="flex items-center gap-2 mb-4 md:mb-0">
					<i class="fa fa-ethereum text-accent"></i>
					<span class="font-bold">EthAccountManager</span>
				</div>
				<div class="flex gap-6">
					<a href="#" class="text-gray-400 hover:text-accent transition-colors">
						<i class="fa fa-github text-xl"></i>
					</a>
					<a href="#" class="text-gray-400 hover:text-accent transition-colors">
						<i class="fa fa-twitter text-xl"></i>
					</a>
					<a href="#" class="text-gray-400 hover:text-accent transition-colors">
						<i class="fa fa-discord text-xl"></i>
					</a>
				</div>
			</div>
			<div class="mt-6 text-center text-gray-500 text-sm">&copy; 2023 EthAccountManager. 所有账户数据均在本地处理，不会上传至服务器。</div>
		</div>
	</footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>
