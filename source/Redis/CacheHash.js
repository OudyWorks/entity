import RedisDBBatch from '@oudyworks/drivers/Redis/Batch'
import objectPath from 'object-path'

class CacheHash {
    static use(Entity) {

        Entity[this.key] = function(key = 'id', context = {}) {

            return this[Entity.context].map(
                key =>
                    `${key}:${context[key]}`
        
            ).concat(this.pluralName.toLowerCase(), key != 'id' ? `key:${key}` : undefined).filter(e => e).join(':')
    
        }

        Entity[this.client] = function(context) {
            return 'default'
        }

        Entity.isExistInCacheHash = async function(key, value, context = {}) {
            
            await this[Entity.validateContext](context)

            let KEY = this[CacheHash.key](key, context),
                CLIENT = this[CacheHash.client](context)

            if(key == 'id')
                return RedisDBBatch.sismember(KEY, value, CLIENT)
            else
                return RedisDBBatch.hget(KEY, value, CLIENT)
            
        }

        Entity.cacheHash = function() {
            this.__defineSetter__(
                CacheHash.cacheHash,
                function(keys) {
                    keys.forEach(
                        key => {
    
                            if(key == 'id')
                                this.on(
                                    'new',
                                    bind => {
                                        let KEY = this[CacheHash.key](key, bind.newObject[Entity.context]),
                                            CLIENT = this[CacheHash.client](bind.newObject[Entity.context])
                                        RedisDBBatch.sadd(
                                            KEY,
                                            `${bind.newObject.id}`,
                                            CLIENT
                                        )
                                    }
                                )
    
                            else
                                this.on(
                                    'save',
                                    async bind => {
                                        if(bind.changes.includes(key)) {
                                            let KEY = this[CacheHash.key](key, bind.newObject[Entity.context]),
                                                CLIENT = this[CacheHash.client](bind.newObject[Entity.context])
                                            if(objectPath.get(bind.oldObject, key))
                                                await RedisDBBatch.hdel(
                                                    KEY,
                                                    objectPath.get(bind.oldObject, key),
                                                    CLIENT
                                                )
                                            if(objectPath.get(bind.newObject, key))
                                                await RedisDBBatch.hset(
                                                    KEY,
                                                    objectPath.get(bind.newObject, key),
                                                    `${bind.newObject.id}`,
                                                    CLIENT
                                                )
                                        }
                                    }
                                )
    
                        }
                    )
                }
            )
            this[CacheHash.cacheHash] = Array.from(arguments)
        }

    }
}

CacheHash.client = Symbol('client')
CacheHash.key = Symbol('key')
CacheHash.cacheHash = Symbol('cacheHash')

export default CacheHash