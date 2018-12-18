const {
  $pluralName,
  $validateContext,
  $context
} = Entity = require('@oudy/entity'),
  {
    ObjectID,
    IDRegex
  } = MongoDB = require('@oudy/mongodb'),
  $database = Symbol('database'),
  $collection = Symbol('collection'),
  $loaded = Symbol('loaded'),
  $id = Symbol('id'),
  MongoDBBatch = require('@oudy/mongodb/batch');

class MongoDBEntity extends Entity {
  constructor() {
    super()
    this[$loaded] = false
    this[$id] = undefined
  }
  bind(state, trackChange = true, bindObject = {}) {
    if (state._id) {
      state.id = state._id.toHexString && state._id.toHexString() || state._id
      delete state._id
    }
    return super.bind(state, trackChange, bindObject)
  }
  save(bind) {
    const database = this.constructor[$database](this[$context]),
      collection = this.constructor[$collection](this[$context])
    if (this.id)
      return MongoDBBatch.update(this.id, this.mongoDBDocument(), collection, database)
    else if (this[$id])
      return MongoDBBatch.upsert(this[$id], this.mongoDBDocument(), collection, database).then(
        () =>
          this.id = this[$id]
      )
    else
      return MongoDBBatch.insert(this.mongoDBDocument(), collection, database).then(
        id =>
          this.id = id
      )
  }
  mongoDBDocument() {
    let document = JSON.parse(this.json())
    delete document.id
    return document
  }
  static load(id, context = {}) {
    return this[$validateContext](context).then(
      context => {
        const database = this[$database](context),
          collection = this[$collection](context)
        return MongoDBBatch.load(id, collection, database).then(
          document => {
            const instance = new this()
            instance[$context] = context
            instance.bind(document || {}, false)
            instance[$id] = id
            if (document)
              instance[$loaded] = true
            return instance
          }
        )
      }
    )
  }
}

MongoDBEntity[$database] = function () {
  return 'default'
}
MongoDBEntity[$collection] = function () {
  return this[$pluralName]().toLowerCase()
}

module.exports = MongoDBEntity

Object.assign(
  module.exports,
  {
    $database,
    $collection
  }
)