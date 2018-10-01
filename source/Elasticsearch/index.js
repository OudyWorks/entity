import Entity, { $context, $validateContext } from '../index'
import ElasticSearchBatch from '@oudyworks/drivers/ElasticSearch/Batch'

const $client = Symbol('client')
const $index = Symbol('index')
const $type = Symbol('type')
const $cache = Symbol('cache')

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
            context = this[$context],
            client = this.constructor[$client](context),
            index = this.constructor[$index](context),
            type = this.constructor[$type](context),
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
        return this[$validateContext](context).then(
            () => {
                let client = this[$client](context),
                    index = this[$index](context),
                    type = this[$type](context),
                    cache = this[$cache](context)
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
        return this[$validateContext](context).then(
            () => {
                let client = this[$client](context),
                    index = this[$index](context),
                    type = this[$type](context),
                    cache = this[$cache](context)
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
        return this[$validateContext](context).then(
            () => {
                let client = this[$client](context),
                    index = this[$index](context),
                    type = this[$type](context),
                    cache = this[$cache](context)
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
        return this[$validateContext](context).then(
            () => {
                let client = this[$client](context),
                    index = this[$index](context),
                    type = this[$type](context),
                    cache = this[$cache](context)
                return ElasticSearchBatch.count(query, client, index, type, cache)
            }
        )
    }
    static clear(id, context = {}) {
        return this[$validateContext](context).then(
            () => {
                let client = this[$client](context),
                    index = this[$index](context),
                    type = this[$type](context),
                    cache = this[$cache](context)
                return ElasticSearchBatch.clear(id, client, index, type, cache)
            }
        )
    }
}

ElasticSearchEntity[$client] = function (context) {
    return 'default'
}
ElasticSearchEntity[$type] = function (context) {
    return '_doc'
}
ElasticSearchEntity[$index] = function (context) {
    return this[$context].map(
        key =>
            `${key}_${context[key]}`

    ).concat(this.pluralName.toLowerCase()).join('_')
}
ElasticSearchEntity[$cache] = function (context) {
    return false
}

export default ElasticSearchEntity
export { $client, $index, $type, $cache }