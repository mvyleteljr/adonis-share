import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class SubregistryLinks extends BaseSchema {
  protected tableName = 'subregistry_links'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('subregistry').references('subregistries.id').onDelete('CASCADE')
      table.uuid('linked_sub').references('subregistries.id').onDelete('CASCADE')
      table.primary(['subregistry', 'linked_sub'])
      table.integer('index')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
