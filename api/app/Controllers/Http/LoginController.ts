import Env from '@ioc:Adonis/Core/Env'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { randomStringForEntropy } from '@stablelib/random'
import { providers } from 'ethers'

import { SignatureType, SiweMessage } from '../../../utils/siwe/client'
const PORT = '4361'

const getInfuraUrl = (chainId: string) => {
  switch (Number.parseInt(chainId)) {
    case 1:
      return 'https://mainnet.infura.io/v3'
    case 3:
      return 'https://ropsten.infura.io/v3'
    case 4:
      return 'https://rinkeby.infura.io/v3'
    case 5:
      return 'https://goerli.infura.io/v3'
    case 137:
      return 'https://polygon-mainnet.infura.io/v3'
  }
}

export default class LoginController {
  public async nonce({ session }: HttpContextContract) {
    try {
      session.regenerate()
      const nonce = randomStringForEntropy(96)
      session.put('nonce', nonce)
      console.log(session.get('nonce'), 'in the nonce function')
      return { nonce: nonce }
    } catch (error) {
      return { error: error.message }
    }
  }

  public async create_message({ request }: HttpContextContract) {
    const domain = request.input('domain')
    const address = request.input('address')
    const chainId = request.input('chainId')
    const uri = request.input('uri')
    const nonce = request.input('nonce')
    try {
      const message = new SiweMessage({
        domain: domain,
        address: address,
        chainId: chainId,
        uri: uri,
        version: '1',
        statement: 'Sign in to JPG',
        type: SignatureType.PERSONAL_SIGNATURE,
        nonce: nonce,
      })
      return { message: message }
    } catch (error) {
      return { error: error.message }
    }
  }

  public async sign_in({ request, session }: HttpContextContract) {
    const frontEndMessage = request.all().message
    const signature = request.all().signature
    const issuedAt = request.all().issuedAt
    if (!frontEndMessage) {
      return { error: 'Expected a message to sign' }
    }
    const message = new SiweMessage(frontEndMessage)
    message.signature = signature
    message.issuedAt = issuedAt
    try {
      const infuraProvider = new providers.JsonRpcProvider(
        {
          allowGzip: true,
          url: `https://mainnet.infura.io/v3/${Env.get('INFURA_ID')}`,
          headers: {
            'Accept': '*/*',
            'Origin': `http://localhost:${PORT}`,
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/json',
          },
        },
        Number.parseInt(message.chainId)
      )

      await infuraProvider.ready

      const fields: SiweMessage = await message.validate(infuraProvider)
      console.log(session.get('nonce'), 'in sign in controller')
      if (fields.nonce !== session.get('nonce')) {
        return {
          message: `Invalid nonce.`,
        }
      }
      console.log('here')
      session.put('siwe', fields)
      // session.put('nonce', false)
      return { success: true }
    } catch (e) {
      // session.clear()
      return { error: e.message }
    }
  }

  public async sign_out({ session }: HttpContextContract) {
    if (!session.has('siwe')) {
      return { error: 'User has not signed in' }
    }
    console.log('here in sign out')
    session.clear()
    return { success: true }
  }

  public async hasSession({ session }: HttpContextContract) {
    if (!session.get('nonce')) {
      return { session: false }
    }
    return { session: true }
  }
}
