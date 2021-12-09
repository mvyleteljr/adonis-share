import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class SubregistryDescriptions extends BaseSchema {
  protected tableName = 'subregistries'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('description')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('description')
    })
  }
}
