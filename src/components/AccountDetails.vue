<template>
	<div class="bg-dark/50 rounded-xl p-6 md:p-8 border border-primary/20">
		<h2 class="text-xl font-semibold mb-6"><i class="fa fa-info-circle text-primary mr-2"></i>账户详情</h2>

		<div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-700/50">
			<div>
				<div class="flex items-center gap-2 mb-2">
					<span class="font-semibold">{{ account.name || `账户 ${account.index + 1}` }}</span>
					<span class="bg-success/20 text-success text-xs px-2 py-0.5 rounded-full">当前选中</span>
				</div>
				<div class="font-mono text-sm bg-dark px-3 py-1.5 rounded-lg w-full md:w-auto">
					{{ account.address }}
				</div>
			</div>
			<div class="mt-4 md:mt-0 flex gap-3">
				<button
					@click="$emit('copy-address')"
					class="bg-dark hover:bg-dark/70 transition-colors px-4 py-2 rounded-lg text-sm flex items-center gap-1 border border-gray-700"
				>
					<i class="fa fa-copy"></i>
					<span>复制地址</span>
				</button>
				<button
					@click="$emit('view-on-etherscan')"
					class="bg-primary/20 hover:bg-primary/30 text-primary transition-colors px-4 py-2 rounded-lg text-sm flex items-center gap-1"
				>
					<i class="fa fa-external-link"></i>
					<span>查看详情</span>
				</button>
				<button
					@click="$emit('open-transfer')"
					class="bg-success/20 hover:bg-success/30 text-success transition-colors px-4 py-2 rounded-lg text-sm flex items-center gap-1"
				>
					<i class="fa fa-send"></i>
					<span>转账</span>
				</button>
				<button
					@click="toggleHistory"
					class="bg-primary/20 hover:bg-primary/30 text-primary transition-colors px-4 py-2 rounded-lg text-sm flex items-center gap-1"
				>
					<i class="fa fa-history"></i>
					<span>历史</span>
				</button>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<div class="bg-dark p-5 rounded-lg border border-gray-700/50">
				<div class="text-gray-400 text-sm mb-1">账户余额</div>
				<div class="flex items-baseline">
					<span class="text-2xl font-semibold">{{ account.balance }}</span>
					<span class="ml-1 text-gray-400">ETH</span>
				</div>
				<div class="text-gray-400 text-sm mt-1">≈ ¥{{ fiatValue }} (以 ¥{{ ethPrice }} / ETH 计算)</div>
			</div>

			<div class="bg-dark p-5 rounded-lg border border-gray-700/50">
				<div class="text-gray-400 text-sm mb-1">交易次数</div>
				<div class="text-2xl font-semibold">{{ account.transactionCount || '-' }}</div>
				<div class="text-gray-400 text-sm mt-1">在当前网络上</div>
			</div>

			<div class="bg-dark p-5 rounded-lg border border-gray-700/50">
				<div class="text-gray-400 text-sm mb-1">账户状态</div>
				<div class="text-2xl font-semibold text-success">活跃</div>
				<div class="text-gray-400 text-sm mt-1">最后活动: 未知</div>
			</div>
		</div>

		<div class="bg-dark/50 p-5 rounded-lg border border-gray-700/50">
			<h3 class="font-medium mb-4">地址详情</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
				<div>
					<span class="text-gray-400">校验和地址:</span>
					<div class="font-mono bg-dark/70 px-2 py-1 rounded mt-1 overflow-x-auto">{{ account.address }}</div>
				</div>
				<div>
					<span class="text-gray-400">地址类型:</span>
					<div class="font-medium mt-1">外部账户 (EOA)</div>
				</div>
				<div>
					<span class="text-gray-400">是否合约:</span>
					<div class="font-medium mt-1">否</div>
				</div>
				<div>
					<span class="text-gray-400">创建时间:</span>
					<div class="font-medium mt-1">未知</div>
				</div>
			</div>
		</div>

		<!-- 转账历史记录 -->
		<div v-if="showHistory" class="mt-8">
			<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
				<i class="fa fa-history text-primary"></i>
				<span>转账历史</span>
			</h3>
			<div v-if="transferHistory.length > 0" class="space-y-3">
				<div v-for="item in transferHistory" :key="item.id" class="bg-dark/50 p-4 rounded-lg border border-gray-700/50">
					<div class="flex justify-between items-start">
						<div class="flex items-center gap-3">
							<div
								:class="[
                'w-10 h-10 rounded-full flex items-center justify-center',
                item.from.toLowerCase() === account.address.toLowerCase() 
                  ? 'bg-danger/20' 
                  : 'bg-success/20'
              ]"
							>
								<i
									:class="[
                  'fa',
                  item.from.toLowerCase() === account.address.toLowerCase() 
                    ? 'fa-arrow-up text-danger' 
                    : 'fa-arrow-down text-success'
                ]"
								></i>
							</div>
							<div>
								<div class="font-medium">
									{{ item.from.toLowerCase() === account.address.toLowerCase() ? '发送' : '接收' }}
									{{ parseFloat(item.amount).toFixed(6) }} ETH
								</div>
								<div class="text-sm text-gray-400 font-mono">
									{{ formatAddress(item.from.toLowerCase() === account.address.toLowerCase() ? item.to : item.from) }}
								</div>
								<div class="text-xs text-gray-500">
									{{ new Date(item.timestamp).toLocaleString() }}
								</div>
							</div>
						</div>
						<div class="text-right">
							<div class="text-xs text-gray-400 mb-1">状态</div>
							<div
								:class="[
                'text-sm',
                item.status === 'success' ? 'text-success' : 
                item.status === 'failed' ? 'text-danger' : 'text-warning'
              ]"
							>
								{{ item.status === 'success' ? '成功' : item.status === 'failed' ? '失败' : '处理中' }}
							</div>
							<button @click="viewTransactionOnEtherscan(item.txHash)" class="text-xs text-primary hover:text-accent mt-1">查看交易</button>
						</div>
					</div>
				</div>
			</div>
			<div v-else class="text-center text-gray-400 py-8">
				<i class="fa fa-inbox text-4xl mb-4"></i>
				<p>暂无转账记录</p>
			</div>
		</div>
	</div>
</template>

<script>
export default {
  name: 'AccountDetails',
  props: {
    account: {
      type: Object,
      default: () => ({})
    },
    currentChainId: {
      type: String,
      default: ''
    },
    transferHistory: {
      type: Array,
      default: () => []
    }
  },
  emits: ['copy-address', 'view-on-etherscan', 'open-transfer', 'toggle-history'],
  data() {
    return {
      showHistory: false,
      ethPrice: 1800 // 假设ETH价格
    }
  },
  computed: {
    fiatValue() {
      const balance = parseFloat(this.account.balance || 0)
      return (balance * this.ethPrice).toFixed(2)
    }
  },
  methods: {
    formatAddress(address) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    },
    viewTransactionOnEtherscan(txHash) {
      const etherscanUrls = {
        '0x1': 'https://etherscan.io',
        '0x3': 'https://ropsten.etherscan.io',
        '0x4': 'https://rinkeby.etherscan.io',
        '0x5': 'https://goerli.etherscan.io',
        '0x2a': 'https://kovan.etherscan.io',
        '0x89': 'https://polygonscan.com',
        '0xa86a': 'https://snowtrace.io'
      }
      const etherscanUrl = etherscanUrls[this.currentChainId] || 'https://etherscan.io'
      window.open(`${etherscanUrl}/tx/${txHash}`, '_blank')
    },
    toggleHistory() {
      this.showHistory = !this.showHistory
    }
  },
  watch: {
    // 监听toggle-history事件
    '$attrs': {
      handler() {
        // 当父组件触发toggle-history时，切换显示状态
      }
    }
  }
}
</script>
