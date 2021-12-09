import { BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 } from 'uuid'

export default class Asset extends BaseModel {
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  public uuid: string

  @column({ columnName: 'type', serializeAs: 'type' })
  // but it is an enum???
  public type: string

  @column({ columnName: 'name', serializeAs: 'name' })
  public name: string

  @column({ columnName: 'contract', serializeAs: 'contract' })
  public contract: string

  @column({ columnName: 'token_id', serializeAs: 'tokenId' })
  public token_id: string

  @column({ columnName: 'owner', serializeAs: 'owner' })
  public owner: string

  @column({ columnName: 'creator', serializeAs: 'creator' })
  public creator: string

  @column({ columnName: 'chain', serializeAs: 'chain' })
  public chain: string
}
