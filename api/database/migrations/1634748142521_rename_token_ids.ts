import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RenameTokenIds extends BaseSchema {
  protected tableName = 'assets'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('tokenId', 'token_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('token_id', 'tokenId')
    })
  }
}
