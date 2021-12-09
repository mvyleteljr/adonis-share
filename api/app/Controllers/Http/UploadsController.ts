import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'
import * as crypto from 'crypto'
import * as fs from 'fs'

import S3Service from '../../../services/S3Service'

export default class UploadsController {
  public async upload({ request }: HttpContextContract) {
    const coverImage = request.file('coverImage', { size: '2mb' })
    if (!coverImage?.isValid) {
      return { error: 'file is too big' }
    }
    if (coverImage) {
      try {
        const contentType = coverImage.headers['content-type']
        const subtype = contentType.slice(contentType.lastIndexOf('/') + 1)
        const customName = `${crypto.randomBytes(16).toString('hex')}.${subtype}`
        if (coverImage.tmpPath) {
          const readableStream = fs.createReadStream(coverImage.tmpPath)
          const url = await S3Service.upload(readableStream, customName, contentType)
          Logger.info(url)
          return { url }
        } else {
          return { error: 'error writing to tmp path' }
        }
      } catch (error) {
        Logger.info('Controller - ' + error.message)
        return { error: error.message }
      }
    }
    Logger.info('No Image Uploaded')
    return { error: 'no image uploaded' }
  }
}
