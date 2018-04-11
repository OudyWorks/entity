import EventEmitter from 'events'
import plural from 'plural'

const emitter = new EventEmitter()

export default class Entity {

    constructor() {
        
        let emitter = new EventEmitter()
 
        this.on = emitter.on
        this.once = emitter.once
        this.emit = emitter.emit
        this.removeListener = emitter.removeListener

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