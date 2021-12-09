import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Archives extends BaseSchema {
  protected tableName = 'archives'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('user').references('users.address').onDelete('CASCADE')
      table.uuid('asset').references('assets.uuid').onDelete('CASCADE')
      table.primary(['user', 'asset'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
