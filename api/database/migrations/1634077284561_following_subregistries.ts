import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class FollowingSubregistries extends BaseSchema {
  protected tableName = 'following_subregistries'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('user').references('users.address').onDelete('CASCADE')
      table.uuid('subregistry').references('subregistries.id').onDelete('CASCADE')
      table.primary(['user', 'subregistry'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
