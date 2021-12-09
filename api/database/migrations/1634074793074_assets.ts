import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Assets extends BaseSchema {
  protected tableName = 'assets'

  public async up() {
    this.schema.alterTable('tokens', (table) => {
      table.dropColumn('id')
      table.dropColumn('opensea_description')
      table.dropForeign(['subregistry'])
      table.dropColumn('subregistry')
      table.uuid('uuid').primary()
      table
        .enu('type', ['TOKEN', 'COLLECTION'], {
          useNative: true,
          enumName: 'asset_type',
          existingType: false,
        })
        .notNullable()
      table.string('name')
      table.string('contract').notNullable()
      table.string('tokenId')
      table.string('creator')
      table.string('owner')
      table.string('chain')
    })
    this.schema.renameTable('tokens', this.tableName)
  }

  public async down() {
    this.schema.renameTable(this.tableName, 'tokens')
    this.schema.alterTable('tokens', (table) => {
      this.schema.raw('DROP TYPE IF EXISTS "asset_type"')
      table.dropPrimary()
      table.dropColumns('uuid', 'type', 'name', 'contract', 'tokenId', 'creator', 'owner', 'chain')
      table.boolean('opensea_description')
      table.string('subregistry').unsigned().references('subregistries.name').onDelete('CASCADE')
      table.string('id')
    })
  }
}
