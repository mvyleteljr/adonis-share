import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import Logger from '@ioc:Adonis/Core/Logger'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new NotAdminException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class NotAdminException extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  public async handle(_, ctx) {
    return ctx.response.status(401).send({ error: 'Not Allowed' })
  }
}
