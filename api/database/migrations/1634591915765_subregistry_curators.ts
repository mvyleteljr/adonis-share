import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class SubregistryCurators extends BaseSchema {
  protected tableName = 'subregistries'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('curator').alter().notNullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('curator').alter().nullable()
    })
  }
}
