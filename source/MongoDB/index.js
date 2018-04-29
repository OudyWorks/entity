import Entity from '../index'
import MongoDBBatch from '@oudyworks/drivers/MongoDB/Batch'

class MongoDBEntity extends Entity {
    bind(state, trackChange = true, bindObject = {}) {
        if(state._id) {
            state.id = state._id
            delete state._id
        }
        return super.bind(state, trackChange, bindObject)
    }
    save(bind) {

        let payload = [],
            context = this[Entity.context],
            collection = this.constructor[MongoDBEntity.collection](context),
            database = this.constructor[MongoDBEntity.database](context)

        if(bind) {

            

        } else {

            if(this.id)
                return MongoDBBatch.update(
                    this.id,
                    this.mongoDBDocument(),
                    collection,
                    database
                )
            
            else
                return MongoDBBatch.insert(
                    this.mongoDBDocument(),
                    collection,
                    database
                ).then(
                    id =>
                        this.id = id
                )

        }

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

MongoDBEntity.collection = Symbol()
MongoDBEntity.database = Symbol()

MongoDBEntity[MongoDBEntity.collection] = function() {
    return this.pluralName.toLowerCase()
}

MongoDBEntity[MongoDBEntity.database] = function() {
    return 'default'
}

export default MongoDBEntity