import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import { ManagedUpload } from 'aws-sdk/clients/s3'

import { s3 } from '../config/s3'

// SOURCE: https://github.com/adonisjs/core/discussions/1545#discussioncomment-88478
class S3Service {
  public async upload(file: any, customFileName: string, content_type: string): Promise<string> {
    const params = {
      Bucket: Env.get('BUCKET_NAME') as string,
      Key: customFileName,
      Body: file,
      ACL: 'public-read',
      ContentType: content_type,
    }
    return await new Promise((resolve: (value: string) => void) => {
      s3.upload(params, (err: Error, data: ManagedUpload.SendData) => {
        if (err) Logger.info('S3 - ' + err.message)
        resolve(data.Location)
      })
    })
  }

  public async get(customFileName: string): Promise<string> {
    const params = {
      Bucket: Env.get('BUCKET_NAME') as string,
      Key: customFileName,
    }
    return await new Promise((resolve: (value: any) => void, _) => {
      const stream = s3.getObject(params).createReadStream()

      resolve(stream)
    })
  }
}
export default new S3Service()
