import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class FollowingCollection extends BaseModel {
  @column({ isPrimary: true })
  public follower: string

  @column({ isPrimary: true })
  public asset: string
}
