const
  EventEmitter = require('events'),
  $type = Symbol('type'),
  $context = Symbol('context'),
  $useBind = Symbol('useBind'),
  $validateContext = Symbol('validateContext'),
  EventEmitterFunctions = ['on', 'once', 'emit', 'removeListener'],
  extend = Class => {
    const emitter = new EventEmitter(),
      _class = class extends Class {

        constructor() {
          super()
          this[$context] = {}
          const emitter = new EventEmitter()
          for (let i = 0; i < EventEmitterFunctions.length; i++)
            this[EventEmitterFunctions[i]] = emitter[EventEmitterFunctions[i]].bind(emitter)
        }

        json(space = 2, replacer = null) {
          return JSON.stringify(this, replacer, space)
        }

      }

    // Events
    for (let i = 0; i < EventEmitterFunctions.length; i++)
      _class[EventEmitterFunctions[i]] = emitter[EventEmitterFunctions[i]].bind(emitter)

    return _class
  }

module.exports = extend(class { })

Object.assign(
  module.exports,
  {
    extend,
    $context,
    $useBind,
    $validateContext
  }
)