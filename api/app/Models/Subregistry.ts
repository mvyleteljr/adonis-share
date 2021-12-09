import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export class Subregistry extends BaseModel {
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'name', serializeAs: 'name' })
  public name: string

  @column({ columnName: 'cover_image', serializeAs: 'coverImage' })
  public coverImage: string

  @column({ columnName: 'curator', serializeAs: 'curator' })
  public curator: string

  @column({ columnName: 'type', serializeAs: 'type' })
  public type: string

  @column({ columnName: 'public', serializeAs: 'public' })
  public public: boolean

  @column({ columnName: 'communal', serializeAs: 'communal' })
  public communal: boolean

  @column({ columnName: 'created_at', serializeAs: 'created_at' })
  //but its a timestamp ??
  public created_at: string

  @column({ columnName: 'description', serializeAs: 'description' })
  public description: string

  @column({ columnName: 'draft_index', serializeAs: 'draftIndex' })
  public draft_index: string
}
