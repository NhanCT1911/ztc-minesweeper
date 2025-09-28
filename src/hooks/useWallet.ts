import { useEffect, useState, useCallback } from 'react'
import { BrowserProvider } from 'ethers'

declare global { interface Window { ethereum?: any } }

const TARGET_CHAIN_ID = '0x20D8' // 8408
const ZENCHAIN_PARAMS = {
  chainId: TARGET_CHAIN_ID,
  chainName: 'ZenChain Testnet',
  nativeCurrency: { name: 'ZTC', symbol: 'ZTC', decimals: 18 },
  rpcUrls: ['https://zenchain-testnet.api.onfinality.io/public'],
  blockExplorerUrls: ['https://zentrace.io'],
}

export function useWallet(){
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(async () => {
    setError(null)
    const eth = window.ethereum
    if(!eth){ setError('MetaMask is not installed.'); return }
    setConnecting(true)
    try {
      // 1) Ensure correct network: try switch, if not found then add
      const current = await eth.request({ method: 'eth_chainId' })
      if(current !== TARGET_CHAIN_ID){
        try {
          await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: TARGET_CHAIN_ID }] })
        } catch (switchErr: any) {
          // 4902 = chain not added
          const code = switchErr?.code ?? switchErr?.data?.originalError?.code
          if (code === 4902) {
            // add, then switch
            await eth.request({ method: 'wallet_addEthereumChain', params: [ZENCHAIN_PARAMS] })
            await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: TARGET_CHAIN_ID }] })
          } else if (switchErr?.message) {
            setError(switchErr.message)
            setConnecting(false)
            return
          } else {
            setError('Failed to switch to ZenChain Testnet.')
            setConnecting(false)
            return
          }
        }
      }

      // 2) Request accounts
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' })
      setAddress(accounts?.[0] ?? null)
      const newCid = await eth.request({ method: 'eth_chainId' })
      setChainId(newCid)
    } catch (err: any) {
      setError(err?.message || 'Wallet connection error.')
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(()=> { setAddress(null) }, [])

  useEffect(()=>{
    const eth = window.ethereum
    if(!eth) return
    const handleAccountsChanged = (accs: string[]) => setAddress(accs?.[0] ?? null)
    const handleChainChanged = (cid: string) => setChainId(cid)
    eth.on?.('accountsChanged', handleAccountsChanged)
    eth.on?.('chainChanged', handleChainChanged)
    return () => {
      eth?.removeListener?.('accountsChanged', handleAccountsChanged)
      eth?.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [])

  const provider = window.ethereum ? new BrowserProvider(window.ethereum) : null
  return { address, chainId, connecting, error, connect, disconnect, provider }
}