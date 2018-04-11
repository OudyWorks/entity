import EventEmitter from 'events'

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
        emitter.on.apply(this, arguments)
    }
    static once() {
        emitter.once.apply(this, arguments)
    }
    static emit() {
        emitter.emit.apply(this, arguments)
    }
    static removeListener() {
        emitter.removeListener.apply(this, arguments)
    }
}