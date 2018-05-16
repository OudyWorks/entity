import Entity from '../index'
import MongoDBBatch from '@oudyworks/drivers/MongoDB/Batch'
import objectPath from 'object-path'

class MongoDBEntity extends Entity {
    bind(state, trackChange = true, bindObject = {}) {
        if(state._id) {
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

        if(this.id && bind) {

            let $set = {},
                $unset = {},
                $pullAll = {}

            Object.keys(bind.difference).forEach(
                key => {

                    if(bind.difference[key] === undefined) {
                        if(key.match(/\.\d+$/)) {
                            if(!$pullAll[key.replace(/\.\d+$/, '')])
                                $pullAll[key.replace(/\.\d+$/, '')] = []
                            $pullAll[key.replace(/\.\d+$/, '')].push(
                                objectPath.get(bind.oldObject, key)
                            )
                        } else
                            $unset[key] = true
                    } else
                        $set[key] = objectPath.get(bind.newObject, key)

                }
            )

            $set = Object.keys($set).length ? $set : undefined,
            $unset = Object.keys($unset).length ? $unset : undefined
            $pullAll = Object.keys($pullAll).length ? $pullAll : undefined
            
            payload = [
                {$set},
                {$unset},
                {$pullAll}
            ]
        
            if($set === undefined && $unset === undefined && $pullAll === undefined)
                return $return

        }


        if(this.id)
            $return = MongoDBBatch.update(
                this.id,
                payload,
                collection,
                database
            ).then(
                () => {
                    if(bind) {
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
                id =>
                    this.id = id
            ).then(
                () => {
                    if(bind) {
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
                if(bind) {
                    this.emit(
                        'save',
                        bind
                    )
                    this.constructor.emit(
                        'save',
                        bind
                    )
                }
            }
        )

    }
    mongoDBDocument() {
        let document = JSON.parse(this.json())
        delete document.id
        return document
    }
    static load(id, context = {}) {
        let collection = this[MongoDBEntity.collection](context),
            database = this[MongoDBEntity.database](context)
        return MongoDBBatch.load(id, collection, database).then(
            object => {
                let instance = new this()
                instance[Entity.context] = context
                instance.bind(object || {}, false)
                return instance
            }
        )
    }
    static loadAll(query = {query: {}, limit: 20, page: 1}, context = {}) {
        let collection = this[MongoDBEntity.collection](context),
            database = this[MongoDBEntity.database](context)
        return MongoDBBatch.loadAll(query, collection, database).then(
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
    static clear(id, context = {}) {
        let collection = this[MongoDBEntity.collection](context),
            database = this[MongoDBEntity.database](context)
        return MongoDBBatch.clear(id, collection, database)
    }
}

MongoDBEntity.collection = Symbol('collection')
MongoDBEntity.database = Symbol('database')

MongoDBEntity[MongoDBEntity.collection] = function(context) {
    return this[Entity.context].map(
        key =>
            `${key}:${context[key]}`

    ).concat(this.pluralName.toLowerCase()).join(':')
}

MongoDBEntity[MongoDBEntity.database] = function() {
    return 'default'
}

export default MongoDBEntity