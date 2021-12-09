import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Subregistries extends BaseSchema {
  protected tableName = 'subregistries'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('name').primary()
      table.string('cover_image')
      table.string('type')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
