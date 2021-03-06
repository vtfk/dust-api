const { logger } = require('@vtfk/logger')
const mongo = require('./get-mongo')
const { DEMO_SKIP_DB } = require('../../config')

module.exports.newRequest = async request => {
  const { instanceId, systems, user } = request
  const data = {
    instanceId,
    user,
    started: new Date().toISOString(),
    finished: null,
    systems: systems.map(system => { return { name: system, tests: [] } })
  }

  if (DEMO_SKIP_DB) {
    logger('warn', ['handle-mongo', 'new-request', 'DEMO'])
    return data
  }

  const db = await mongo()
  logger('info', ['handle-mongo', 'new-request', 'start'])
  const result = await db.insertOne(data)
  logger('info', ['handle-mongo', 'new-request', 'finish'])
  return result ? data : result
}

module.exports.updateRequest = async request => {
  const { instanceId, name, data, user, status, error, innerError, test, timestamp } = request
  const setQuery = { $set: {} }
  const filter = { instanceId }

  if (data !== undefined) setQuery.$set['systems.$.data'] = data
  if (status !== undefined) setQuery.$set['systems.$.status'] = status
  if (error !== undefined) setQuery.$set['systems.$.error'] = error
  if (innerError !== undefined) setQuery.$set['systems.$.innerError'] = innerError
  if (user !== undefined) setQuery.$set.user = user
  if (timestamp !== undefined) setQuery.$set.finished = timestamp
  if (test !== undefined) setQuery.$set['systems.$.tests'] = test
  if (name !== undefined) filter['systems.name'] = name

  if (Object.getOwnPropertyNames(setQuery.$set).length === 0) {
    logger('warn', ['handle-mongo', 'update-request', 'finish', 'nothing to do...'])
    return false
  }

  if (DEMO_SKIP_DB) {
    logger('warn', ['handle-mongo', 'update-request', 'DEMO'])
    return setQuery
  }

  const db = await mongo()
  logger('info', ['handle-mongo', 'update-request', 'start'])
  const result = await db.updateOne(
    filter,
    {
      ...setQuery
    }
  )
  logger('info', ['handle-mongo', 'update-request', 'finish', result.modifiedCount])
  return result.modifiedCount > 0 ? setQuery : false
}

module.exports.getRequest = async instanceId => {
  const db = await mongo()
  logger('info', ['handle-mongo', 'get-request', 'start'])
  const result = await db.findOne({ instanceId })
  logger('info', ['handle-mongo', 'get-request', 'finish'])
  return result
}
