import { Router } from 'express'
import { assertValid } from 'frisker'
import { ADAPTERS } from '../../common/adapters'
import { store } from '../db'
import { loggedIn } from './auth'
import { handle, StatusError } from './handle'

const router = Router()

const getProfile = handle(async ({ userId }) => {
  const profile = await store.users.getProfile(userId!)
  return profile
})

const getConfig = handle(async ({ userId }) => {
  const user = await store.users.getUser(userId!)
  return user
})

const register = handle(async (req) => {
  assertValid({ handle: 'string', username: 'string', password: 'string' }, req.body)
  const { profile, token, user } = await store.users.createUser(req.body)
  return { profile, token, user }
})

const login = handle(async (req) => {
  assertValid({ username: 'string', password: 'string' }, req.body)
  const result = await store.users.authenticate(req.body.username, req.body.password)

  if (!result) {
    throw new StatusError('Unauthorized', 401)
  }

  return result
})

const updateConfig = handle(async ({ userId, body }) => {
  assertValid(
    {
      novelApiKey: 'string',
      novelModel: 'string',
      koboldUrl: 'string',
      defaultAdapter: ADAPTERS,
    },
    body
  )

  const user = await store.users.updateUser(userId!, {
    defaultAdapter: body.defaultAdapter,
    koboldUrl: body.koboldUrl,
    novelApiKey: body.novelApiKey,
    novelModel: body.novelModel,
  })

  return user
})

const updateProfile = handle(async ({ userId, body }) => {
  assertValid({ handle: 'string', avatar: 'string?' }, body)

  const profile = await store.users.updateProfile(userId!, {
    avatar: body.avatar,
    handle: body.handle,
  })

  return profile
})

router.get('/', loggedIn, getProfile)
router.get('/config', loggedIn, getConfig)
router.post('/register', register)
router.post('/login', login)
router.post('/config', loggedIn, updateConfig)
router.post('/profile', loggedIn, updateProfile)

export default router