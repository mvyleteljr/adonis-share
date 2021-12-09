import Logger from '@ioc:Adonis/Core/Logger'
import { Subregistry } from 'App/Models/Subregistry'
import { Token } from 'App/Models/Token'
import { recoverTypedSignature_v4 } from 'eth-sig-util'
import { parseBytes32String } from 'ethers/lib/utils'
import fetch from 'node-fetch'

import { CreateSubregistryResponse, GetSubregistryResponse } from '../../shared/types'
import { getGraphUris } from '../utils/networks'
import { RouteHandler } from './RouteHandler'

export const CreateSubregistry: RouteHandler<CreateSubregistryResponse> = async ({ request }) => {
  const name = request.input('name')
  const coverImage = request.input('coverImage')
  const type = request.input('type')

  const tokenIds = [].concat(request.input('tokenId'))
  const openseaDescription = [].concat(request.input('openseaDescription'))

  Logger.info({ coverImage }, 'coverImage')
  Logger.info({ name }, 'name')

  try {
    const subregistry = await Subregistry.findBy('name', name)

    Logger.info({ subregistry }, 'subregistry')

    if (subregistry) {
      // If subregistry already exists on backend, check whether it exists on chain
      const endpoint = getGraphUris(1).httpUri

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query {subregistries(where: {name: "${name}"}) {id}}`,
        }),
      })

      const result = await response.json()

      // If it doesn't exist on chain, update backend data
      if (result.data.subregistries.length === 0) {
        subregistry.coverImage = coverImage
        subregistry.type = type
        subregistry.save()
      } else {
        return { error: 'That subregistry already exists. Request blocked' }
      }
    } else {
      await Subregistry.create({
        name: name,
        coverImage: coverImage,
        type: type,
      })
    }

    await tokenIds.forEach(async (tokenId, i) => {
      const token = await Token.findBy('id', tokenId)

      Logger.info({ token }, 'token')

      if (token) {
        token.subregistry = name
        token.openseaDescription = openseaDescription[i]
        token.save()
      } else {
        await Token.create({
          id: tokenId,
          subregistry: name,
          openseaDescription: openseaDescription[i],
        })
      }
    })

    return { success: true }
  } catch (error) {
    Logger.info({ error }, 'Error creating subregistry: ')
    return { error }
  }
}

export const UpdateSubregistry: RouteHandler<CreateSubregistryResponse> = async ({ request }) => {
  const networkId = request.input('networkId')
  const name = request.input('name')
  const coverImage = request.input('coverImage')
  const type = request.input('type')
  const signature = request.input('signature')

  const tokenIdsToAdd = request.input('tokenIdToAdd')
    ? [].concat(request.input('tokenIdToAdd'))
    : []
  const tokenIdsToRemove = request.input('tokenIdToRemove')
    ? [].concat(request.input('tokenIdToRemove'))
    : []
  const openseaDescriptionsToAdd = request.input('openseaDescriptionToAdd')
    ? [].concat(request.input('openseaDescriptionToAdd'))
    : []

  try {
    const signer = getSigner(
      networkId,
      name,
      type,
      coverImage,
      tokenIdsToAdd,
      tokenIdsToRemove,
      openseaDescriptionsToAdd,
      signature
    )

    const curator = await getCurator(networkId, parseBytes32String(name))

    if (curator.toLowerCase() !== signer.toLowerCase()) {
      throw new Error('Invalid signer')
    }

    const subregistry = await Subregistry.findBy('name', name)

    if (subregistry) {
      subregistry.coverImage = coverImage
      subregistry.type = type

      subregistry.save()
    } else {
      await Subregistry.create({
        name: name,
        coverImage: coverImage,
        type: type,
      })
    }

    await tokenIdsToAdd.forEach(async (tokenId, i) => {
      const token = await Token.findBy('id', tokenId)

      if (token) {
        token.subregistry = name
        token.openseaDescription = openseaDescriptionsToAdd[i]

        token.save()
      } else {
        await Token.create({
          id: tokenId,
          subregistry: name,
          openseaDescription: openseaDescriptionsToAdd[i],
        })
      }
    })

    await tokenIdsToRemove.forEach(async (tokenId) => {
      const token = await Token.findBy('id', tokenId)

      if (token) {
        token.delete()
      }
    })

    return { success: true }
  } catch (error) {
    return { error }
  }
}

export const GetSubregistry: RouteHandler<GetSubregistryResponse> = async ({ request }) => {
  const name = request.param('subregistry')

  const subregistry = await Subregistry.findBy('name', name)
  const tokens = await Token.query().where('subregistry', name)

  try {
    if (!subregistry) {
      throw new Error('Missing subregistry')
    }
    return {
      name: subregistry?.name,
      coverImage: subregistry?.coverImage,
      type: subregistry?.type,
      tokens: tokens,
    }
  } catch (e) {
    Logger.info({ error: e.message }, 'error')
    throw e
  }
}

export const getSigner = (
  networkId: number,
  name: string,
  galleryType: string,
  coverImageUrl: string,
  tokenIdsToAdd: string[],
  tokenIdsToRemove: string[],
  tokenDescriptions: string[],
  signature: string
): string => {
  const msgParams = JSON.stringify({
    domain: {
      chainId: networkId,
      name: 'JPG Space',
      version: 1,
    },
    message: {
      name: name,
      galleryType: galleryType,
      coverImageUrl: coverImageUrl,
      tokenIdsToAdd: tokenIdsToAdd,
      tokenIdsToRemove: tokenIdsToRemove,
      tokenDescriptions: tokenDescriptions,
    },
    primaryType: 'CuratorOptions',
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
      ],
      CuratorOptions: [
        { name: 'name', type: 'string' },
        { name: 'galleryType', type: 'string' },
        { name: 'coverImageUrl', type: 'string' },
        { name: 'tokenIdsToAdd', type: 'string[]' },
        { name: 'tokenIdsToRemove', type: 'string[]' },
        { name: 'tokenDescriptions', type: 'string[]' },
      ],
    },
  })

  const signer = recoverTypedSignature_v4({
    data: JSON.parse(msgParams),
    sig: signature,
  })

  return signer
}

export const getCurator = async (networkId: number, name: string): Promise<string> => {
  const endpoint = getGraphUris(networkId).httpUri

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query {subregistries(where: {name: "${name}"}) {curator}}`,
    }),
  })

  const result = await response.json()

  return result.data.subregistries[0].curator
}
