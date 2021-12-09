import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Asset from 'App/Models/Asset'
import { Subregistry } from 'App/Models/Subregistry'
import SubregistryAsset from 'App/Models/SubregistryAsset'
import { v4 } from 'uuid'

async function checkCollisions(subregistry: any, assets: any): Promise<boolean> {
  for (let i = 0; i < assets.length; i += 1) {
    let current_asset = assets[i]
    const index = current_asset.index
    const records = await SubregistryAsset.query()
      .where('subregistry', '=', subregistry.id)
      .where('index', index)
    if (records.length > 0) {
      const asset_uuid = records[0].$attributes.asset
      const stored_asset = await Asset.findBy('uuid', asset_uuid)
      if (stored_asset) {
        if (
          stored_asset.contract == current_asset.contract &&
          stored_asset.token_id == current_asset.token_id
        ) {
          continue
        }
        return true
      }
    }
  }
  return false
}

export default class AssetsController {
  public async add({ request }: HttpContextContract) {
    const body = request.all()
    const subregistry_name = request.input('subregistry')
    try {
      const subregistry = await Subregistry.findBy('name', subregistry_name)
      if (!subregistry) {
        return { error: `Subregistry with name '${subregistry_name}' not found` }
      }
      // collision check
      const collisions = await checkCollisions(subregistry, body.assets)
      if (collisions) {
        return { error: 'One of the assets has an index that has already been assigned' }
      }
      for (let i = 0; i < body.assets.length; i += 1) {
        let current_asset = body.assets[i]
        let use_opensea = true
        if (current_asset.OS_description == 'false') {
          use_opensea = false
        }
        const curr_time = require('moment')().format('YYYY-MM-DD HH:mm:ss')
        const note = current_asset.note
        const index = current_asset.index
        delete current_asset.note
        delete current_asset.index
        let asset_id
        // asset exists
        const asset_records = await Asset.query()
          .where('contract', '=', current_asset.contract)
          .where('token_id', '=', current_asset.token_id)
        if (asset_records.length == 0) {
          // if asset does not exist, we create the asset and make the link
          asset_id = v4()
          current_asset.uuid = asset_id
          await Asset.create(current_asset)
        } else {
          // if asset DOES exist we verify that it has not already been linked
          asset_id = asset_records[0].$attributes.uuid
          const linked = await SubregistryAsset.query()
            .where('subregistry', '=', subregistry.id)
            .where('asset', '=', asset_id)
          if (linked.length > 0) {
            return { error: 'Asset already in subregistry' }
            // // If it is already linked - update the link
            // const searchCriteria = {
            //   subregistry: subregistry.id,
            //   asset: asset_id,
            // }
            // const payload = {
            //   subregistry: subregistry.id,
            //   asset: asset_id,
            //   note: note,
            //   OS_description: use_opensea,
            //   index: index,
            //   created_at: curr_time,
            // }
            // await SubregistryAsset.updateOrCreate(searchCriteria, payload)
            // continue
          }
        }
        await SubregistryAsset.create({
          subregistry: subregistry.id,
          asset: asset_id,
          note: note,
          OS_description: use_opensea,
          index: index,
          created_at: curr_time,
        })
      }
      return { success: 'true' }
    } catch (error) {
      return { error: error.message }
    }
  }

  public async update({ request }: HttpContextContract) {
    // additive updates
    const contract = request.input('contract')
    let token_id = request.input('token_id')
    if (!token_id) {
      token_id = null
    }
    const name = request.input('name')
    const owner = request.input('owner')
    interface LooseObject {
      [key: string]: any
    }

    var content: LooseObject = {}
    try {
      const asset_record = await Asset.query()
        .where('contract', '=', contract)
        .where('token_id', '=', token_id)

      const asset_uuid = asset_record[0].$attributes.uuid
      if (name) {
        content.name = name
      }
      if (owner) {
        content.owner = owner
      }
      await Asset.updateOrCreate({ uuid: asset_uuid }, content)
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  }

  public async remove({ request }: HttpContextContract) {
    const subregistry = request.input('subregistry')
    const body = request.all()
    const assets = body.assets

    try {
      const subregistry_record = await Subregistry.findBy('name', subregistry)
      const subregistry_id = subregistry_record?.$attributes.id
      for (let i = 0; i < assets.length; i += 1) {
        const to_delete = await SubregistryAsset.query()
          .where('subregistry', subregistry_id)
          .where('index', assets[i])
        if (to_delete.length == 1) {
          await to_delete[0].delete()
        } else if (to_delete.length > 1) {
          return { error: 'There are multiple assets at that index (collision uncaught error)' }
        } else {
          return { error: 'No record for that asset exists for this subregistry' }
        }
        return { success: true }
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  public async all({ request }: HttpContextContract) {
    try {
      const records = await Asset.all()
      return {
        assets: records,
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  public async update_link({ request }: HttpContextContract) {
    const subregistry_name = request.input('subregistry')
    let body = request.all()
    try {
      const subregistry_record = await Subregistry.findBy('name', subregistry_name)
      const subregistry_id = subregistry_record?.$attributes.id
      let asset_ids: any[] = []
      for (let j = 0; j < body.assets.length; j += 1) {
        const current_asset_index = body.assets[j].index
        const record = await SubregistryAsset.query()
          .where('subregistry', '=', subregistry_id)
          .where('index', '=', current_asset_index)
        if (record.length > 1) {
          return { error: 'Duplicate Error!' }
        }
        if (record.length == 0) {
          return { error: 'No asset found for that subregistry with that index' }
        }
        asset_ids.push(record[0].$attributes.asset)
      }
      for (let i = 0; i < body.assets.length; i += 1) {
        const current_asset = body.assets[i]
        const current_asset_id = asset_ids[i]
        interface LooseObject {
          [key: string]: any
        }
        var content: LooseObject = {}
        if (current_asset.content.new_idx || current_asset.content.new_idx == 0) {
          content.index = current_asset.content.new_idx
        }

        if (current_asset.content.note) {
          content.note = current_asset.content.note
        }

        if (current_asset.content.OS_description) {
          if (current_asset.content.OS_description == 'false') {
            content.OS_description = false
          } else {
            content.OS_description = true
          }
        }
        await SubregistryAsset.query()
          .where('subregistry', '=', subregistry_id)
          .where('asset', '=', current_asset_id)
          .update(content)
      }
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  }
}
