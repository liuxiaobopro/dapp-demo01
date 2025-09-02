<template>
	<div class="bg-dark/30 rounded-xl p-8 border border-primary/10 text-center">
		<div class="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
			<i class="fa fa-ethereum text-primary text-2xl"></i>
		</div>
		<h3 class="text-xl font-semibold mb-3">未检测到MetaMask连接</h3>
		<p class="text-gray-400 mb-6 max-w-md mx-auto">请点击上方的"连接钱包"按钮，授权访问你的MetaMask账户以查看详细信息</p>
		<div class="flex flex-col sm:flex-row justify-center gap-4 max-w-xs mx-auto">
			<a
				href="https://metamask.io/download/"
				target="_blank"
				class="flex-1 bg-white text-dark py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
			>
				<i class="fa fa-download"></i>
				<span>下载MetaMask</span>
			</a>
			<button
				@click="showGuide"
				class="flex-1 bg-transparent border border-primary/50 text-primary py-3 px-6 rounded-lg font-medium hover:bg-primary/10 transition-colors"
			>
				查看教程
			</button>
		</div>
	</div>
</template>

<script>
export default {
  name: 'NoConnectionPrompt',
  methods: {
    showGuide() {
      // 实际应用中可以显示一个详细的使用指南模态框
      this.$emit('show-guide')
    }
  },
  emits: ['show-guide']
}
</script>
