const
  EventEmitter = require('events'),
  $type = Symbol('type'),
  $defaultValues = Symbol('defaultValues'),
  $context = Symbol('context'),
  $useBind = Symbol('useBind'),
  $validateContext = Symbol('validateContext'),
  $pluralName = Symbol('pluralName'),
  EventEmitterFunctions = ['on', 'once', 'emit', 'removeListener'],
  build = require('./build'),
  plural = require('plural'),
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
          if (this.constructor[$type])
            build(this, this.constructor[$type], this.constructor[$defaultValues] || {})
        }

        /**
         * Return a json string of the object
         * @param {Number} space 
         * @param {String | Number} replacer 
         * @return String
         */
        json(space = 2, replacer = null) {
          return JSON.stringify(this, replacer, space)
        }

        /**
         * 
         * @param {Object} state 
         */
        bindAndSave(state) {
          return this.bind(state).then(
            bind =>
              (bind.erred || !bind.changes.length) ? this : this.save(bind)
          )
        }

        /**
         * 
         * @param {*} id 
         * @param {Object} state 
         * @param {Object} context 
         */
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

    // Events
    for (let i = 0; i < EventEmitterFunctions.length; i++)
      _class[EventEmitterFunctions[i]] = emitter[EventEmitterFunctions[i]].bind(emitter)

    _class[$pluralName] = function () {
      return plural(this.name)
    }

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
    $validateContext,
    $pluralName
  }
)