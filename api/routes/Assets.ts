import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import fetch from 'node-fetch'
import { URLSearchParams } from 'url'

import {
  Asset,
  AssetForAddressResponse,
  AssetForContractAndTokenIdResponse,
  BaseAsset,
  TopTwentyAssetsResponse,
} from '../../shared/types'
import { RouteHandler } from './RouteHandler'

const ASSETS_PER_PAGE = 20

type OpenSeaAsset = {
  id: number
  name: string
  description: string
  token_id: string
  image_url: string
  image_thumbnail_url: string
  image_original_url: string
  animation_url?: string
  background_color: string
  external_link?: string
  image_preview_url?: string
  permalink: string
  asset_contract: {
    address: string
  }
  owner: {
    address: string
    user?: {
      username: string
    }
    profile_img_url: string
  }
  traits: {
    trait_type: string
    value: string | number
  }[]
  collection: {
    name: string
  }
}

type OpenSeaAssetsResult = {
  assets: Array<OpenSeaAsset>
}

const OPENSEA_API_URL =
  process.env.NODE_ENV === 'production' ? 'https://api.opensea.io' : 'https://api.opensea.io'

const convertOpenSeaAsset = (openSeaAsset: OpenSeaAsset): Asset => {
  const baseAsset: BaseAsset = {
    id: openSeaAsset.id,
    name: openSeaAsset.name,
    tokenId: openSeaAsset.token_id,
    description: openSeaAsset.description,
    backgroundColor: openSeaAsset.background_color,
    tokenContract: openSeaAsset.asset_contract?.address,
    owner: openSeaAsset.owner?.address,
    owner_image_url: openSeaAsset.owner?.profile_img_url,
    owner_display_name: openSeaAsset.owner?.user?.username ?? openSeaAsset.owner?.address,
    imagePreviewUrl: openSeaAsset.image_preview_url,
    imageThumbnailUrl: openSeaAsset.image_thumbnail_url,
    permalink: openSeaAsset.permalink,
    imageUrl: openSeaAsset.image_url,
    imageUrlHiRes: openSeaAsset.image_original_url,
    traits: openSeaAsset.traits?.map((trait) => {
      return { type: trait.trait_type, value: trait.value.toString() }
    }),
    collection: openSeaAsset.collection.name,
  }

  Logger.info({ baseAsset }, 'baseAsset')

  const externalLink = openSeaAsset.external_link
  if (externalLink?.startsWith('https://solvency.art/view/')) {
    return {
      ...baseAsset,
      type: 'webgl',
      webglUrl: externalLink.concat('?fullscreen=true&embed=true&display=iframe&size=large'),
    }
  }

  if (openSeaAsset.animation_url) {
    if (
      openSeaAsset.animation_url?.startsWith('https://api.artblocks.io/') ||
      openSeaAsset.animation_url?.startsWith('https://generator.artblocks.io/')
    ) {
      return {
        ...baseAsset,
        type: 'webgl',
        webglUrl: openSeaAsset.animation_url,
      }
    }
    return {
      ...baseAsset,
      type: 'video',
      animationUrl: openSeaAsset.animation_url,
    }
  }

  // Make sure imageURL isn't actually a video
  if (openSeaAsset.image_url.includes('.mp4')) {
    return {
      ...baseAsset,
      type: 'video',
      animationUrl: openSeaAsset.image_url,
      imagePreviewUrl: undefined,
      imageThumbnailUrl: undefined,
      imageUrl: undefined,
      imageUrlHiRes: undefined,
    }
  }

  return {
    ...baseAsset,
    type: 'image',
  }
}

const fetchAssets = async ({
  offset,
  address,
  tokenId,
  tokenContract,
}: {
  address?: string
  offset?: number
  tokenContract?: string | string[]
  tokenId?: string | string[]
}) => {
  try {
    const params = new URLSearchParams()

    if (address) {
      params.set('owner', address)
    }

    if (offset) {
      params.set('offset', offset.toString())
    }

    if (tokenContract) {
      if (typeof tokenContract === 'string') {
        params.set('asset_contract_addresses', tokenContract)
      } else {
        tokenContract.forEach((contract) => params.append('asset_contract_addresses', contract))
      }
    }

    if (tokenId) {
      if (typeof tokenId === 'string') {
        params.set('token_ids', tokenId)
      } else {
        tokenId.forEach((id) => params.append('token_ids', id))
      }
    }

    const url = `${OPENSEA_API_URL}/api/v1/assets?${params}`

    Logger.info({ url }, 'Making request to fetch open sea assets')

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ['X-API-KEY']: Env.get('OPENSEA_API_KEY'),
      },
    })

    const result = await response.json()

    Logger.info({ result }, 'result')

    return result as OpenSeaAssetsResult
  } catch (error) {
    Logger.error(
      {
        address,
        offset,
        error: error.message,
      },
      'Could not fetch open sea assets'
    )

    throw error
  }
}

const fetchAsset = async (tokenContract: string, tokenId: string) => {
  const response = await fetch(`${OPENSEA_API_URL}/api/v1/asset/${tokenContract}/${tokenId}/`, {
    method: 'GET',
    headers: {
      ['X-API-KEY']: Env.get('OPENSEA_API_KEY'),
    },
  })

  try {
    const result = await response.json()

    return result as OpenSeaAsset
  } catch (error) {
    Logger.error(
      {
        tokenContract,
        tokenId,
        error: error.message,
        statusCode: response.status,
      },
      'Could not fetch open sea asset'
    )

    throw error
  }
}

const fetchTopTwentyAssets = async () => {
  const response = await fetch(`${OPENSEA_API_URL}/api/v1/assets`, {
    method: 'GET',
    headers: {
      ['X-API-KEY']: Env.get('OPENSEA_API_KEY'),
    },
  })

  try {
    const result = await response.json()

    return result as OpenSeaAssetsResult
  } catch (error) {
    Logger.error(
      {
        error: error.message,
        statusCode: response.status,
      },
      'Could not fetch top one hundred open sea assets'
    )

    throw error
  }
}

export const AssetsForAddress: RouteHandler<AssetForAddressResponse> = async ({ request }) => {
  const address = request.param('address')

  const page = request.input('page', 1)
  const tokenId = request.input('tokenId')
  const tokenContract = request.input('tokenContract')

  try {
    const openSeaAssets = await fetchAssets({
      address,
      tokenId,
      tokenContract,
      offset: ASSETS_PER_PAGE * (page - 1),
    })

    return openSeaAssets.assets.map(convertOpenSeaAsset)
  } catch (e) {
    Logger.info({ error: e.message }, 'error')
    return []
  }
}

export const AssetForContractAndTokenId: RouteHandler<AssetForContractAndTokenIdResponse> = async ({
  request,
}) => {
  const tokenContract = request.param('tokenContract')
  const tokenId = request.param('tokenId')

  try {
    const openSeaAsset = await fetchAsset(tokenContract, tokenId)

    return convertOpenSeaAsset(openSeaAsset)
  } catch (e) {
    Logger.info({ error: e.message }, 'error')
    return { error: 'Could not fetch open sea asset' }
  }
}

export const TopTwentyAssets: RouteHandler<TopTwentyAssetsResponse> = async () => {
  try {
    const openSeaAssets = await fetchTopTwentyAssets()

    return openSeaAssets.assets.map(convertOpenSeaAsset)
  } catch (e) {
    return { error: 'Could not fetch top one hundred assets' }
  }
}
