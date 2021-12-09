import Logger from '@ioc:Adonis/Core/Logger'
import { schema } from '@ioc:Adonis/Core/Validator'
import { TwitterHandle } from 'App/Models/TwitterHandle'
import User from 'App/Models/User'
import { utils } from 'ethers'
import oauth from 'oauth'
import { v4 } from 'uuid'

import {
  ConnectTwitterOAuthRequest,
  ConnectTwitterOAuthResponse,
  InitializeTwitterOAuthResponse,
} from '../../shared/types'
import { RouteHandler } from './RouteHandler'

const consumer = () => {
  return new oauth.OAuth(
    'https://twitter.com/oauth/request_token',
    'https://twitter.com/oauth/access_token',
    `jiBnnMyzoMu4hEn1wXJWZc8Yx`,
    `1njW2Q8Wdx3onv7VC3mkB0sQrY95dxea3hH6KHzLv6nisyXpSI`,
    '1.0A',
    `http://todo.com/oauth/twitter-callback`,
    'HMAC-SHA1'
  )
}

export const InitializeTwitterOAuth: RouteHandler<InitializeTwitterOAuthResponse> = async () => {
  return new Promise<InitializeTwitterOAuthResponse>((resolve, reject) => {
    consumer().getOAuthRequestToken((error, oauthToken, oauthTokenSecret) => {
      if (error) {
        Logger.error({ error }, 'Could not get oauth request token')

        reject({ error: 'Could not get oauth request token' })
      } else {
        resolve({ oauthRequestToken: oauthToken, oauthRequestTokenSecret: oauthTokenSecret })
      }
    })
  })
}

const ConnectTwitterOAuthSchema = schema.create({
  address: schema.string(),
  signature: schema.string(),
  oauthVerifier: schema.string(),
  oauthRequestToken: schema.string(),
  oauthRequestTokenSecret: schema.string(),
})

const retrieveTwitterInformationFromOAuth = (
  oauthVerifier: string,
  oauthRequestToken: string,
  oauthRequestTokenSecret: string
): Promise<{ screen_name: string; id_str: string; profile_image_url: string }> => {
  return new Promise((resolve, reject) => {
    consumer().getOAuthAccessToken(
      oauthRequestToken,
      oauthRequestTokenSecret,
      oauthVerifier,
      (error, oauthAccessToken, oauthAccessTokenSecret) => {
        if (error) {
          Logger.error({ error }, 'Could not fetch oauth access token')

          reject({ error: 'Could not fetch oauth access token' })
        } else {
          Logger.info('Verifying credentials for user')

          consumer().get(
            'https://api.twitter.com/1.1/account/verify_credentials.json',
            oauthAccessToken,
            oauthAccessTokenSecret,
            async (error, data) => {
              Logger.info({ data }, 'Twitter response')

              // Wrap in string because data might be a buffer;
              const response = JSON.parse(String(data).toString() ?? '{}')

              if (error) {
                Logger.error({ error }, 'Could not verify credentials for user')

                reject({ error: 'Could not verify credentials' })
              } else if (response.screen_name && response.id_str && response.profile_image_url) {
                resolve(response)
              } else {
                Logger.error(
                  { response },
                  'Missing either screen_name or id_str or profile_image_url from twitter body'
                )

                reject({ error: 'Invalid twitter response body' })
              }
            }
          )
        }
      }
    )
  })
}

export const ConnectTwitterOAuth: RouteHandler<ConnectTwitterOAuthResponse> = async ({
  request,
}) => {
  const {
    address,
    signature,
    oauthVerifier,
    oauthRequestToken,
    oauthRequestTokenSecret,
  }: ConnectTwitterOAuthRequest = await request.validate({
    schema: ConnectTwitterOAuthSchema,
  })

  const verifiedAddress = utils.verifyMessage(`JPG connecting Twitter to ${address}`, signature)
  const caseInsensitiveAddress = verifiedAddress.toLowerCase()

  try {
    const response = await retrieveTwitterInformationFromOAuth(
      oauthVerifier,
      oauthRequestToken,
      oauthRequestTokenSecret
    )

    const user = await User.findBy('address', caseInsensitiveAddress)

    interface LooseObject {
      [key: string]: any
    }
    var content: LooseObject = {}

    if (user) {
      content.twitter_handle = response.screen_name
      content.twitter_id = response.id_str
      content.twitter_image_url = response.profile_image_url
      await User.updateOrCreate({ address: caseInsensitiveAddress }, content)
      return { success: true }
    } else {
      return { error: `User with address ${caseInsensitiveAddress} does not exist` }
    }

    // if (user) {
    //   foundHandle.twitterHandle = response.screen_name
    //   foundHandle.twitterImageUrl = response.profile_image_url
    // } else {
    //   await TwitterHandle.create({
    //     id: v4(),
    //     twitterHandle: response.screen_name,
    //     twitterId: response.id_str,
    //     address: caseInsensitiveAddress,
    //     twitterImageUrl: response.profile_image_url,
    //   })
    // }

    // return { success: true }
  } catch (error) {
    return { error }
  }
}
