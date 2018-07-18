const objectPath = require("object-path")

function updatedHandler(output, updated, prop = "") {
    for (let key in updated) {
        if (typeof updated[key] === "object") {
            updatedHandler(output, updated[key], prop + key + ".")
        }
        else if (updated[key]) {
            output.$set[prop + key] = updated[key]
        }
    }
}

function deletedHandler(output, deleted, original, prop = "") {
    for (let key in deleted) {
        if (typeof deleted[key] == "object") {
            deletedHandler(output, deleted[key], original, prop + key + ".")
        }
        else if (prop && Array.isArray(objectPath.get(original, prop.slice(0, -1)))) {
            output.$unsetArray.push({ $unset: { [prop + key]: "" } })
            output.$pull[prop.slice(0, -1)] = null
        }
        else output.$unset[prop + key] = ""
    }
}

function AddedHandler(output, added, original, prop = "") {
    for (let key in added) {
        if (Array.isArray(objectPath.get(original, prop + key))) {
            innerHandler(output, added, original, key, prop)
        }
        else output.$set[prop + key] = added[key]
    }
}

function innerHandler(output, added, original, key, prop) {
    let list = []
    for (let innerKey in added[key]) {
        if (objectPath.get(original, prop + key)[parseInt(innerKey)]) {
            if (Array.isArray(objectPath.get(original, prop + key + "." + innerKey))) {
                innerHandler(output, added[key], original, innerKey, prop + key + ".")
            }
            else {
                AddedHandler(output, added[key][innerKey], original, prop + key + "." + innerKey + ".")
            }
        }
        else {
            list.push(added[key][innerKey])
            output.$push[prop + key] = { $each: list }
        }
    }
}

function BuildQuery(diff, original) {
    let output = {
        $set: {},
        $push: {},
        $unset: {},
        $unsetArray: [],
        $pull: {}
    }
    let payload = []
    deletedHandler(output, diff.deleted, original)
    AddedHandler(output, diff.added, original)
    updatedHandler(output, diff.updated)
    for (let key in output) {
        if (key !== "$unsetArray" && Object.keys(output[key]).length > 0) {
            payload.push({ [key]: output[key] })
        }
        else if (key == "$unsetArray") {
            payload.push(...output.$unsetArray)
        }
    }

    return payload
}

module.exports = BuildQuery