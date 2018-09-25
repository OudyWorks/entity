import Entity from '../index'
import { default as Elasticsearch } from '@oudyworks/drivers/ElasticSearch'

class ElasticsearchEntity extends Entity {
    bind(state, trackChange = true, bindObject = {}) {
        if (state._id) {
            state.id = state._id
            delete state._id
        }
        return super.bind(state, trackChange, bindObject)
    }
    elasticsearchDocument() {
        let document = JSON.parse(this.json())
        delete document.id
        return document
    }
    save(bind) {

        let payload = this.elasticsearchDocument(),
            context = this[Entity.context],
            client = this.constructor[ElasticsearchEntity.client](context),
            index = this.constructor[ElasticsearchEntity.index](context),
            type = this.constructor[ElasticsearchEntity._type](context),
            $return = Promise.resolve(this)

        if (this.id)
            $return = Elasticsearch.getClient(client).update({
                index,
                type,
                id: this.id,
                body: {
                    doc: bind.newObject
                }
            }).then(
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
            $return = Elasticsearch.getClient(client).index({
                index,
                type,
                body: payload
            }).then(
                ({ _id }) => {
                    this.id = _id
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
                return this
            }
        )

    }
    static load(id, context = {}) {
        if (!id) {
            return Promise.resolve(new this())
        }
        return this[Entity.validateContext](context).then(
            () => {
                let client = this[ElasticsearchEntity.client](context),
                    index = this[ElasticsearchEntity.index](context),
                    type = this[ElasticsearchEntity._type](context)
                return Elasticsearch.getClient(client).get({ index, type, id })
                    .then(object => {
                        let instance = new this()
                        instance[Entity.context] = context
                        object._source.id = object._id
                        instance.bind(object._source || {}, false)
                        return instance
                    })
            }
        )
    }
    static loadAll(query = { query: { match_all: {} }, limit: 20, page: 1 }, context = {}) {
        return this[Entity.validateContext](context).then(
            () => {
                let client = this[ElasticsearchEntity.client](context),
                    index = this[ElasticsearchEntity.index](context),
                    type = this[ElasticsearchEntity._type](context)
                return Elasticsearch.getClient(client).search({
                    index,
                    type,
                    size: query.limit,
                    from: query.limit * (query.page - 1),
                    body: {
                        query: query.query
                    }
                }).then(
                    result => {
                        return {
                            list: result.hits.hits.map(
                                document => {
                                    let instance = new this()
                                    instance[Entity.context] = context
                                    document._source.id = document._id
                                    instance.bind(document._source || {}, false)
                                    return instance
                                }
                            ),
                            total: result.hits.total,
                            page: query.page,
                            limit: query.limit
                        }
                    }
                )
            }
        )
    }
    static loadMany(ids, context = {}) {
        return this[Entity.validateContext](context).then(
            () => {
                let client = this[ElasticsearchEntity.client](context),
                    index = this[ElasticsearchEntity.index](context),
                    type = this[ElasticsearchEntity._type](context)
                return Elasticsearch.getClient(client).mget({
                    index,
                    type,
                    body: {
                        ids
                    }
                }).then(({ docs }) => {
                    return docs.map(object => {
                        let instance = new this()
                        instance[Entity.context] = context
                        object._source.id = object._id
                        instance.bind(object._source || {}, false)
                        return instance
                    })
                })
            }
        )
    }
    static count(query = { match_all: {} }, context = {}) {
        return this[Entity.validateContext](context).then(
            () => {
                let client = this[ElasticsearchEntity.client](context),
                    index = this[ElasticsearchEntity.index](context),
                    type = this[ElasticsearchEntity._type](context)
                return Elasticsearch.getClient(client).count({
                    index,
                    type,
                    body: {
                        query
                    }
                }).then(({ count }) => count)
            }
        )
    }
}

ElasticsearchEntity.client = Symbol('client')
ElasticsearchEntity.index = Symbol('index')
ElasticsearchEntity._type = Symbol('type')

ElasticsearchEntity[ElasticsearchEntity.client] = function (context) {
    return 'default'
}
ElasticsearchEntity[ElasticsearchEntity._type] = function (context) {
    return '_doc'
}
ElasticsearchEntity[ElasticsearchEntity.index] = function (context) {
    return this[Entity.context].map(
        key =>
            `${key}:${context[key]}`

    ).concat(this.pluralName.toLowerCase()).join(':')
}

export default ElasticsearchEntity