import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Archive from 'App/Models/Archive'

export default class ArchivesController {
  public async add({ request }: HttpContextContract) {
    const address = request.input('address')
    const asset = request.input('asset')
    try {
      const curr_records = await Archive.query()
        .where('user', '=', address)
        .where('asset', '=', asset)
      if (curr_records.length != 0) {
        await Archive.create({
          user: address,
          asset: asset,
        })
      } else {
        return { error: 'That record already exists' }
      }
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  }

  public async delete({ request }: HttpContextContract) {
    const address = request.input('address')
    const asset = request.input('asset')
    try {
      const curr_records = await Archive.query()
        .where('user', '=', address)
        .where('asset', '=', asset)
      if (curr_records.length == 0) {
        return { error: 'Cannot locate that record to delete' }
      }
      await Database.from('archives').where('user', address).where('asset', asset).delete()
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  }

  public async get({ request }: HttpContextContract) {
    const address = request.input('address')
    try {
      const records = Archive.query().where('user', '=', address)
      return { assets: records }
    } catch (error) {
      return { error: error.message }
    }
  }
}
