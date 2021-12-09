import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export type RouteHandler<ResponseType extends unknown> = (
  ctx: HttpContextContract
) => Promise<ResponseType>
