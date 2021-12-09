import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserTimestamps extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('created_at')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('created_at')
    })
  }
}
