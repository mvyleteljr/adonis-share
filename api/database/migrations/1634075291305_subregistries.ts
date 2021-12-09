import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Subregistries extends BaseSchema {
  protected tableName = 'subregistries'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropPrimary()
      table.uuid('id').primary()
      table.string('curator').references('users.address').onDelete('CASCADE')
      table.boolean('public').notNullable()
      table.boolean('communal').notNullable()
      table.string('type').alter().notNullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('id', 'curator', 'public', 'communal')
      table.string('name').alter().primary()
    })
  }
}
