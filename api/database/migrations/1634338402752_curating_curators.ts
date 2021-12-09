import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CuratingCurators extends BaseSchema {
  protected tableName = 'relationships'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('subregistry_id').references('subregistries.id').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('subregistry_id')
    })
  }
}
