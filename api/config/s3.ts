import Env from '@ioc:Adonis/Core/Env'
import AWS from 'aws-sdk'

const spacesEndpoint = new AWS.Endpoint('sfo3.digitaloceanspaces.com')
export const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: Env.get('SPACES_KEY') as string,
  secretAccessKey: Env.get('SPACES_SECRET') as string,
})
