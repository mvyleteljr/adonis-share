import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class SubregistryAssets extends BaseSchema {
  protected tableName = 'subregistry_assets'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('subregistry').references('subregistries.id').onDelete('CASCADE')
      table.uuid('asset').references('assets.uuid').onDelete('CASCADE')
      table.primary(['subregistry', 'asset'])
      table.string('description')
      table.integer('index')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
