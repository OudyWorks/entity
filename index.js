const
  EventEmitter = require('events'),
  $type = Symbol('type'),
  $defaultValues = Symbol('defaultValues'),
  $context = Symbol('context'),
  $useBind = Symbol('useBind'),
  $validateContext = Symbol('validateContext'),
  $validatedContext = Symbol('validatedContext'),
  $pluralName = Symbol('pluralName'),
  $id = Symbol('id'),
  $loaded = Symbol('loaded'),
  EventEmitterFunctions = ['on', 'once', 'emit', 'removeListener'],
  build = require('./build'),
  bind = require('./bind'),
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
          this[$id] = undefined
          this[$loaded] = false
          const emitter = new EventEmitter()
          for (let i = 0; i < EventEmitterFunctions.length; i++)
            this[EventEmitterFunctions[i]] = emitter[EventEmitterFunctions[i]].bind(emitter)
        }

        build() {
          if (this.constructor[$type])
            build(this, this.constructor[$type], this.constructor[$defaultValues] || {})
        }

        bind(state, trackChange = true, bindObject = {}) {
          return new Promise(
            resolve => {
              bindObject.changes = bind(this, state, this.constructor[$type])
              bindObject.changed = !!bindObject.changes.length
              resolve(bindObject)
            }
          )
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
              this.save(bind)
          )
        }

        static load(id, context = {}, document = undefined) {
          const instance = new this()
          instance[$context] = context
          instance.bind(document || {}, false)
          instance[$id] = id
          if (document)
            instance[$loaded] = true
          return instance
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

    _class[$context] = []

    // Events
    for (let i = 0; i < EventEmitterFunctions.length; i++)
      _class[EventEmitterFunctions[i]] = emitter[EventEmitterFunctions[i]].bind(emitter)

    _class[$pluralName] = function () {
      return plural(this.name)
    }
    _class[$validateContext] = function (context = {}) {
      context[$validatedContext] = true
      return Promise.resolve(context)
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
    $id,
    $loaded,
    $useBind,
    $validateContext,
    $validatedContext,
    $pluralName
  }
)