import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Relationship extends BaseModel {
  @column({ isPrimary: true })
  public follower: string

  @column({ isPrimary: true })
  public followed: string
}
