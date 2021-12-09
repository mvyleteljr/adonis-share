import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Archive extends BaseModel {
  @column({ isPrimary: true })
  public user: string

  @column({ isPrimary: true })
  public asset: string
}
