<template>
	<div class="mb-12">
		<div class="flex justify-between items-center mb-6">
			<h2 class="text-xl font-semibold"><i class="fa fa-users text-primary mr-2"></i>账户列表</h2>
			<span class="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm"> {{ accounts.length }} 个账户 </span>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div
				v-for="account in accounts"
				:key="account.address"
				@click="selectAccount(account.address)"
				:class="[
          'bg-dark p-6 rounded-xl border card-hover cursor-pointer',
          selectedAccount === account.address 
            ? 'border-accent pulse-animation' 
            : 'border-gray-700/50'
        ]"
			>
				<div class="flex justify-between items-start mb-4">
					<div class="flex items-center gap-2">
						<div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
							<span class="font-bold">{{ account.address.slice(2, 4) }}</span>
						</div>
						<div>
							<div class="font-medium">{{ account.name || `账户 ${accounts.indexOf(account) + 1}` }}</div>
							<div class="text-sm text-gray-400 font-mono">{{ formatAddress(account.address) }}</div>
						</div>
					</div>
					<div v-if="selectedAccount === account.address" class="bg-accent/20 text-accent text-xs px-2 py-1 rounded-full">当前</div>
				</div>
				<div class="mb-4">
					<div class="text-sm text-gray-400 mb-1">余额</div>
					<div class="flex items-baseline">
						<div class="font-semibold">{{ account.balance }}</div>
						<div class="ml-1 text-sm text-gray-400">ETH</div>
					</div>
				</div>
				<button
					@click.stop="selectAccount(account.address)"
					:class="[
            'w-full py-2.5 rounded-lg border transition-all text-sm font-medium',
            selectedAccount === account.address 
              ? 'border-accent bg-accent/10 text-accent' 
              : 'border-gray-700 hover:border-primary/60'
          ]"
				>
					{{ selectedAccount === account.address ? '已选中' : '选择此账户' }}
				</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
  name: 'AccountsSection',
  props: {
    accounts: {
      type: Array,
      default: () => []
    },
    selectedAccount: {
      type: String,
      default: ''
    }
  },
  emits: ['select-account'],
  methods: {
    formatAddress(address) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    },
    selectAccount(address) {
      this.$emit('select-account', address)
    }
  }
}
</script>
