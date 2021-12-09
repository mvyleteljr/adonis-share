import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Relationships extends BaseSchema {
  protected tableName = 'relationships'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('follower').references('users.address').onDelete('CASCADE')
      table.string('followed').references('users.address').onDelete('CASCADE')
      table.primary(['follower', 'followed'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
