import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class Tag extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'type' })
  public type: string
}
