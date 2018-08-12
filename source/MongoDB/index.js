import Entity from '../index'
import MongoDBBatch from '@oudyworks/drivers/MongoDB/Batch'
import objectPath from 'object-path'
import BuildQuery from './queryBuilder'

class MongoDBEntity extends Entity {
    bind(state, trackChange = true, bindObject = {}) {
        if (state._id) {
            state.id = state._id
            delete state._id
        }
        return super.bind(state, trackChange, bindObject)
    }
    save(bind) {

        let payload = this.mongoDBDocument(),
            context = this[Entity.context],
            collection = this.constructor[MongoDBEntity.collection](context),
            database = this.constructor[MongoDBEntity.database](context),
            $return = Promise.resolve()

        // if (this.id && bind) {
        //     payload = BuildQuery(bind.diff, bind.oldObject, bind.newObject)
        //     if (payload.length == 0)
        //         return $return
        // }

        if (this.id)
            $return = MongoDBBatch.update(
                this.id,
                payload,
                collection,
                database
            ).then(
                () => {
                    if (bind) {
                        this.emit(
                            'update',
                            bind
                        )
                        this.constructor.emit(
                            'update',
                            bind
                        )
                    }
                }
            )

        else
            $return = MongoDBBatch.insert(
                payload,
                collection,
                database
            ).then(
                id => {
                    this.id = id.toHexString()
                    if (bind)
                        bind.id = this.id
                }
            ).then(
                () => {
                    if (bind) {
                        this.emit(
                            'new',
                            bind
                        )
                        this.constructor.emit(
                            'new',
                            bind
                        )
                    }
                }
            )

        return $return.then(
            () => {
                if (bind) {
                    bind.isNew = !bind.oldObject.id
                    this.emit(
                        'save',
                        bind
                    )
                    this.constructor.emit(
                        'save',
                        bind
                    )
                }
                return this.constructor.clear(this.id, context).then(
                    () =>
                        this
                )
            }
        )

    }
    mongoDBDocument() {
        let document = JSON.parse(this.json())
        delete document.id
        return document
    }
    static load(id, context = {}) {
        return this[Entity.validateContext](context).then(
            () => {
                let collection = this[MongoDBEntity.collection](context),
                    database = this[MongoDBEntity.database](context),
                    cache = this[MongoDBEntity.cache](context)
                return MongoDBBatch.load(id, collection, database, cache).then(
                    object => {
                        let instance = new this()
                        instance[Entity.context] = context
                        instance.bind(object || {}, false)
                        return instance
                    }
                )
            }
        )
    }
    static loadAll(query = { query: {}, limit: 20, page: 1 }, context = {}) {
        return this[Entity.validateContext](context).then(
            () => {
                let collection = this[MongoDBEntity.collection](context),
                    database = this[MongoDBEntity.database](context),
                    cache = this[MongoDBEntity.cache](context)
                return MongoDBBatch.loadAll(query, collection, database, cache).then(
                    result => {
                        result.list = result.list.map(
                            document => {
                                let instance = new this()
                                instance[Entity.context] = context
                                instance.bind(document || {}, false)
                                return instance
                            }
                        )
                        return result
                    }
                )
            }
        )
    }
    static loadMany(ids, context = {}) {
        return this[Entity.validateContext](context).then(
            () => {
                let collection = this[MongoDBEntity.collection](context),
                    database = this[MongoDBEntity.database](context),
                    cache = this[MongoDBEntity.cache](context)
                return MongoDBBatch.loadMany(ids, collection, database, cache).then(
                    result => {
                        result.map(
                            document => {
                                let instance = new this()
                                instance[Entity.context] = context
                                instance.bind(document || {}, false)
                                return instance
                            }
                        )
                        return result
                    }
                )
            }
        )
    }
    static count(query = {}, context = {}) {
        return this[Entity.validateContext](context).then(
            () => {
                let collection = this[MongoDBEntity.collection](context),
                    database = this[MongoDBEntity.database](context),
                    cache = this[MongoDBEntity.cache](context)
                return MongoDBBatch.count(query, collection, database, cache)
            }
        )
    }
    static clear(id, context = {}) {
        return this[Entity.validateContext](context).then(
            () => {
                let collection = this[MongoDBEntity.collection](context),
                    database = this[MongoDBEntity.database](context),
                    cache = this[MongoDBEntity.cache](context)
                return MongoDBBatch.clear(id, collection, database, cache)
            }
        )
    }
}

MongoDBEntity.collection = Symbol('collection')
MongoDBEntity.database = Symbol('database')
MongoDBEntity.cache = Symbol('cache')

MongoDBEntity[MongoDBEntity.collection] = function (context) {
    return this[Entity.context].map(
        key =>
            `${key}:${context[key]}`

    ).concat(this.pluralName.toLowerCase()).join(':')
}

MongoDBEntity[MongoDBEntity.database] = function (context) {
    return 'default'
}

MongoDBEntity[MongoDBEntity.cache] = function(context) {
    return false
}

export default MongoDBEntity