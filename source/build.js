export default function build(object, type, defaultValues = {}) {
    Object.keys(type).forEach(
        key => {
            switch(type[key].name || type[key].constructor.name) {
                case 'Object':
                    build(object[key] = {}, type[key], defaultValues[key] || {})
                    break
                case 'Array':
                    object[key] = []
                    break
                default:
                    object[key] = !defaultValues[key] ? new type[key]().valueOf() : new type[key](defaultValues[key]).valueOf()
                    break
            }
        }
    )
}