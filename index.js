const
  EventEmitter = require('events'),
  $type = Symbol('type'),
  $defaultValues = Symbol('defaultValues'),
  $context = Symbol('context'),
  $useBind = Symbol('useBind'),
  $validateContext = Symbol('validateContext'),
  EventEmitterFunctions = ['on', 'once', 'emit', 'removeListener'],
  build = require('./build'),
  /**
   * @return Entity
   */
  extend = Class => {
    const emitter = new EventEmitter(),
      /**
       * @class Entity
       */
      _class = class extends Class {
        /**
         * @return Entity
        */
        constructor() {
          super()
          this.build()
          this[$context] = {}
          const emitter = new EventEmitter()
          for (let i = 0; i < EventEmitterFunctions.length; i++)
            this[EventEmitterFunctions[i]] = emitter[EventEmitterFunctions[i]].bind(emitter)
        }

        build() {
          if(this.constructor[$type])
            build(this, this.constructor[$type], this.constructor[$defaultValues] || {})
        }

        /**
         * Return a json string of the object
         * @param Number space 
         * @param {String | Number} replacer 
         * @return String
         */
        json(space = 2, replacer = null) {
          return JSON.stringify(this, replacer, space)
        }

      }

    // Events
    for (let i = 0; i < EventEmitterFunctions.length; i++)
      _class[EventEmitterFunctions[i]] = emitter[EventEmitterFunctions[i]].bind(emitter)

    return _class
  }

/**
 * @return Entity
 */
module.exports = extend(class { })

Object.assign(
  module.exports,
  {
    extend,
    $type,
    $defaultValues,
    $context,
    $useBind,
    $validateContext
  }
)