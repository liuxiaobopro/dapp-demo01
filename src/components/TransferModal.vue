<template>
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-dark rounded-xl border border-primary/20 w-full max-w-md">
			<!-- 模态框头部 -->
			<div class="flex justify-between items-center p-6 border-b border-gray-700/50">
				<h3 class="text-xl font-semibold flex items-center gap-2">
					<i class="fa fa-send text-success"></i>
					<span>发送ETH</span>
				</h3>
				<button @click="$emit('close')" class="text-gray-400 hover:text-white transition-colors">
					<i class="fa fa-times text-xl"></i>
				</button>
			</div>

			<!-- 模态框内容 -->
			<div class="p-6">
				<form @submit.prevent="handleSubmit">
					<!-- 发送方信息 -->
					<div class="mb-6">
						<label class="block text-sm text-gray-400 mb-2">发送方</label>
						<div class="bg-dark/50 p-3 rounded-lg border border-gray-700/50">
							<div class="flex items-center gap-2">
								<div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
									<span class="text-xs font-bold">{{ sender.address.slice(2, 4).toUpperCase() }}</span>
								</div>
								<div>
									<div class="font-medium">{{ sender.name || `账户 ${sender.index + 1}` }}</div>
									<div class="text-sm text-gray-400 font-mono">{{ sender.address }}</div>
								</div>
							</div>
							<div class="mt-2 text-sm text-gray-400">
								余额: <span class="text-white font-medium">{{ sender.balance }}</span> ETH
							</div>
						</div>
					</div>

					<!-- 接收方地址 -->
					<div class="mb-4">
						<label for="recipientAddress" class="block text-sm text-gray-400 mb-2">接收方地址</label>
						<input
							v-model="form.recipientAddress"
							type="text"
							id="recipientAddress"
							placeholder="0x..."
							class="w-full bg-dark/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary/60 focus:outline-none transition-colors"
						/>
						<div v-if="errors.recipientAddress" class="text-danger text-sm mt-1">
							{{ errors.recipientAddress }}
						</div>
					</div>

					<!-- 转账金额 -->
					<div class="mb-4">
						<label for="transferAmount" class="block text-sm text-gray-400 mb-2">转账金额 (ETH)</label>
						<div class="relative">
							<input
								v-model="form.amount"
								type="number"
								id="transferAmount"
								step="0.000001"
								min="0"
								placeholder="0.0"
								class="w-full bg-dark/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary/60 focus:outline-none transition-colors"
							/>
							<button
								type="button"
								@click="setMaxAmount"
								class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary/20 text-primary px-3 py-1 rounded text-sm hover:bg-primary/30 transition-colors"
							>
								最大
							</button>
						</div>
						<div v-if="errors.amount" class="text-danger text-sm mt-1">
							{{ errors.amount }}
						</div>
					</div>

					<!-- Gas费用估算 -->
					<div class="mb-6">
						<div class="bg-dark/30 p-3 rounded-lg border border-gray-700/30">
							<div class="flex justify-between items-center text-sm">
								<span class="text-gray-400">预估Gas费用:</span>
								<span class="text-white">{{ gasEstimate.totalCost || '计算中...' }}</span>
							</div>
							<div class="flex justify-between items-center text-sm mt-1">
								<span class="text-gray-400">总费用:</span>
								<span class="text-white font-medium">{{ totalCost || '-' }}</span>
							</div>
						</div>
					</div>

					<!-- 操作按钮 -->
					<div class="flex gap-3">
						<button type="button" @click="$emit('close')" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors">
							取消
						</button>
						<button
							type="submit"
							:disabled="isSubmitting"
							class="flex-1 bg-success hover:bg-success/80 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
						>
							<i v-if="isSubmitting" class="fa fa-spinner fa-spin"></i>
							<i v-else class="fa fa-send"></i>
							<span>{{ isSubmitting ? '处理中...' : '确认转账' }}</span>
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script>
export default {
  name: 'TransferModal',
  props: {
    sender: {
      type: Object,
      default: () => ({})
    },
    currentChainId: {
      type: String,
      default: ''
    }
  },
  emits: ['close', 'transfer'],
  data() {
    return {
      form: {
        recipientAddress: '',
        amount: ''
      },
      errors: {
        recipientAddress: '',
        amount: ''
      },
      gasEstimate: {
        totalCost: ''
      },
      isSubmitting: false
    }
  },
  computed: {
    totalCost() {
      if (!this.gasEstimate.totalCost || !this.form.amount) return '-'
      const amount = parseFloat(this.form.amount)
      const gasCost = parseFloat(this.gasEstimate.totalCost)
      return (amount + gasCost).toFixed(6) + ' ETH'
    }
  },
  watch: {
    'form.recipientAddress'() {
      this.validateForm()
      this.updateGasEstimate()
    },
    'form.amount'() {
      this.validateForm()
      this.updateGasEstimate()
    }
  },
  methods: {
    validateForm() {
      this.errors = { recipientAddress: '', amount: '' }

      // 验证接收方地址
      if (!this.form.recipientAddress) {
        this.errors.recipientAddress = '请输入接收方地址'
      } else if (!this.isValidAddress(this.form.recipientAddress)) {
        this.errors.recipientAddress = '请输入有效的以太坊地址'
      } else if (this.form.recipientAddress.toLowerCase() === this.sender.address.toLowerCase()) {
        this.errors.recipientAddress = '不能向自己转账'
      }

      // 验证转账金额
      const amount = parseFloat(this.form.amount)
      const balance = parseFloat(this.sender.balance)

      if (!this.form.amount || isNaN(amount) || amount <= 0) {
        this.errors.amount = '请输入有效的转账金额'
      } else if (amount > balance) {
        this.errors.amount = '余额不足'
      }
    },
    isValidAddress(address) {
      return /^0x[a-fA-F0-9]{40}$/.test(address)
    },
    setMaxAmount() {
      const balance = parseFloat(this.sender.balance)
      // 预留一些ETH作为Gas费用
      const maxAmount = Math.max(0, balance - 0.01)
      this.form.amount = maxAmount.toFixed(6)
    },
    async updateGasEstimate() {
      if (!this.form.recipientAddress || !this.form.amount || !this.isValidAddress(this.form.recipientAddress)) {
        this.gasEstimate.totalCost = '计算中...'
        return
      }

      try {
        // 这里应该调用实际的Gas估算API
        // 为了演示，使用固定值
        this.gasEstimate.totalCost = '0.001 ETH'
      } catch (error) {
        console.error('更新Gas估算失败:', error)
        this.gasEstimate.totalCost = '估算失败'
      }
    },
    async handleSubmit() {
      this.validateForm()

      if (this.errors.recipientAddress || this.errors.amount) {
        return
      }

      this.isSubmitting = true

      try {
        await this.$emit('transfer', {
          to: this.form.recipientAddress,
          amount: this.form.amount
        })
        this.$emit('close')
      } catch (error) {
        console.error('转账失败:', error)
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>
