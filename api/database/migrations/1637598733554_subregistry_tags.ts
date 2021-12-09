import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class SubregistryTags extends BaseSchema {
  protected tableName = 'subregistry_tags'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('subregistry')
      table.string('tag')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
