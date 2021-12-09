export type NetworkId = 1 | 4

export const networkIds = {
  MAINNET: 1,
  RINKEBY: 4,
} as const

interface Network {
  label: string
  url: string
  graphHttpUri: string
  graphWsUri: string
  // earliestBlockToCheck: number
  contracts: {
    jpgRegistry: string
  }
  blockExplorerURL: string
}

type KnownContracts = keyof Network['contracts']

const networks: { [K in NetworkId]: Network } = {
  [networkIds.MAINNET]: {
    label: 'Mainnet',
    url: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`,
    graphHttpUri: 'https://api.thegraph.com/subgraphs/name/kadenzipfel/jpg',
    graphWsUri: 'wss://api.thegraph.com/subgraphs/name/kadenzipfel/jpg',
    // earliestBlockToCheck: EARLIEST_MAINNET_BLOCK_TO_CHECK,
    contracts: {
      jpgRegistry: '0xDaCD63fd7cC98C16a329Fe1A56C759F0c9d2211B',
    },
    blockExplorerURL: 'https://etherscan.io',
  },
  [networkIds.RINKEBY]: {
    label: 'Rinkeby',
    url: `https://rinkeby.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`,
    graphHttpUri: 'https://api.thegraph.com/subgraphs/name/kadenzipfel/jpg-rinkeby',
    graphWsUri: 'wss://api.thegraph.com/subgraphs/name/kadenzipfel/jpg-rinkeby',
    // earliestBlockToCheck: EARLIEST_RINKEBY_BLOCK_TO_CHECK,
    contracts: {
      jpgRegistry: '0x1211EaE9cF2bF38A362355ebE99650da47D150Af',
    },
    blockExplorerURL: 'https://rinkeby.etherscan.io',
  },
}

const validNetworkId = (networkId: number): networkId is NetworkId => {
  return networks[networkId as NetworkId] !== undefined
}

export const supportedNetworkIds = Object.keys(networks).map(Number) as NetworkId[]

export const infuraNetworkURL = networks[1].url

export const getInfuraUrl = (networkId: number): string => {
  if (!validNetworkId(networkId)) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }
  return networks[networkId].url
}

export const getContractAddress = (networkId: number, contract: KnownContracts): string => {
  if (!validNetworkId(networkId)) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }
  return networks[networkId].contracts[contract]
}

export const getEtherscanTxURL = (networkId: number, txHash: string): string => {
  if (!validNetworkId(networkId)) {
    throw new Error(`Unsupported network id: '${networkId}'`)
  }
  return `${networks[networkId].blockExplorerURL}/tx/${txHash}`
}

export const getGraphUris = (networkId: number): { httpUri: string; wsUri: string } => {
  if (!validNetworkId(networkId)) {
    console.warn(`Invalid networkId: ${networkId}, using mainnet fallback`)
    const httpUri = networks[1].graphHttpUri
    const wsUri = networks[1].graphWsUri
    return { httpUri, wsUri }
  }

  const httpUri = networks[networkId].graphHttpUri
  const wsUri = networks[networkId].graphWsUri
  return { httpUri, wsUri }
}
