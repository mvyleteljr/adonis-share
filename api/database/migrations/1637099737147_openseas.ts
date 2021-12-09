import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Openseas extends BaseSchema {
  protected tableName = 'subregistry_assets'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('OS_description')
      table.renameColumn('description', 'note')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('OS_description')
      table.renameColumn('note', 'description')
    })
  }
}
