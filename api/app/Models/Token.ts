import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export class Token extends BaseModel {
  @column({ isPrimary: true, serializeAs: 'id' })
  public id: string

  @column({ columnName: 'subregistry', serializeAs: 'subregistry' })
  public subregistry: string

  @column({ columnName: 'opensea_description', serializeAs: 'openseaDescription' })
  public openseaDescription: boolean
}
