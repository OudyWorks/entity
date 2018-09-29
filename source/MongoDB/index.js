import Entity from '../index'
import MongoDBBatch from '@oudyworks/drivers/MongoDB/Batch'
import BuildQuery from './queryBuilder'

class MongoDBEntity extends Entity {
    constructor() {
        super()
        this[MongoDBEntity.loaded] = false
        this[MongoDBEntity.id] = undefined
    }
    bind(state, trackChange = true, bindObject = {}) {
        if (state._id) {
            state.id = state._id
            delete state._id
        }
        return super.bind(state, trackChange, bindObject)
    }

    upsert(bind) {
        let payload = this.mongoDBDocument(),
            context = this[Entity.context],
            collection = this.constructor[MongoDBEntity.collection](context),
            database = this.constructor[MongoDBEntity.database](context),
            $return = MongoDBBatch.upsert(this.id, payload, collection, database)

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

    save(bind) {

        let payload = this.mongoDBDocument(),
            context = this[Entity.context],
            collection = this.constructor[MongoDBEntity.collection](context),
            database = this.constructor[MongoDBEntity.database](context),
            $return = Promise.resolve(this)

        if (this.constructor[MongoDBEntity.useBind] && this.id && bind) {
            payload = BuildQuery(bind.diff, bind.oldObject, bind.newObject)
            if (payload.length == 0)
                return $return
        }

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
                    this.id = id.toString()
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
    mongoDBDocument(noID = false) {
        let document = JSON.parse(this.json())
        if(this.constructor[MongoDBEntity.customID](this[Entity.context]) && !noID)
            document._id = this[MongoDBEntity.id] || document.id
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
                        instance[MongoDBEntity.id] = id
                        if(object)
                            instance[MongoDBEntity.loaded] = true
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
                                instance[MongoDBEntity.loaded] = true
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
                        return result.map(
                            (document, i) => {
                                let instance = new this()
                                instance[Entity.context] = context
                                instance.bind(document || {}, false)
                                instance[MongoDBEntity.id] = ids[i]
                                if(document)
                                    instance[MongoDBEntity.loaded] = true
                                return instance
                            }
                        )
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
MongoDBEntity.customID = Symbol('customID')
MongoDBEntity.loaded = Symbol('loaded')
MongoDBEntity.id = Symbol('id')

MongoDBEntity[MongoDBEntity.collection] = function (context) {
    return this[Entity.context].map(
        key =>
            `${key}:${context[key]}`

    ).concat(this.pluralName.toLowerCase()).join(':')
}

MongoDBEntity[MongoDBEntity.database] = function (context) {
    return 'default'
}

MongoDBEntity[MongoDBEntity.cache] = function (context) {
    return false
}
MongoDBEntity[MongoDBEntity.customID] = function (context) {
    return false
}

export default MongoDBEntity