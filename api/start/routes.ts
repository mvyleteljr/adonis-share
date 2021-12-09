/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes/index.ts` as follows
|
| import './cart'
| import './customer'
|
*/

import HealthCheck from '@ioc:Adonis/Core/HealthCheck'
import Route from '@ioc:Adonis/Core/Route'
import AssetsController from 'App/Controllers/Http/AssetsController'
import LoginController from 'App/Controllers/Http/LoginController'

import { AssetForContractAndTokenId, AssetsForAddress, TopTwentyAssets } from '../routes/Assets'
import { ConnectTwitterOAuth, InitializeTwitterOAuth } from '../routes/OAuth'
import { RaribleAssetForItemId, RaribleAssetForOwner } from '../routes/Rarible'
// import { CreateSubregistry, GetSubregistry, UpdateSubregistry } from '../routes/Subregistry'
import { GetTwitterHandleForAddress } from '../routes/TwitterHandle'

Route.get('health', async ({ response }) => {
  const report = await HealthCheck.getReport()

  return report.healthy ? response.ok(report) : response.badRequest(report)
})

// Assets
Route.get('/fetch', AssetsForAddress)
Route.get('/fetch/top-20', TopTwentyAssets)
Route.get('/fetch/:address', AssetsForAddress)
Route.get('/fetch/:tokenContract/:tokenId', AssetForContractAndTokenId)

// Rarible Asset Retrieval
Route.get('/r-asset/:contract/:tokenID', RaribleAssetForItemId)
Route.get('r-asset/:owner', RaribleAssetForOwner)

// Twitter
Route.post('/twitter/initialize', InitializeTwitterOAuth)
Route.post('/twitter/connect', ConnectTwitterOAuth)

Route.get('/twitter/:address/handle', GetTwitterHandleForAddress)

// Archives
Route.post('/archive/add', 'ArchivesController.add')
Route.get('/archive/', 'ArchivesController.get')
Route.delete('/archive/delete', 'ArchivesController.delete')

// Subregistry -- NEW
Route.post('/subregistry/create', 'SubregistriesController.create')
Route.post('/subregistry/update', 'SubregistriesController.update')
Route.get('/subregistry/', 'SubregistriesController.get')
Route.get('/subregistry/draft', 'SubregistriesController.get_draft').middleware('auth')
Route.delete('/subregistry/delete', 'SubregistriesController.delete')
Route.get('/drafts', 'SubregistriesController.allDrafts').middleware('auth')
Route.get('/subregistry/total', 'SubregistriesController.total_registries')
Route.get('/subregistry/all', 'SubregistriesController.subregistries')

// User -- NEW
Route.post('/user/create', 'UsersController.create')
Route.post('/user/update', 'UsersController.update')
Route.get('/user/', 'UsersController.get')
Route.delete('/user/delete', 'UsersController.delete')

// Assets -- NEW
Route.post('/assets/add', 'AssetsController.add')
Route.post('/assets/update', 'AssetsController.update')
Route.delete('/assets/delete', 'AssetsController.remove')
Route.get('/assets/all', 'AssetsController.all')
Route.post('/assets/link', 'AssetsController.update_link')

// Archive -- NEW
// Route.post('/archive/update', 'ArchivesController.update')
// Route.get('/archive/', 'ArchivesController.get')

Route.post('/uploadFile', 'UploadsController.upload')

// SIWE - NEW
Route.get('/siwe/nonce', 'LoginController.nonce')
Route.post('/siwe/message', 'LoginController.create_message')
Route.post('/siwe/sign_in', 'LoginController.sign_in')
Route.get('/siwe/sign_out', 'LoginController.sign_out')
Route.get('/siwe/hasSession', 'LoginController.hasSession')
