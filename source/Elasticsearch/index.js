import Entity from '../index'
import ElasticSearchBatch from '@oudyworks/drivers/ElasticSearch/Batch'

class ElasticSearchEntity extends Entity {
    bind(state, trackChange = true, bindObject = {}) {
        if (state._id) {
            state.id = state._id
            delete state._id
        }
        return super.bind(state, trackChange, bindObject)
    }
    elasticSearchDocument() {
        let document = JSON.parse(this.json())
        delete document.id
        return document
    }
    save(bind) {

        let payload = this.elasticSearchDocument(),
            context = this[Entity.context],
            client = this.constructor[ElasticSearchEntity.client](context),
            index = this.constructor[ElasticSearchEntity._index](context),
            type = this.constructor[ElasticSearchEntity._type](context),
            $return = Promise.resolve(this)

        if (this.id)
            $return = ElasticSearchBatch.update(this.id, payload, client, index, type)
                .then(
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
            $return = ElasticSearchBatch.insert(payload, client, index, type)
                .then(
                    id => {
                        this.id = id
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
    static load(id, context = {}) {
        return this[Entity.validateContext](context).then(
            () => {
                let client = this[ElasticSearchEntity.client](context),
                    index = this[ElasticSearchEntity._index](context),
                    type = this[ElasticSearchEntity._type](context),
                    cache = this[ElasticSearchEntity.cache](context)
                return ElasticSearchBatch.load(id, client, index, type, cache)
                    .then(document => {
                        let instance = new this()
                        instance.bind(document || {}, false)
                        return instance
                    })
            }
        )
    }
    static loadAll(query = { query: { match_all: {} }, limit: 20, page: 1 }, context = {}) {
        return this[Entity.validateContext](context).then(
            () => {
                let client = this[ElasticSearchEntity.client](context),
                    index = this[ElasticSearchEntity._index](context),
                    type = this[ElasticSearchEntity._type](context),
                    cache = this[ElasticSearchEntity.cache](context)
                return ElasticSearchBatch.loadAll(query, client, index, type, cache)
                    .then(result => {
                        result.list = result.list.map(document => {
                            let instance = new this()
                            instance.bind(document || {}, false)
                            return instance
                        })
                        return result
                    })
            }
        )
    }
    static loadMany(ids, context = {}) {
        return this[Entity.validateContext](context).then(
            () => {
                let client = this[ElasticSearchEntity.client](context),
                    index = this[ElasticSearchEntity._index](context),
                    type = this[ElasticSearchEntity._type](context),
                    cache = this[ElasticSearchEntity.cache](context)
                return ElasticSearchBatch.loadMany(ids, client, index, type, cache)
                    .then(result =>
                        result.map(document => {
                            let instance = new this()
                            instance.bind(document || {}, false)
                            return instance
                        }))
            }
        )
    }
    static count(query = { match_all: {} }, context = {}) {
        return this[Entity.validateContext](context).then(
            () => {
                let client = this[ElasticSearchEntity.client](context),
                    index = this[ElasticSearchEntity._index](context),
                    type = this[ElasticSearchEntity._type](context),
                    cache = this[ElasticSearchEntity.cache](context)
                return ElasticSearchBatch.count(query, client, index, type, cache)
            }
        )
    }
    static clear(id, context = {}) {
        return this[Entity.validateContext](context).then(
            () => {
                let client = this[ElasticSearchEntity.client](context),
                    index = this[ElasticSearchEntity._index](context),
                    type = this[ElasticSearchEntity._type](context),
                    cache = this[ElasticSearchEntity.cache](context)
                return ElasticSearchBatch.clear(id, client, index, type, cache)
            }
        )
    }
}

ElasticSearchEntity.client = Symbol('client')
ElasticSearchEntity._index = Symbol('index')
ElasticSearchEntity._type = Symbol('type')
ElasticSearchEntity.cache = Symbol('cache')

ElasticSearchEntity[ElasticSearchEntity.client] = function (context) {
    return 'default'
}
ElasticSearchEntity[ElasticSearchEntity._type] = function (context) {
    return '_doc'
}
ElasticSearchEntity[ElasticSearchEntity._index] = function (context) {
    return this[Entity.context].map(
        key =>
            `${key}_${context[key]}`

    ).concat(this.pluralName.toLowerCase()).join('_')
}
ElasticSearchEntity[ElasticSearchEntity.cache] = function (context) {
    return false
}

export default ElasticSearchEntity