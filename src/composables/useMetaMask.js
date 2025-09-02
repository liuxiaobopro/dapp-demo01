import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotification } from './useNotification'

export function useMetaMask() {
    const { showNotification } = useNotification()

    // 响应式状态
    const isConnected = ref(false)
    const accounts = ref([])
    const selectedAccount = ref('')
    const currentChainId = ref('')
    const networkName = ref('')
    const rpcUrl = ref('')
    const isPollingActive = ref(false)
    const transferHistory = ref([])

    // 轮询相关
    let balancePollingInterval = null
    let lastKnownBalances = new Map()

    // 计算属性
    const selectedAccountData = computed(() => {
        return accounts.value.find(acc => acc.address === selectedAccount.value) || {}
    })

    // 检查MetaMask是否安装
    const checkMetaMask = () => {
        if (typeof window.ethereum === 'undefined') {
            showNotification('请安装MetaMask钱包插件', true)
            return false
        }
        return true
    }

    // 格式化地址
    const formatAddress = (address) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    // 格式化余额（从wei转换为ETH）
    const formatBalance = (balance) => {
        if (!balance) return '0.000000'

        try {
            console.log('格式化余额 - 输入:', balance, '类型:', typeof balance)

            // 将十六进制字符串转换为十进制数字
            const balanceWei = parseInt(balance, 16)
            // 转换为ETH（1 ETH = 10^18 wei）
            const ethBalance = balanceWei / Math.pow(10, 18)

            console.log('格式化余额 - 结果:', ethBalance.toFixed(6))
            return ethBalance.toFixed(6)
        } catch (error) {
            console.error('格式化余额失败:', error, '原始数据:', balance)
            return '0.000000'
        }
    }

    // 获取网络名称
    const getNetworkName = (chainId) => {
        const networks = {
            '0x1': '以太坊主网',
            '0x3': 'Ropsten测试网',
            '0x4': 'Rinkeby测试网',
            '0x5': 'Goerli测试网',
            '0x2a': 'Kovan测试网',
            '0x89': 'Polygon主网',
            '0x539': '本地测试网',
            '0x7a69': '本地测试网', // 31337 十进制
            '0x1a4': '本地测试网', // 420 十进制
            '0xa86a': 'Avalanche主网',
            '0x13881': 'Polygon Mumbai测试网',
            '0x38': 'BSC主网',
            '0x61': 'BSC测试网',
            '0x539': '本地测试网'
        }

        // 如果是本地网络（通常chainId很大或者是常见的本地网络ID）
        if (chainId === '0x539' || chainId === '0x7a69' || chainId === '0x1a4' ||
            parseInt(chainId, 16) > 1000000) {
            return '本地私有网络'
        }

        return networks[chainId] || `自定义网络 (${chainId})`
    }

    // 获取Etherscan基础URL
    const getEtherscanBaseUrl = (chainId) => {
        const etherscanUrls = {
            '0x1': 'https://etherscan.io',
            '0x3': 'https://ropsten.etherscan.io',
            '0x4': 'https://rinkeby.etherscan.io',
            '0x5': 'https://goerli.etherscan.io',
            '0x2a': 'https://kovan.etherscan.io',
            '0x89': 'https://polygonscan.com',
            '0xa86a': 'https://snowtrace.io',
            '0x38': 'https://bscscan.com',
            '0x61': 'https://testnet.bscscan.com',
            '0x13881': 'https://mumbai.polygonscan.com'
        }

        // 本地网络没有对应的区块链浏览器
        if (chainId === '0x539' || chainId === '0x7a69' || chainId === '0x1a4' ||
            parseInt(chainId, 16) > 1000000) {
            return null // 本地网络没有区块链浏览器
        }

        return etherscanUrls[chainId] || 'https://etherscan.io'
    }

    // 获取账户余额
    const getAccountBalance = async (address, showLogs = true) => {
        try {
            if (showLogs) {
                console.log('正在获取地址余额:', address)
            }

            // 检查MetaMask是否可用
            if (!window.ethereum) {
                throw new Error('MetaMask未安装')
            }

            // 检查地址格式
            if (!address || !address.startsWith('0x') || address.length !== 42) {
                throw new Error('无效的地址格式')
            }

            const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [address, 'latest']
            })

            if (showLogs) {
                console.log('原始余额数据:', balance, '类型:', typeof balance)
            }

            if (!balance) {
                console.warn('余额数据为空')
                return '0.000000'
            }

            const formattedBalance = formatBalance(balance)
            if (showLogs) {
                console.log('格式化后余额:', formattedBalance)
            }
            return formattedBalance
        } catch (error) {
            console.error('获取余额失败:', error)
            if (showLogs) {
                showNotification(`获取地址 ${formatAddress(address)} 余额失败: ${error.message}`, true)
            }
            return '0.000000'
        }
    }

    // 获取交易次数
    const getTransactionCount = async (address) => {
        try {
            console.log('正在获取交易次数:', address)
            const count = await window.ethereum.request({
                method: 'eth_getTransactionCount',
                params: [address, 'latest']
            })
            console.log('原始交易次数数据:', count, '类型:', typeof count)
            const transactionCount = parseInt(count, 16).toString()
            console.log('转换后交易次数:', transactionCount)
            return transactionCount
        } catch (error) {
            console.error('获取交易次数失败:', error)
            return '0'
        }
    }

    // 更新网络信息
    const updateNetworkInfo = async () => {
        try {
            currentChainId.value = await window.ethereum.request({ method: 'eth_chainId' })
            console.log('currentChainId', currentChainId.value)
            const netVersion = await window.ethereum.request({ method: 'net_version' })

            // 获取RPC URL（仅部分环境支持）
            let rpcUrlValue = '未知'
            if (window.ethereum.providers && window.ethereum.providers.length > 0) {
                try {
                    const config = await window.ethereum.request({
                        method: 'wallet_getProviderConfig'
                    })
                    rpcUrlValue = config.rpcUrl || '未知'
                } catch (e) {
                    console.log('无法获取RPC URL:', e)
                }
            }

            networkName.value = getNetworkName(currentChainId.value)
            rpcUrl.value = rpcUrlValue

            return currentChainId.value
        } catch (error) {
            console.error('更新网络信息失败:', error)
            showNotification('更新网络信息失败', true)
            return null
        }
    }

    // 加载所有账户信息
    const loadAllAccounts = async () => {
        if (!checkMetaMask()) return

        try {
            console.log('开始加载账户信息...')

            const addresses = await window.ethereum.request({ method: 'eth_accounts' })
            console.log('获取到的账户地址:', addresses)

            if (!addresses || addresses.length === 0) {
                console.log('没有找到已连接的账户')
                accounts.value = []
                selectedAccount.value = ''
                isConnected.value = false
                return
            }

            console.log('开始获取账户余额...')
            const accountsWithBalances = []

            for (let i = 0; i < addresses.length; i++) {
                const address = addresses[i]
                console.log(`正在处理第 ${i + 1}/${addresses.length} 个账户:`, address)

                try {
                    const balance = await getAccountBalance(address)
                    const txCount = await getTransactionCount(address)
                    const accountData = {
                        address,
                        balance,
                        transactionCount: txCount,
                        index: i,
                        name: `账户 ${i + 1}`
                    }
                    accountsWithBalances.push(accountData)
                    console.log(`账户 ${address} 数据获取成功:`, accountData)
                } catch (error) {
                    console.error(`账户 ${address} 数据获取失败:`, error)
                    accountsWithBalances.push({
                        address,
                        balance: '0.000000',
                        transactionCount: '0',
                        index: i,
                        name: `账户 ${i + 1}`
                    })
                }

                if (i < addresses.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100))
                }
            }

            accounts.value = accountsWithBalances
            console.log('所有账户信息加载完成:', accounts.value)

            if (!selectedAccount.value || !accounts.value.some(acc => acc.address === selectedAccount.value)) {
                selectedAccount.value = accounts.value[0]?.address || ''
            }

            await updateNetworkInfo()
            isConnected.value = true

            startBalancePolling()
            showNotification(`成功加载 ${accounts.value.length} 个账户信息`)
            return true
        } catch (error) {
            console.error('加载账户信息失败:', error)
            showNotification('加载账户信息失败: ' + error.message, true)
            return false
        }
    }

    // 连接/断开MetaMask
    const connectWallet = async () => {
        if (!checkMetaMask()) return

        try {
            const currentAccounts = await window.ethereum.request({ method: 'eth_accounts' })
            const isAlreadyConnected = currentAccounts && currentAccounts.length > 0

            if (isAlreadyConnected) {
                await loadAllAccounts()
            } else {
                await window.ethereum.request({ method: 'eth_requestAccounts' })
                showNotification('已成功连接MetaMask钱包')
                await loadAllAccounts()
            }
        } catch (error) {
            console.error('连接操作失败:', error)
            showNotification('操作失败: ' + error.message, true)
            isConnected.value = false
        }
    }

    const disconnectWallet = () => {
        selectedAccount.value = ''
        accounts.value = []
        isConnected.value = false
        stopBalancePolling()
        showNotification('已断开与MetaMask的连接')
    }

    // 选择账户
    const selectAccount = (address) => {
        selectedAccount.value = address
    }

    // 复制地址到剪贴板
    const copyAddress = () => {
        if (!selectedAccount.value) return

        navigator.clipboard.writeText(selectedAccount.value)
            .then(() => {
                showNotification('地址已复制到剪贴板')
            })
            .catch(err => {
                console.error('复制失败:', err)
                showNotification('复制失败，请手动复制', true)
            })
    }

    // 在Etherscan上查看地址
    const viewOnEtherscan = () => {
        if (!selectedAccount.value || !currentChainId.value) return

        const etherscanUrl = getEtherscanBaseUrl(currentChainId.value)
        if (etherscanUrl) {
            window.open(`${etherscanUrl}/address/${selectedAccount.value}`, '_blank')
        } else {
            showNotification('本地网络不支持区块链浏览器查看', true)
        }
    }

    // 启动余额轮询
    const startBalancePolling = () => {
        if (isPollingActive.value || accounts.value.length === 0) return

        isPollingActive.value = true
        console.log('启动余额轮询监控...')

        balancePollingInterval = setInterval(async () => {
            await checkBalanceChanges()
        }, 3000)
    }

    // 停止余额轮询
    const stopBalancePolling = () => {
        if (balancePollingInterval) {
            clearInterval(balancePollingInterval)
            balancePollingInterval = null
        }
        isPollingActive.value = false
        console.log('停止余额轮询监控')
    }

    // 检查余额变化
    const checkBalanceChanges = async () => {
        if (accounts.value.length === 0) return

        console.log('检查余额变化...')
        let hasChanges = false

        for (const account of accounts.value) {
            try {
                const newBalance = await getAccountBalance(account.address, false)
                const oldBalance = lastKnownBalances.get(account.address)

                if (oldBalance && oldBalance !== newBalance && newBalance !== '获取失败') {
                    console.log(`检测到余额变化 - ${formatAddress(account.address)}: ${oldBalance} → ${newBalance}`)

                    account.balance = newBalance
                    lastKnownBalances.set(account.address, newBalance)
                    hasChanges = true

                    const balanceChange = parseFloat(newBalance) - parseFloat(oldBalance)
                    const changeText = balanceChange > 0 ? `+${balanceChange.toFixed(6)} ETH` : `${balanceChange.toFixed(6)} ETH`
                    showNotification(`账户 ${formatAddress(account.address)} 余额变化: ${changeText}`)
                } else if (!oldBalance) {
                    lastKnownBalances.set(account.address, newBalance)
                }
            } catch (error) {
                console.error(`检查账户 ${account.address} 余额变化失败:`, error)
            }
        }
    }

    // 转账相关功能
    const openTransferModal = () => {
        if (!selectedAccount.value) {
            showNotification('请先选择一个账户', true)
            return
        }
    }

    const closeTransferModal = () => {
        // 关闭转账模态框的逻辑
    }

    // 执行转账
    const executeTransfer = async (transferData) => {
        try {
            const { to, amount } = transferData
            const value = '0x' + parseInt(parseFloat(amount) * Math.pow(10, 18)).toString(16)

            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: selectedAccount.value,
                    to: to,
                    value: value,
                    gas: '0x5208'
                }]
            })

            showNotification(`转账已提交，交易哈希: ${txHash.slice(0, 10)}...`)

            // 添加转账记录到历史
            addTransferToHistory({
                from: selectedAccount.value,
                to: to,
                amount: amount,
                txHash: txHash,
                status: 'pending'
            })

            // 等待交易确认
            showNotification('等待交易确认...')
            const receipt = await waitForTransactionReceipt(txHash)

            if (receipt.status === '0x1') {
                showNotification('转账成功！')
                const historyItem = transferHistory.value.find(item => item.txHash === txHash)
                if (historyItem) {
                    historyItem.status = 'success'
                    updateTransferHistoryDisplay()
                    localStorage.setItem('transferHistory', JSON.stringify(transferHistory.value))
                }
                await loadAllAccounts()
            } else {
                showNotification('转账失败', true)
                const historyItem = transferHistory.value.find(item => item.txHash === txHash)
                if (historyItem) {
                    historyItem.status = 'failed'
                    updateTransferHistoryDisplay()
                    localStorage.setItem('transferHistory', JSON.stringify(transferHistory.value))
                }
            }
        } catch (error) {
            console.error('转账失败:', error)
            if (error.code === 4001) {
                showNotification('用户取消了交易', true)
            } else {
                showNotification('转账失败: ' + error.message, true)
            }
        }
    }

    // 等待交易确认
    const waitForTransactionReceipt = (txHash) => {
        return new Promise((resolve, reject) => {
            const checkReceipt = async () => {
                try {
                    const receipt = await window.ethereum.request({
                        method: 'eth_getTransactionReceipt',
                        params: [txHash]
                    })

                    if (receipt) {
                        resolve(receipt)
                    } else {
                        setTimeout(checkReceipt, 2000)
                    }
                } catch (error) {
                    reject(error)
                }
            }
            checkReceipt()
        })
    }

    // 添加转账记录到历史
    const addTransferToHistory = (transferData) => {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date(),
            from: transferData.from,
            to: transferData.to,
            amount: transferData.amount,
            txHash: transferData.txHash,
            status: transferData.status || 'pending'
        }

        transferHistory.value.unshift(historyItem)
        updateTransferHistoryDisplay()
        localStorage.setItem('transferHistory', JSON.stringify(transferHistory.value))
    }

    // 更新转账历史显示
    const updateTransferHistoryDisplay = () => {
        // 这个函数主要用于更新UI，在Vue中通过响应式数据自动更新
    }

    // 切换历史记录显示
    const toggleTransferHistory = () => {
        // 这个功能在组件中处理
    }

    // 加载转账历史
    const loadTransferHistory = () => {
        const saved = localStorage.getItem('transferHistory')
        if (saved) {
            try {
                transferHistory.value = JSON.parse(saved)
                transferHistory.value.forEach(item => {
                    item.timestamp = new Date(item.timestamp)
                })
            } catch (error) {
                console.error('加载转账历史失败:', error)
                transferHistory.value = []
            }
        }
    }

    // 测试余额获取
    const testBalanceFetch = async () => {
        if (!selectedAccount.value) {
            showNotification('请先选择一个账户', true)
            return
        }

        try {
            console.log('=== 开始测试余额获取 ===')
            console.log('测试地址:', selectedAccount.value)

            // 直接调用MetaMask API
            const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [selectedAccount.value, 'latest']
            })

            console.log('MetaMask原始响应:', balance)
            console.log('响应类型:', typeof balance)

            // 测试格式化
            const formatted = formatBalance(balance)
            console.log('格式化结果:', formatted)

            showNotification(`测试完成，余额: ${formatted} ETH`)
        } catch (error) {
            console.error('测试失败:', error)
            showNotification('测试失败: ' + error.message, true)
        }
    }

    // 显示调试信息
    const showDebugInfo = async () => {
        const debugInfo = {
            'MetaMask状态': window.ethereum ? '已安装' : '未安装',
            '当前网络': currentChainId.value || '未知',
            '网络名称': networkName.value || '未知',
            'RPC URL': rpcUrl.value || '未知',
            '已连接账户数': accounts.value.length,
            '选中账户': selectedAccount.value || '无',
            '轮询状态': isPollingActive.value ? '运行中' : '已停止',
            '账户详情': accounts.value.map(acc => ({
                '地址': acc.address,
                '余额': acc.balance,
                '余额状态': acc.balance === '获取失败' ? '失败' : '成功'
            }))
        }

        // 如果是本地网络，获取更多信息
        if (currentChainId.value) {
            try {
                const chainId = await window.ethereum.request({ method: 'eth_chainId' })
                const netVersion = await window.ethereum.request({ method: 'net_version' })
                const blockNumber = await window.ethereum.request({ method: 'eth_blockNumber' })

                debugInfo['链ID (十六进制)'] = chainId
                debugInfo['链ID (十进制)'] = parseInt(chainId, 16)
                debugInfo['网络版本'] = netVersion
                debugInfo['最新区块'] = parseInt(blockNumber, 16)
            } catch (error) {
                console.error('获取网络详细信息失败:', error)
            }
        }

        console.log('=== 调试信息 ===')
        console.log(debugInfo)
        showNotification('调试信息已输出到控制台，请按F12查看')

        // 自动运行余额测试
        if (selectedAccount.value) {
            testBalanceFetch()
        }
    }

    // 刷新账户
    const refreshAccounts = async () => {
        await loadAllAccounts()
        showNotification('数据已刷新')
    }

    // 生命周期钩子
    onMounted(() => {
        if (checkMetaMask()) {
            // 初始化连接检查
            const initializeConnection = async () => {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
                    if (accounts && accounts.length > 0) {
                        console.log('发现已连接的账户，自动加载...')
                        await loadAllAccounts()
                    } else {
                        isConnected.value = false
                    }
                } catch (error) {
                    console.error('初始化连接检查失败:', error)
                    isConnected.value = false
                }
            }

            // 立即执行初始化
            initializeConnection()

            window.ethereum.on('accountsChanged', async (accounts) => {
                if (accounts.length === 0) {
                    selectedAccount.value = ''
                    isConnected.value = false
                    showNotification('所有账户已断开连接')
                } else {
                    await loadAllAccounts()
                    showNotification('账户列表已更新')
                }
            })

            window.ethereum.on('chainChanged', async (chainId) => {
                await updateNetworkInfo()
                await loadAllAccounts()
                showNotification('网络已切换')
            })

            window.ethereum.on('disconnect', (error) => {
                console.error('MetaMask已断开连接:', error)
                selectedAccount.value = ''
                isConnected.value = false
                showNotification('MetaMask已断开连接', true)
            })
        }
    })

    onUnmounted(() => {
        stopBalancePolling()
    })

    return {
        // 状态
        isConnected,
        accounts,
        selectedAccount,
        selectedAccountData,
        currentChainId,
        networkName,
        rpcUrl,
        isPollingActive,
        transferHistory,

        // 方法
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
        loadTransferHistory,
        testBalanceFetch
    }
}
