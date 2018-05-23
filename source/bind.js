export default function bind(object, state, type) {
    Object.keys(state).forEach(
        key => {
            if (typeof type[key] !== 'undefined')
                switch(typeof type[key]) {
                    case 'object':
                            bind(object[key], state[key], type[key])
                        break
                    case 'function':
                        switch(type[key].name) {
                            case 'Array':
                                object[key] = new type[key](...state[key]).valueOf()
                                break
                            case 'Object':
                                object[key] = new type[key](state[key])
                                break
                            default:
                                object[key] = new type[key](state[key]).valueOf()
                                break
                        }
                        break
                }
        }
    )
}