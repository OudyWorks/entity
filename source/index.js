import EventEmitter from 'events'
import plural from 'plural'
import build from './build'
import bind from './bind'
import deepClone from 'lodash.clonedeep'
import deepmerge from 'deepmerge'
import {
    detailedDiff, diff as _diff
} from 'deep-object-diff'
import flattenObj from 'flatten-obj'

const emitter = new EventEmitter(),
    flatten = flattenObj()

class Entity {

    constructor() {

        this.build()

        this[Entity.context] = {}

        let emitter = new EventEmitter()

        this.on = emitter.on.bind(emitter)
        this.once = emitter.once.bind(emitter)
        this.emit = emitter.emit.bind(emitter)
        this.removeListener = emitter.removeListener.bind(emitter)

    }

    build() {

        build(this, this.constructor.type, this.constructor.defaultValues || {})

    }

    bind(state, trackChange = true, bindObject = {}) {
        return new Promise(
            resolve => {

                if (trackChange) {

                    let oldObject = deepClone(this)

                    new Promise(
                        resolve => {
                            if (typeof this.validate == 'function') {
                                bindObject.errors = {}
                                bindObject.erred = {}
                                this.validate(state, bindObject.errors, this[Entity.context]).then(
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

                            let difference = flatten(_diff(oldObject, this)),
                                diff = detailedDiff(oldObject, this),
                                changes = Object.keys(difference)

                            resolve(
                                Object.assign(
                                    bindObject,
                                    {
                                        oldObject,
                                        newObject: this,
                                        difference,
                                        diff,
                                        changes,
                                        changed: !!changes.length,
                                        context: this[Entity.context],
                                        id: this.id
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

    bindAndSave(state) {
        return this.bind(state).then(
            bind =>
                (bind.erred || !bind.changes.length) ? this : this.save(bind)
        )
    }
    static bindAndSave(id, state, context = {}) {
        return this.load(id, context).then(
            object =>
                object.bindAndSave(state).then(
                    () =>
                        object
                )
        )
    }

}

Entity.context = Symbol('context')
Entity[Entity.context] = []

Entity.validateContext = Symbol('context')
Entity[Entity.validateContext] = function (context) {
    return Promise.resolve(context)
}

export default Entity