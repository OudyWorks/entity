import EventEmitter from 'events'
import plural from 'plural'
import build from './build'
import bind from './bind'
import deepClone from 'lodash.clonedeep'
import deepmerge from 'deepmerge'
import {
    diff
} from 'deep-object-diff'
import flattenObj from 'flatten-obj'

const   emitter = new EventEmitter(),
        flatten = flattenObj()

class Entity {

    constructor() {

        this.build()

        this[Entity.context] = {}
        
        let emitter = new EventEmitter()
 
        this.on = emitter.on
        this.once = emitter.once
        this.emit = emitter.emit
        this.removeListener = emitter.removeListener

    }

    build() {

        build(this, this.constructor.type, this.constructor.defaultValues || {})

    }

    bind(state, trackChange = true, bindObject = {}) {
        return new Promise(
            resolve => {

                if(trackChange) {

                    let oldObject = deepClone(this)

                    new Promise(
                        resolve => {
                            if(typeof this.validate == 'function') {
                                bindObject.errors = {}
                                bindObject.erred = {}
                                this.validate(state, bindObject.errors).then(
                                    () => {
                                        bindObject.erred = !!Object.values(flatten(bindObject.errors)).filter(e => e).length
                                        resolve()
                                    }
                                )
                            } else
                                resolve()
                        }
                    ).then(
                        () => {

                            bind(this, state, this.constructor.type)

                            let difference = flatten(diff(oldObject, this)),
                                changes = Object.keys(difference)

                            resolve(
                                Object.assign(
                                    bindObject,
                                    {
                                        oldObject,
                                        newObject: this,
                                        difference,
                                        changes,
                                        changed: !!changes.length
                                    }
                                )
                            )

                        }
                    )

                } else {

                    bind(this, state, this.constructor.type)
                    resolve(this)

                }
            }
        )
    }

    json(space = 4, replacer = null) {
        return JSON.stringify(this, replacer, space)
    }

    // Events
    static on() {
        return emitter.on.apply(this, arguments)
    }
    static once() {
        return emitter.once.apply(this, arguments)
    }
    static emit() {
        return emitter.emit.apply(this, arguments)
    }
    static removeListener() {
        return emitter.removeListener.apply(this, arguments)
    }

    static get pluralName() {
        return plural(this.name)
    }
}

Entity.context = Symbol()
Entity[Entity.context] = []

export default Entity