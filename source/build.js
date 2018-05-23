export default function build(object, type, defaultValues = {}) {
    Object.keys(type).forEach(
        key => {
            switch(typeof type[key]) {
                case 'object':
                    build(object[key] = {}, type[key], defaultValues[key] || {})
                    break
                case 'function':
                    switch(type[key].name) {
                        case 'Array':
                            object[key] = []
                            break
                        case 'Object':
                            object[key] = new type[key](defaultValues[key] || {})
                            break
                        default:
                            object[key] = !defaultValues[key] ? new type[key]().valueOf() : new type[key](defaultValues[key]).valueOf()
                            break
                    }
                    break
            }
        }
    )
}