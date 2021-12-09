import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TimeColumns extends BaseSchema {
  protected tableName = 'time_columns'

  public async up() {
    this.schema.alterTable('subregistries', (table) => {
      table.timestamp('created_at')
    })
    this.schema.alterTable('subregistry_links', (table) => {
      table.timestamp('created_at')
      table.string('description').nullable()
    })
    this.schema.alterTable('subregistry_assets', (table) => {
      table.timestamp('created_at')
    })
  }

  public async down() {
    this.schema.alterTable('subregistries', (table) => {
      table.dropColumn('created_at')
    })
    this.schema.alterTable('subregistry_links', (table) => {
      table.dropColumn('created_at')
      table.dropColumn('description')
    })
    this.schema.alterTable('subregistry_assets', (table) => {
      table.dropColumn('created_at')
    })
  }
}
