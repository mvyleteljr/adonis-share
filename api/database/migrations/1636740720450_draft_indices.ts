import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DraftIndices extends BaseSchema {
  protected tableName = 'subregistries'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('draft_index')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('draft_index')
    })
  }
}
