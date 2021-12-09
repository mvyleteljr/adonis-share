import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public address: string

  @column({ columnName: 'username', serializeAs: 'username' })
  public username: string

  @column({ columnName: 'cover_image', serializeAs: 'cover_image' })
  public cover_image: string

  @column({ columnName: 'email', serializeAs: 'email' })
  public email: string

  @column({ columnName: 'twitter_id', serializeAs: 'twitter_id' })
  public twitter_id: string

  @column({ columnName: 'twitter_handle', serializeAs: 'twitter_handle' })
  public twitter_handle: string

  @column({ columnName: 'twitter_image_url', serializeAs: 'twitter_image_url' })
  public twitter_image_url: string

  @column({ columnName: 'created_at', serializeAs: 'created_at' })
  public created_at: string
}
