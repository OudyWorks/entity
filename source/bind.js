export default function bind(object, state, type, trackChange = false, changes = new Set(), preKey = '') {
    Object.keys(state).forEach(
        key => {
            if (typeof type[key] !== 'undefined')
                switch (type[key].name || type[key].constructor.name) {
                    case 'Object':
                        bind(object[key], state[key], type[key], trackChange, changes, `${preKey ? preKey + '.' : ''}${key}`)
                        break
                    case 'Array':
                        object[key] = new type[key](...state[key]).valueOf()
                        break
                    default :
                        object[key] = new type[key](state[key]).valueOf()
                        break
                }
        }
    )
}