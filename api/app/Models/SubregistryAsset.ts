import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class SubregistryAsset extends BaseModel {
  @column({ isPrimary: true })
  public subregistry: string

  @column({ isPrimary: true })
  public asset: string

  @column({ columnName: 'note', serializeAs: 'note' })
  public note: string

  @column({ columnName: 'index', serializeAs: 'index' })
  public index: number

  @column({ columnName: 'OS_description', serializeAs: 'OS_description' })
  public OS_description: boolean

  @column({ columnName: 'created_at', serializeAs: 'created_at' })
  //but its a timestamp ??
  public created_at: string
}
