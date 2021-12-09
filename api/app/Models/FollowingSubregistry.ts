import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class FollowingSubregistry extends BaseModel {
  @column({ isPrimary: true })
  public follower: string

  @column({ isPrimary: true })
  public subregistry: string
}
