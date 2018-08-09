const objectPath = require("object-path")

function updatedHandler(output, updated, prop = "") {
    for (let key in updated) {
        if (typeof updated[key] === "object") {
            updatedHandler(output, updated[key], prop + key + ".")
        }
        else if (updated[key] != undefined) {
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

function AddedHandler(output, added, original, edited, prop = "") {
    for (let key in added) {
        if (Array.isArray(objectPath.get(original, prop + key))) {
            innerHandler(output, added, original, edited, key, prop)
        }
        else output.$set[prop + key] = added[key]
    }
}

function innerHandler(output, added, original, edited, key, prop) {
    for (let innerKey in added[key]) {
        if (objectPath.get(original, prop + key)[innerKey]) {
            if (Array.isArray(objectPath.get(original, prop + key + "." + innerKey))) {
                innerHandler(output, added[key], original, edited, innerKey, prop + key + ".")
            }
            else {
                AddedHandler(output, added[key][innerKey], original, edited, prop + key + "." + innerKey + ".")
            }
        }
        else {
            output.$push[prop + key] = { $each: objectPath.get(edited, prop + key).slice(innerKey) }
            break
        }
    }
}

function BuildQuery(diff, original, edited) {
    let output = {
        $set: {},
        $push: {},
        $unset: {},
        $unsetArray: [],
        $pull: {}
    }
    let payload = []
    deletedHandler(output, diff.deleted, original)
    AddedHandler(output, diff.added, original, edited)
    updatedHandler(output, diff.updated)
    for (let key in output) {
        if (key == "$unsetArray") {
            payload.push(...output[key])
        }
        else if (key == "$pull" || key == "$push") {
            payload.push(...Object.keys(output[key])
                .map(innerKey =>
                    ({ [key]: { [innerKey]: output[key][innerKey] } })))
        }
        else if (Object.keys(output[key]).length > 0) {
            payload.push({ [key]: output[key] })
        }
    }

    return payload
}

module.exports = BuildQuery