const { logger } = require('@vtfk/logger')

const success = (message, raw) => ({ status: 'ok', message, raw })
const warn = (message, raw) => ({ status: 'warning', message, raw })
const error = (message, raw) => ({ status: 'error', message, raw })
const noData = message => ({ status: 'no-data', message })

const test = (id, title, description, validator) => {
  if (typeof validator !== 'function') {
    logger('error', ['testing', id, title, 'No validator was provided'])
    throw new Error(`No validator was provided for test: ${id} (${title})`)
  }

  const result = validator()
  if (result && result.status === 'error') {
    logger('error', ['testing', id, title, result.message])
  }

  return {
    id,
    title,
    description,
    result
  }
}

module.exports.test = test
module.exports.success = success
module.exports.warn = warn
module.exports.error = error
module.exports.noData = noData
