const EventEmitter = require('events'),
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

  flatten = require('flatten-obj')(),
  falzy = require('falzy')

export function load(Entity, id, context = {}, document = undefined) {
  const instance = new Entity()
  instance[$context] = context
  instance.bind(document || {}, false)
  instance[$id] = id
  if (document)
    instance[$loaded] = true
  return instance
}

export function extend(Class) {
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
        return Promise.resolve().then(
          () => {
            if (!trackChange)
              return
            if (typeof this.validate == 'function') {
              bindObject.errors = {}
              bindObject.erred = {}
              return this.validate(
                state,
                bindObject.errors,
                this[$context]
              ).then(
                () =>
                  bindObject.erred = !!Object.values(flatten(bindObject.errors)).filter(error => !falzy(error)).length
              )
            }
          }
        ).then(
          () => {
            bindObject.changes = bind(this, state, this.constructor[$type])
            bindObject.changed = !!bindObject.changes.length
            return bindObject
          }
        )
      }

      save(bind, id) {
        if (bind) {
          bind.isNew = id != this[$id]
          bind.id = id || this.id
          bind.context = this[$context]
          if (bind.isNew) {
            this.emit(
              'new',
              bind
            )
            this.constructor.emit(
              'new',
              bind
            )
          } else {
            this.emit(
              'update',
              bind
            )
            this.constructor.emit(
              'update',
              bind
            )
          }
          this.emit(
            'save',
            bind
          )
          this.constructor.emit(
            'save',
            bind
          )
        }
        return id
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
        return load(this, id, context, document)
      }

      static loadMany(ids, context, documents) {
        return ids.map(
          (id, i) =>
            load(this, id, context, documents[i])
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

    }

  _class[$context] = []

  _class[$pluralName] = function () {
    return plural(this.name)
  }
  _class[$validateContext] = function (context = {}) {
    context[$validatedContext] = true
    return Promise.resolve(context)
  }

  return _class
}

export {
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

export default extend(class {})