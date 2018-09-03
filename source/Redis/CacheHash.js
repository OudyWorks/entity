import RedisDBBatch from '@oudyworks/drivers/Redis/Batch'
import objectPath from 'object-path'
import TTLMap from '@oudyworks/ttlmap'

const cache = new TTLMap()

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

        Entity.isExistInCacheHash = function(key, value, context = {}) {
            
            return this[Entity.validateContext](context).then(
                () => {

                    let KEY = this[CacheHash.key](key, context),
                        CLIENT = this[CacheHash.client](context),
                        _key = [CLIENT, KEY].join(':'),
                        $return = this[CacheHash.cache] && cache.get(_key)

                    if($return)
                        return $return

                    $return = RedisDBBatch[key == 'id' ? 'sismember' : 'hget'](KEY, value, CLIENT).then(
                        $return => {
                            if(this[CacheHash.cache])
                                cache.set(_key, $return)
                            return $return
                        }
                    )

                    if(this[CacheHash.cache])
                        cache.set(_key, $return)

                    return $return
                    
                }
            )

        }

        Entity.cacheHash = function() {
            this[CacheHash.cacheHash] = Array.from(arguments)
        }
        Entity.__defineSetter__(
            CacheHash.cacheHash,
            function(keys) {

                this[CacheHash.keys] = keys

                if(keys.includes('id'))
                    this.on(
                        'new',
                        bind => {
                            let KEY = this[CacheHash.key]('id', bind.newObject[Entity.context]),
                                CLIENT = this[CacheHash.client](bind.newObject[Entity.context])
                            RedisDBBatch.sadd(
                                KEY,
                                `${bind.newObject.id}`,
                                CLIENT
                            )
                        }
                    )
                
                this.on(
                    'save',
                    bind => {

                        keys.filter(key => key != 'id').forEach(
                            async key => {
        
                                if(bind.changes.includes(key)) {

                                    const KEY = this[CacheHash.key](key, bind.newObject[Entity.context]),
                                        CLIENT = this[CacheHash.client](bind.newObject[Entity.context]),
                                        _key = [CLIENT, KEY].join(':')

                                    if(this[CacheHash.cache])
                                        cache.delete(_key)

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

        Entity[CacheHash.cache] = true

    }
}

CacheHash.client = Symbol('client')
CacheHash.key = Symbol('key')
CacheHash.cacheHash = Symbol('cacheHash')
CacheHash.cache = Symbol('cache')
CacheHash.keys = Symbol('keys')

export default CacheHash