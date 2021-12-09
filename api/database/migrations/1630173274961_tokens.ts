import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Tokens extends BaseSchema {
  protected tableName = 'tokens'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id')
      table.string('subregistry').unsigned().references('subregistries.name').onDelete('CASCADE')
      table.boolean('opensea_description')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
