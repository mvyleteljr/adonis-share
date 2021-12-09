import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CreateAddressToTwitterHandleTables extends BaseSchema {
  protected tableName = 'twitter_handles'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id')
      table.string('address').unique('unique_address')
      table.string('twitter_id')
      table.string('twitter_handle')
      table.string('twitter_image_url')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
