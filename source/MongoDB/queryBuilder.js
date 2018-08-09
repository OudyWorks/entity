const { get } = require("object-path")

let isObject = obj => (obj instanceof Object) && !(obj instanceof Array)
let isArray = obj => Array.isArray(obj)
let typeOf = (obj, type) => typeof obj == type

function isDifferent(obj1, obj2) {
    if (typeof obj1 != typeof obj2) return true
    else if (isObject(obj1) != isObject(obj2)) return true
    return false
}

function updatedHandler(output, updated, original, edited, prop = "") {
    for (let key in updated) {
        if (typeOf(updated[key], "object") && !isDifferent(get(original, prop + key), get(edited, prop + key))) {
            updatedHandler(output, updated[key], original, edited, prop + key + ".")
        }
        else if (updated[key] != undefined) {
            output.$set[prop + key] = updated[key]
        }
    }
}

function deletedHandler(output, deleted, original, edited, prop = "") {
    for (let key in deleted) {
        if (typeOf(deleted[key], "object")) {
            deletedHandler(output, deleted[key], original, edited, prop + key + ".")
        }
        else if (prop && isArray(get(original, prop.slice(0, -1))) && isArray(get(edited, prop.slice(0, -1)))) {
            output.$unset[prop + key] = ""
            output.$pull[prop.slice(0, -1)] = null
        }
        else if (isObject(get(original, prop.slice(0, -1)))) {
            output.$unset[prop + key] = ""
        }
    }
}

function addedHandler(output, added, original, edited, prop = "") {
    for (let key in added) {
        if (isArray(get(original, prop + key))) {
            innerHandler(output, added, original, edited, key, prop)
        }
        else if (isObject(added[key])) {
            addedHandler(output, added[key], original, edited, prop + key + ".")
        }
        else output.$set[prop + key] = added[key]
    }
}

function innerHandler(output, added, original, edited, key, prop) {
    for (let innerKey in added[key]) {
        if (get(original, prop + key)[innerKey]) {
            if (isDifferent(get(original, prop + key + "." + innerKey), get(edited, prop + key + "." + innerKey))) {
                output.$set[prop + key + "." + innerKey] = get(edited, prop + key + "." + innerKey)
            }
            else if (isArray(get(original, prop + key + "." + innerKey))) {
                innerHandler(output, added[key], original, edited, innerKey, prop + key + ".")
            }
            else {
                addedHandler(output, added[key][innerKey], original, edited, prop + key + "." + innerKey + ".")
            }
        }
        else {
            output.$push[prop + key] = { $each: get(edited, prop + key).slice(innerKey) }
            break
        }
    }
}

function BuildQuery(diff, original, edited) {
    let output = {
        $set: {},
        $push: {},
        $unset: {},
        $pull: {}
    }, payload = []

    deletedHandler(output, diff.deleted, original, edited)
    updatedHandler(output, diff.updated, original, edited)
    addedHandler(output, diff.added, original, edited)

    for (let key in output) {
        if (key == "$pull" || key == "$push") {
            payload.push(...Object.keys(output[key])
                .map(innerKey =>
                    ({ [key]: { [innerKey]: output[key][innerKey] } })))
        }
        else if (Object.keys(output[key]).length > 0) {
            payload.push({ [key]: output[key] })
        }
    }

    console.log(payload)
    return payload
}

module.exports = BuildQuery