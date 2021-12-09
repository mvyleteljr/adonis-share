import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'
import Asset from 'App/Models/Asset'
import { Subregistry } from 'App/Models/Subregistry'
import SubregistryAsset from 'App/Models/SubregistryAsset'
import { v4 } from 'uuid'

export default class SubregistriesController {
  public async create({ request }: HttpContextContract) {
    const name = request.input('name')
    const coverImage = request.input('cover_image')
    const type = request.input('type')
    let curator: string = request.input('curator')
    curator = curator.toLowerCase()
    const is_public = request.input('public')
    const communal = request.input('communal')
    const description = request.input('description')
    const draft_index = request.input('draft_index')
    const exists = await Subregistry.findBy('name', name)
    if (exists) {
      return { error: `A subregistry with name '${name}' already exists` }
    }
    let bool_public = false
    if (is_public == 'true') {
      bool_public = true
    }

    let bool_communal = false
    if (communal == 'true') {
      bool_communal = true
    }
    const curr_timestamp = require('moment')().format('YYYY-MM-DD HH:mm:ss')
    try {
      const subregistry_id = v4()
      await Subregistry.create({
        id: subregistry_id,
        name: name,
        coverImage: coverImage,
        type: type,
        curator: curator,
        public: bool_public,
        communal: bool_communal,
        description: description,
        created_at: curr_timestamp,
        draft_index: draft_index,
      })
      return { success: true }
    } catch (error) {
      Logger.info({ error }, 'Error creating subregistry: ')
      return { error: error.message }
    }
  }

  public async update({ request }: HttpContextContract) {
    const sub_name = request.input('name')
    let coverImage = request.input('cover_image')
    let type = request.input('type')
    let is_public = request.input('public')
    let communal = request.input('communal')
    let description = request.input('description')
    try {
      interface LooseObject {
        [key: string]: any
      }
      var content: LooseObject = {}
      if (coverImage) {
        if (coverImage == 'null') {
          content.cover_image = null
        } else {
          content.cover_image = coverImage
        }
      }
      if (type) {
        content.type = type
      }
      if (is_public) {
        if (is_public == 'true') {
          content.public = true
        } else {
          content.public = false
        }
      }
      if (communal) {
        if (communal == 'true') {
          content.communal = true
        } else {
          content.communal = false
        }
      }
      if (description) {
        if (description == 'null') {
          content.description = null
        } else {
          content.description = description
        }
      }
      const subregistry = await Subregistry.findBy('name', sub_name)
      if (subregistry) {
        await Subregistry.updateOrCreate({ name: sub_name }, content)
        return { success: 'true' }
      } else {
        return {
          error: 'No subregistry exists with that name',
        }
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  public async get({ request }: HttpContextContract) {
    const name = request.input('name')
    try {
      const subregistry = await Subregistry.findBy('name', name)
      if (!subregistry) {
        return { error: `No subregistry found with name: ${name}` }
      }
      const subregistry_attributes = subregistry.$attributes
      const records = await SubregistryAsset.query().where('subregistry', '=', subregistry.id)
      let asset_array: any[] = []
      for (let i = 0; i < records.length; i += 1) {
        let asset_record = await Asset.findBy('uuid', records[i].$original.asset)
        const idx = records[i].$original.index
        const description = records[i].$original.description
        asset_array.push({
          ...asset_record?.$attributes,
          description: description,
          index: idx,
        })
      }
      return {
        ...subregistry_attributes,
        assets: asset_array,
      }
    } catch (error) {
      return { error }
    }
  }

  public async subregistries({ request }: HttpContextContract) {
    const curator = request.input('curator')
    const retrieve_all = request.input('get_all')
    try {
      let subregistries
      if (retrieve_all == 'true') {
        subregistries = await Subregistry.query().where('public', '=', true)
      } else {
        subregistries = await Subregistry.query()
          .where('curator', '=', curator)
          .where('public', '=', true)
      }
      let subregistry_array: any[] = []
      for (let i = 0; i < subregistries.length; i += 1) {
        const current_subregistry = subregistries[i].$attributes.id
        const asset_links = await SubregistryAsset.query().where(
          'subregistry',
          '=',
          current_subregistry
        )
        let asset_array: any[] = []
        for (let j = 0; j < asset_links.length; j += 1) {
          const current_asset = asset_links[j].$attributes.asset
          const full_record = await Asset.findBy('uuid', current_asset)
          const idx = asset_links[j].$attributes.index
          const description = asset_links[j].$attributes.description
          asset_array.push({
            ...full_record?.$attributes,
            description: description,
            index: idx,
          })
        }
        subregistry_array.push({
          subregistry: subregistries[i].$attributes,
          assets: asset_array,
        })
      }
      return { subregistries: subregistry_array }
    } catch (error) {
      return { error: error.message }
    }
  }

  public async get_draft({ request }: HttpContextContract) {
    const curator = request.input('curator')
    const draft_index = request.input('draft_index')
    try {
      const subregistry = await Subregistry.query()
        .where('curator', '=', curator)
        .where('draft_index', '=', draft_index)
      if (subregistry.length == 0) {
        return { error: `No draft found for curator: ${curator} and index: ${draft_index} ` }
      }
      const subregistry_attributes = subregistry[0].$attributes
      const records = await SubregistryAsset.query().where('subregistry', '=', subregistry[0].id)
      let asset_array: any[] = []
      for (let i = 0; i < records.length; i += 1) {
        let asset_record = await Asset.findBy('uuid', records[i].$original.asset)
        const idx = records[i].$original.index
        const description = records[i].$original.description
        asset_array.push({
          ...asset_record?.$attributes,
          description: description,
          index: idx,
        })
      }
      return {
        ...subregistry_attributes,
        assets: asset_array,
      }
    } catch (error) {
      return { error }
    }
  }

  public async delete({ request }: HttpContextContract) {
    const name = request.input('name')
    try {
      const subregistry = await Subregistry.findBy('name', name)
      if (!subregistry) {
        return { error: `No subregistry found with name: ${name}` }
      }
      subregistry.delete()
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  }

  public async allDrafts({ request }: HttpContextContract) {
    let curator: string = request.input('curator')
    curator = curator.toLowerCase()
    try {
      const drafts = await Subregistry.query()
        .where('curator', '=', curator)
        .where('public', '=', false)
      if (drafts.length == 0) {
        return { error: `No drafts found for curator: ${curator}` }
      }
      let draft_array: any[] = []
      for (let i = 0; i < drafts.length; i += 1) {
        const current_draft = drafts[i].$attributes
        const assets = await SubregistryAsset.query().where('subregistry', '=', current_draft.id)
        const num_assets = assets.length
        draft_array.push({
          ...current_draft,
          num_assets: num_assets,
        })
      }
      return { drafts: draft_array }
    } catch (error) {
      return { error: error.message }
    }
  }

  public async total_registries({ request }: HttpContextContract) {
    let curator: string = request.input('curator')
    curator = curator.toLowerCase()
    try {
      const subregistries = await Subregistry.query().where('curator', '=', curator)
      if (subregistries.length == 0) {
        return { error: `No subregistries found for curator: ${curator}` }
      }
      return { num_subregistries: subregistries.length }
    } catch (error) {
      return { error: error.message }
    }
  }
}
