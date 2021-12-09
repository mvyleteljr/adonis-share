import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class SubregistryLink extends BaseModel {
  @column({ isPrimary: true })
  public subregistry: string

  @column({ isPrimary: true })
  public linked_sub: string

  @column({ columnName: 'index', serializeAs: 'index' })
  public index: number

  @column({ columnName: 'created_at', serializeAs: 'created_at' })
  //but its a timestamp ??
  public created_at: string
}
