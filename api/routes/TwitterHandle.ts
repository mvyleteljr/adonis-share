import { TwitterHandle } from 'App/Models/TwitterHandle'

import { GetTwitterHandleForAddressResponse } from '../../shared/types'
import { RouteHandler } from './RouteHandler'

export const GetTwitterHandleForAddress: RouteHandler<GetTwitterHandleForAddressResponse> = async ({
  request,
}) => {
  const address = request.param('address')

  const handle = await TwitterHandle.findBy('address', address)

  if (handle) {
    return { imageUrl: handle.twitterImageUrl, handle: handle.twitterHandle }
  } else {
    return { notFound: true }
  }
}
