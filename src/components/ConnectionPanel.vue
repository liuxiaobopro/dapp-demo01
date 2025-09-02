<template>
	<div class="bg-dark/50 rounded-xl p-6 md:p-8 border border-primary/20 mb-10">
		<div class="flex flex-col md:flex-row justify-between items-center gap-6">
			<div>
				<h2 class="text-xl font-semibold mb-2">连接状态</h2>
				<div class="flex items-center gap-2" :class="isConnected ? 'text-success' : 'text-warning'">
					<i :class="isConnected ? 'fa fa-check-circle' : 'fa fa-circle-o-notch fa-spin'"></i>
					<span>{{ isConnected ? '已连接到MetaMask' : '未连接到MetaMask' }}</span>
				</div>
			</div>
			<div class="flex gap-4 w-full md:w-auto">
				<button
					@click="isConnected ? $emit('disconnect') : $emit('connect')"
					class="flex-1 md:flex-none bg-gradient-eth py-3 px-8 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
				>
					<i :class="isConnected ? 'fa fa-sign-out' : 'fa fa-link'"></i>
					<span>{{ isConnected ? '断开连接' : '连接钱包' }}</span>
				</button>
				<button
					@click="$emit('refresh')"
					:disabled="!isConnected"
					class="flex-1 md:flex-none bg-dark py-3 px-6 rounded-lg font-medium border border-primary/30 hover:border-primary/60 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<i class="fa fa-refresh"></i>
					<span>刷新数据</span>
				</button>
				<button
					@click="$emit('debug')"
					:disabled="!isConnected"
					class="flex-1 md:flex-none bg-warning/20 text-warning py-3 px-6 rounded-lg font-medium border border-warning/30 hover:border-warning/60 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<i class="fa fa-bug"></i>
					<span>调试信息</span>
				</button>
			</div>
		</div>

		<!-- 网络信息 -->
		<div v-if="isConnected" class="mt-6 pt-6 border-t border-gray-700/50">
			<div class="flex flex-wrap gap-4 items-center">
				<div class="flex items-center gap-2">
					<span class="text-gray-400">当前网络:</span>
					<span class="font-medium">{{ networkName }}</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-gray-400">链ID:</span>
					<span class="font-mono bg-dark px-2 py-1 rounded">{{ currentChainId }}</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-gray-400">RPC URL:</span>
					<span class="font-mono text-sm bg-dark px-2 py-1 rounded truncate max-w-xs md:max-w-md">{{ rpcUrl }}</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-gray-400">实时监控:</span>
					<span class="text-sm">
						<i :class="isPollingActive ? 'fa fa-circle text-success pulse-animation' : 'fa fa-circle text-warning'"></i>
						<span>{{ isPollingActive ? '运行中' : '未启动' }}</span>
					</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
  name: 'ConnectionPanel',
  props: {
    isConnected: {
      type: Boolean,
      default: false
    },
    currentChainId: {
      type: String,
      default: ''
    },
    networkName: {
      type: String,
      default: ''
    },
    rpcUrl: {
      type: String,
      default: ''
    },
    isPollingActive: {
      type: Boolean,
      default: false
    }
  },
  emits: ['connect', 'disconnect', 'refresh', 'debug']
}
</script>
