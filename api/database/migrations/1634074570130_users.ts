import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.renameTable('twitter_handles', this.tableName)
    this.schema.alterTable(this.tableName, (table) => {
      table.string('address').alter().primary()
      table.dropColumn('id')
      table.string('username')
      table.string('email')
      table.string('cover_image')
    })
  }

  public async down() {
    this.schema.renameTable(this.tableName, 'twitter_handles')
    this.schema.alterTable('twitter_handles', (table) => {
      table.dropColumns('username', 'email', 'cover_image')
      table.string('id')
      table.dropPrimary()
    })
  }
}
