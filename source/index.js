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

export default class Entity {

    constructor() {

        build(this, this.constructor.type, this.constructor.defaultValues || {})
        
        let emitter = new EventEmitter()
 
        this.on = emitter.on
        this.once = emitter.once
        this.emit = emitter.emit
        this.removeListener = emitter.removeListener



    }

    bind(state, trackChange = true, bindObject = {}) {
        let oldObject = deepClone(this)
        bind(this, state, this.constructor.type, trackChange)
        let difference = flatten(diff(oldObject, this)),
            changes = Object.keys(difference)
        return Object.assign(
            bindObject,
            {
                oldObject,
                newObject: this,
                difference,
                changes,
                changed: !!changes.length
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