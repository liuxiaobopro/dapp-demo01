<template>
	<div class="bg-secondary font-inter text-white min-h-screen flex flex-col">
		<!-- 导航栏 -->
		<NavBar :is-mobile-menu-open="isMobileMenuOpen" @toggle-mobile-menu="toggleMobileMenu" />

		<!-- 移动端菜单 -->
		<MobileMenu v-if="isMobileMenuOpen" @close="closeMobileMenu" />

		<!-- 主内容区 -->
		<main class="flex-grow px-6 py-12 md:py-20">
			<div class="max-w-6xl w-full mx-auto">
				<!-- 头部区域 -->
				<div class="text-center mb-12 md:mb-16">
					<h1 class="text-[clamp(1.8rem,5vw,3rem)] font-bold mb-4 leading-tight">MetaMask <span class="text-glow text-accent">账户管理</span></h1>
					<p class="text-gray-300 text-lg max-w-2xl mx-auto">查看和管理你MetaMask钱包中的所有账户，获取详细的账户信息和余额数据</p>
				</div>

				<!-- 连接状态和控制区 -->
				<ConnectionPanel
					:is-connected="isConnected"
					:current-chain-id="currentChainId"
					:network-name="networkName"
					:rpc-url="rpcUrl"
					:is-polling-active="isPollingActive"
					@connect="connectWallet"
					@disconnect="disconnectWallet"
					@refresh="refreshAccounts"
					@debug="showDebugInfo"
				/>

				<!-- 账户列表区域 -->
				<AccountsSection v-if="isConnected && accounts.length > 0" :accounts="accounts" :selected-account="selectedAccount" @select-account="selectAccount" />

				<!-- 详细信息区域 -->
				<AccountDetails
					v-if="isConnected && selectedAccount"
					:account="selectedAccountData"
					:current-chain-id="currentChainId"
					:transfer-history="transferHistory"
					@copy-address="copyAddress"
					@view-on-etherscan="viewOnEtherscan"
					@open-transfer="openTransferModal"
					@toggle-history="toggleTransferHistory"
				/>

				<!-- 未连接状态提示 -->
				<NoConnectionPrompt v-if="!isConnected" />
			</div>
		</main>

		<!-- 转账模态框 -->
		<TransferModal
			v-if="showTransferModal"
			:sender="selectedAccountData"
			:current-chain-id="currentChainId"
			@close="closeTransferModal"
			@transfer="executeTransfer"
		/>

		<!-- 状态通知 -->
		<Notification v-if="notification.show" :message="notification.message" :type="notification.type" @close="hideNotification" />

		<!-- 页脚 -->
		<Footer />
	</div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import NavBar from './components/NavBar.vue'
import MobileMenu from './components/MobileMenu.vue'
import ConnectionPanel from './components/ConnectionPanel.vue'
import AccountsSection from './components/AccountsSection.vue'
import AccountDetails from './components/AccountDetails.vue'
import NoConnectionPrompt from './components/NoConnectionPrompt.vue'
import TransferModal from './components/TransferModal.vue'
import Notification from './components/Notification.vue'
import Footer from './components/Footer.vue'
import { useMetaMask } from './composables/useMetaMask'
import { useNotification } from './composables/useNotification'

export default {
  name: 'App',
  components: {
    NavBar,
    MobileMenu,
    ConnectionPanel,
    AccountsSection,
    AccountDetails,
    NoConnectionPrompt,
    TransferModal,
    Footer,
    Notification
  },
  setup() {
    const isMobileMenuOpen = ref(false)
    const showTransferModal = ref(false)

    const {
      isConnected,
      accounts,
      selectedAccount,
      selectedAccountData,
      currentChainId,
      networkName,
      rpcUrl,
      isPollingActive,
      transferHistory,
      connectWallet,
      disconnectWallet,
      refreshAccounts,
      selectAccount,
      copyAddress,
      viewOnEtherscan,
      openTransferModal: openTransferModalFunc,
      closeTransferModal: closeTransferModalFunc,
      executeTransfer,
      toggleTransferHistory,
      showDebugInfo,
      loadTransferHistory,
      loadAllAccounts
    } = useMetaMask()

    // 检查MetaMask是否安装
    const checkMetaMask = () => {
      return typeof window.ethereum !== 'undefined'
    }

    const { notification, showNotification, hideNotification } = useNotification()

    const openTransferModal = () => {
      showTransferModal.value = true
      openTransferModalFunc()
    }

    const closeTransferModal = () => {
      showTransferModal.value = false
      closeTransferModalFunc()
    }

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value
    }

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false
    }

        onMounted(async () => {
        loadTransferHistory()
        // 初始化MetaMask连接检查
        if (checkMetaMask()) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' })
                if (accounts && accounts.length > 0) {
                    console.log('发现已连接的账户，自动加载...')
                    await loadAllAccounts()
                }
            } catch (error) {
                console.error('初始化连接检查失败:', error)
            }
        }
    })

    onUnmounted(() => {
      // 清理资源
    })

    return {
      isMobileMenuOpen,
      showTransferModal,
      isConnected,
      accounts,
      selectedAccount,
      selectedAccountData,
      currentChainId,
      networkName,
      rpcUrl,
      isPollingActive,
      transferHistory,
      notification,
      connectWallet,
      disconnectWallet,
      refreshAccounts,
      selectAccount,
      copyAddress,
      viewOnEtherscan,
      openTransferModal,
      closeTransferModal,
      executeTransfer,
      toggleTransferHistory,
      showDebugInfo,
      toggleMobileMenu,
      closeMobileMenu,
      hideNotification
    }
  }
}
</script>
