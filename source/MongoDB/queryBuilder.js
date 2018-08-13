const { get } = require("object-path")

let isObject = obj => (obj instanceof Object) && !(obj instanceof Array)
let isArray = obj => Array.isArray(obj)
let isObjectEmpty = obj => Object.keys(obj).length == 0
let typeOf = (obj, type) => typeof obj == type
let sliceFromEnd = (str, sub) => str.substring(0, str.lastIndexOf(sub))

function removeEmptyFields(obj) {
    for (let key in obj)
        if (Object.keys(obj[key]).length == 0) delete obj[key]
}

function assign(obj, prop, inner_prop, output) {
    if (obj[prop] == undefined) obj[prop] = {}
    obj[prop][inner_prop] = output[prop][inner_prop]
    delete output[prop][inner_prop]
}

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
        else if (prop && isObject(get(original, prop.slice(0, -1)))) {
            output.$unset[prop + key] = ""
        }
    }
}

function addedHandler(output, added, original, edited, prop = "") {
    for (let key in added) {
        if (isDifferent(get(original, prop + key), get(edited, prop + key))) {
            output.$set[prop + key] = get(edited, prop + key)
        }
        else if (isArray(get(original, prop + key))) {
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

function resolveConflict(output, payload) {
    if (!isObjectEmpty(output)) {
        payload.push(output)
        let rest_output = {}

        for (let push_key in output.$push) {
            for (let inner_push_key in output.$push) {
                if (push_key != inner_push_key && push_key.indexOf(inner_push_key) > -1) {
                    assign(rest_output, "$push", inner_push_key, output)
                    //log('conflict between $push and $push')
                }
            }
        }
        for (let unset_key in output.$unset) {
            for (let pull_key in output.$pull) {
                if (sliceFromEnd(unset_key, '.') == pull_key) {
                    assign(rest_output, "$pull", pull_key, output)
                    //log('conflict between $unset and $pull')
                }
            }
            for (let push_key in output.$push) {
                if (unset_key.indexOf(push_key) > -1) {
                    assign(rest_output, "$push", push_key, output)
                    //log('conflict between $unset and $push')
                }
            }
        }
        for (let set_key in output.$set) {
            for (let push_key in output.$push) {
                if (set_key.indexOf(push_key) > -1) {
                    assign(rest_output, "$push", push_key, output)
                    //log('conflict between $set and $push')
                }
            }
            for (let unset_key in output.$unset) {
                if (unset_key.indexOf(set_key) > -1) {
                    delete output.$unset[unset_key]
                    //log('conflict between $set and $unset')
                }
            }
        }
        pullLoop: for (let pull_key in output.$pull) {
            for (let inner_pull_key in output.$pull) {
                if (pull_key != inner_pull_key && pull_key.indexOf(inner_pull_key) > -1) {
                    assign(rest_output, "$pull", inner_pull_key, output)
                    //log('conflict between $pull and $pull')
                    break pullLoop
                }
            }
            for (let push_key in output.$push) {
                if (pull_key.indexOf(push_key) > -1) {
                    assign(rest_output, "$push", push_key, output)
                    //log('conflict between $pull and $push')
                }
            }
        }

        resolveConflict(rest_output, payload)
        removeEmptyFields(output)
    }
}

module.exports = function BuildQuery(diff, original, edited) {
    let output = {
        $set: {},
        $push: {},
        $unset: {},
        $pull: {}
    }, payload = []

    deletedHandler(output, diff.deleted, original, edited)
    updatedHandler(output, diff.updated, original, edited)
    addedHandler(output, diff.added, original, edited)
    resolveConflict(output, payload)

    return payload
}