import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export class TwitterHandle extends BaseModel {
  @column({ isPrimary: true, serializeAs: 'id' })
  public id: string

  @column({ columnName: 'address', serializeAs: 'address' })
  public address: string

  @column({ columnName: 'twitter_handle', serializeAs: 'twitterHandle' })
  public twitterHandle: string

  @column({ columnName: 'twitter_id', serializeAs: 'twitterId' })
  public twitterId: string

  @column({ columnName: 'twitter_image_url', serializeAs: 'twitterImageUrl' })
  public twitterImageUrl: string
}
