import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Collaborators extends BaseSchema {
  protected tableName = 'collaborators'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('subregistry_id').references('subregistries.id').onDelete('CASCADE')
      table.string('user').references('users.address').onDelete('CASCADE')
      table.primary(['subregistry_id', 'user'])
      table.string('permission').notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
