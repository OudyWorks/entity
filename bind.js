function _bind(object, state, changes = [], preKey = '') {
  Object.keys(state).forEach(
    key => {
      if (state[key] === null) {
        if (object[key] != state[key])
          changes.push([preKey, key].filter(k => k).join('.'))
        object[key] = state[key]
        return
      }
      switch (typeof state[key]) {
        case 'object':
          _bind(object[key] = object[key] || new state[key].constructor, state[key], changes, [preKey, key].filter(k => k).join('.'))
          break
        default:
          let type = (object[key] || state[key]).constructor,
            newValue = new type(state[key]).valueOf()
          if (object[key] != newValue)
            changes.push([preKey, key].filter(k => k).join('.'))
          object[key] = newValue
          break
      }
    }
  )
}

module.exports = function bind(object, state, type, changes = [], preKey = '') {
  Object.keys(state).forEach(
    key => {
      if (typeof type[key] !== 'undefined')
        switch (typeof type[key]) {
          case 'object':
            bind(object[key], state[key], type[key], changes, [preKey, key].filter(k => k).join('.'))
            break
          case 'function':
            let newValue
            switch (type[key].name) {
              case 'Array':
                newValue = new type[key]()
                newValue.push(...state[key])
                state[key] = newValue.valueOf()
                _bind(object[key], state[key], changes, [preKey, key].filter(k => k).join('.'))
                break
              case 'Object':
                state[key] = new type[key](state[key])
                _bind(object[key], state[key], changes, [preKey, key].filter(k => k).join('.'))
                break
              default:
                newValue = new type[key](state[key]).valueOf()
                if (object[key] != newValue)
                  changes.push([preKey, key].filter(k => k).join('.'))
                object[key] = newValue
                break
            }
            break
        }
    }
  )
  return changes
}