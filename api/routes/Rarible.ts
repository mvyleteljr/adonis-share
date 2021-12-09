// import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import fetch from 'node-fetch'
import { URLSearchParams } from 'url'

import {
  Asset,
  BaseAsset,
  RaribleAssetForItemIdResponse,
  RaribleAssetForOwnerResponse,
} from '../../shared/types'
import { RouteHandler } from './RouteHandler'

// Defining type "RaribleAsset" - what is returned when fetching assets from Rarible
type RaribleAsset = {
  id: string
  contract: string
  tokenId: string
  creators: {
    account: string
    value: number
  }[]
  owners: string[]
  meta: {
    name: string
    description: string
    attributes: {
      key: string
      value: string
    }[]
    image?: {
      url: {
        ORIGINAL: string
        BIG: string
        PREVIEW: string
      }
      meta: {
        PREVIEW: {
          type: string
          width: number
          height: number
        }
      }
    }
    animation?: {
      url: {
        ORIGINAL: string
      }
      meta: {
        ORIGINAL: {
          type: string
        }
      }
    }
  }
}

// Defining type "RaribleAssetResult" as object containing an array of RaribleAssets
type RaribleAssetsResult = {
  items: Array<RaribleAsset>
}

// Defining API endpoint for get requests
const RARIBLE_API_URL =
  process.env.NODE_ENV === 'production' ? 'http://api.rarible.com' : 'http://api.rarible.com'

// Function for converting Rarible object to base asset type
const convertRaribleAsset = (raribleAsset: RaribleAsset): Asset => {
  // background color often hidden in attributes, so we check for it
  let background_color: string | undefined = undefined
  var i = 0
  if (raribleAsset.meta.attributes) {
    for (i = 0; i < raribleAsset.meta.attributes.length; ++i) {
      var key = raribleAsset.meta.attributes[i].key
      if (key == 'Background colors') {
        background_color = raribleAsset.meta.attributes[i].value
      }
    }
  }
  // rarible returns an array of owners for a particular asset
  let owner
  if (raribleAsset.owners) {
    owner = raribleAsset.owners[0]
  }
  const baseAsset: BaseAsset = {
    id: +raribleAsset.tokenId,
    name: raribleAsset.meta.name,
    tokenId: raribleAsset.tokenId,
    description: raribleAsset.meta.description,
    backgroundColor: background_color,
    tokenContract: raribleAsset.contract,
    owner: owner,
    owner_display_name: undefined,
    imagePreviewUrl: raribleAsset.meta.image?.url.PREVIEW,
    imageThumbnailUrl: raribleAsset.meta.image?.url.PREVIEW,
    permalink: raribleAsset.meta.image?.url.ORIGINAL,
    imageUrl: raribleAsset.meta.image?.url.ORIGINAL,
    imageUrlHiRes: raribleAsset.meta.image?.url.BIG,
    traits: raribleAsset.meta.attributes?.map((trait) => {
      return { type: trait.key, value: trait.value }
    }),
  }

  if (raribleAsset.meta.animation) {
    let str_type = raribleAsset.meta.animation.meta.ORIGINAL.type
    if (str_type.includes('video')) {
      return {
        ...baseAsset,
        type: 'video',
        animationUrl: raribleAsset.meta.animation.url.ORIGINAL,
      }
    }
    if (str_type.includes('webgl')) {
      return {
        ...baseAsset,
        type: 'webgl',
        webglUrl: raribleAsset.meta.animation.url.ORIGINAL,
      }
    }
    if (
      raribleAsset.meta.animation?.url.ORIGINAL.startsWith('https://api.artblocks.io/') ||
      raribleAsset.meta.animation?.url.ORIGINAL.startsWith('https://generator.artblocks.io/')
    ) {
      return {
        ...baseAsset,
        type: 'webgl',
        webglUrl: raribleAsset.meta.animation.url.ORIGINAL,
      }
    }
  }
  return {
    ...baseAsset,
    type: 'image',
  }
}

// Function for fetching single asset from Rarible by itemID
const fetchAsset = async (contract: string, tokenID: string) => {
  const itemID = contract + ':' + tokenID
  const response = await fetch(
    `${RARIBLE_API_URL}/protocol/v0.1/ethereum/nft/items/${itemID}?includeMeta=true`,
    {
      method: 'GET',
    }
  )

  try {
    const result = await response.json()

    return result as RaribleAsset
  } catch (error) {
    Logger.error(
      {
        itemID,
        error: error.message,
        statusCode: response.status,
      },
      'Could not fetch rarible asset'
    )

    throw error
  }
}

// Function for fetching multiple assets by Owner from Rarible
const fetchMultipleAssets = async ({ owner, size }: { owner?: string; size?: number }) => {
  try {
    const params = new URLSearchParams()
    if (owner) {
      params.set('owner', owner)
    }

    if (size) {
      params.set('size', size.toString())
    }
    params.set('includeMeta', 'true')
    const response = await fetch(
      `${RARIBLE_API_URL}/protocol/v0.1/ethereum/nft/items/byOwner?${params}`,
      {
        method: 'GET',
      }
    )
    const result = await response.json()
    return result as RaribleAssetsResult
  } catch (e) {
    Logger.error(
      {
        owner,
        size,
        error: e.message,
      },
      'Could not fetch rarible assets by owner'
    )

    throw e
  }
}

// Route handler for getting single item from rarible given contract address and tokenId
export const RaribleAssetForItemId: RouteHandler<RaribleAssetForItemIdResponse> = async ({
  request,
}) => {
  const contract = request.param('contract')
  const tokenID = request.param('tokenID')

  try {
    const raribleAsset = await fetchAsset(contract, tokenID)
    return convertRaribleAsset(raribleAsset)
  } catch (e) {
    Logger.info({ error: e.message }, 'error')
    return { error: 'Could not fetch rarible asset' }
  }
}

// Route handler for getting multiple items from rarible by owner
export const RaribleAssetForOwner: RouteHandler<RaribleAssetForOwnerResponse> = async ({
  request,
}) => {
  const owner = request.param('owner')
  const size = request.param('size')

  try {
    const raribleAssets = await fetchMultipleAssets({ owner, size })
    return raribleAssets.items.map(convertRaribleAsset)
  } catch (e) {
    Logger.info({ error: e.message }, 'error')
    return []
  }
}
