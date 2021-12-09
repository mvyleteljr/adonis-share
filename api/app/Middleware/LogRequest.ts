import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LogRequest {
  public async handle({ session }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL

    console.log('SessionID in middleware: ', session.sessionId)

    if (!session.get('siwe')) {
      console.log('No sesion information found')
      //stop request
    } else {
      console.log(`Testing middleware functionality -> Session ID: ${session.sessionId}`)
    }
    await next()
  }
}
