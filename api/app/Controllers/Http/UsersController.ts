import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'
import User from 'App/Models/User'

export default class UsersController {
  public async create({ request }: HttpContextContract) {
    let address: string = request.input('address')
    address = address.toLowerCase()
    let username = request.input('username')
    let coverImage = request.input('coverImage')
    let email = request.input('email')
    let twitter_id = request.input('twitter_id')
    let twitter_handle = request.input('twitter_handle')
    let twitter_image_url = request.input('twitter_image_url')
    if (!twitter_handle) {
      twitter_handle = null
    }
    if (!username) {
      username = null
    }
    if (!coverImage) {
      coverImage = null
    }
    if (!twitter_id) {
      twitter_id = null
    }
    if (!twitter_image_url) {
      twitter_image_url = null
    }
    if (!email) {
      email = null
    }
    const curr_timestamp = require('moment')().format('YYYY-MM-DD HH:mm:ss')
    try {
      const current_user = await User.findBy('address', address)
      if (current_user) {
        return { error: 'User with that address already exists' }
      }
      await User.create({
        address: address,
        username: username,
        cover_image: coverImage,
        email: email,
        twitter_id: twitter_id,
        twitter_handle: twitter_handle,
        twitter_image_url: twitter_image_url,
        created_at: curr_timestamp,
      })
      return { success: true }
    } catch (error) {
      Logger.info({ error }, 'Error creating User: ')
      return { error: error.message }
    }
  }

  public async update({ request }: HttpContextContract) {
    const address = request.input('address')
    let username = request.input('username')
    let coverImage = request.input('cover_image')
    let email = request.input('email')
    let twitter_id = request.input('twitter_id')
    let twitter_handle = request.input('twitter_handle')
    let twitter_image_url = request.input('twitter_image_url')
    interface LooseObject {
      [key: string]: any
    }
    var content: LooseObject = {}
    if (username) {
      content.username = username
    }
    if (coverImage) {
      if (coverImage == 'null') {
        content.cover_image = null
      } else {
        content.cover_image = coverImage
      }
    }
    if (email) {
      if (email == 'null') {
        content.email = null
      } else {
        content.email = email
      }
    }
    if (twitter_id) {
      if (twitter_id == 'null') {
        content.twitter_id = null
      } else {
        content.twitter_id = twitter_id
      }
    }
    if (twitter_handle) {
      if (twitter_handle == 'null') {
        content.twitter_handle = null
      } else {
        content.twitter_handle = twitter_handle
      }
    }
    if (twitter_image_url) {
      if (twitter_image_url == 'null') {
        content.twitter_image_url = null
      } else {
        content.twitter_image_url = twitter_image_url
      }
      content.twitter_image_url = twitter_image_url
    }
    try {
      const current_user = await User.findBy('address', address)
      if (!current_user) {
        return { error: 'User with that address not found' }
      }
      await User.updateOrCreate({ address: address }, content)
      return { success: true }
    } catch (error) {
      Logger.info({ error }, 'Error creating User: ')
      return { error: error.message }
    }
  }

  public async get({ request }: HttpContextContract) {
    const address = request.input('address')
    try {
      const user = await User.findBy('address', address)
      if (!user) {
        return { error: 'User with that address not found' }
      }
      return { user }
    } catch (error) {
      Logger.info({ error }, 'Error creating User: ')
      return { error: error.message }
    }
  }

  public async delete({ request }: HttpContextContract) {
    const address = request.input('address')
    try {
      const user = await User.findBy('address', address)
      if (!user) {
        return { error: 'No user with that address found' }
      }
      await user.delete()
      return { success: true }
    } catch (error) {
      Logger.info({ error }, 'Error creating User: ')
      return { error: error.message }
    }
  }
}
