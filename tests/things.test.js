import Test from "./Test"
import MongoDB from '@oudyworks/drivers/MongoDB'

let TESTS = null

async function _Expect(obj) {
    let end_obj = await TESTS.findOne({ _id: MongoDB.ObjectID(obj.id) })
    delete end_obj._id
    return expect(JSON.stringify(end_obj)).toBe(JSON.stringify(obj.mongoDBDocument()))
}
function runTest(state) {
    return Test.bindAndSave('', {})
        .then(obj => obj.bindAndSave(state))
        .then(_Expect)
}

it('MongoDB', async () => {
    let database = await MongoDB.configure("mongodb://localhost/", "test")
    TESTS = database.collection("tests")
    await TESTS.drop()
    expect(1).toBe(1)
})

it('Change Number', () => {
    return runTest({
        number: 123
    })
})

it('Change String', () => {
    return runTest({
        string: "New Value"
    })
})

it('Add to the end of arrayOfStrings', () => {
    return runTest({
        arrayOfStrings: [
            'Value 1', 'Value 2', 'Value 3', 'Value 4', 'Value 5', 'Value 6'
        ],
    })
})

it('Add to the middle of arrayOfStrings', () => {
    return runTest({
        arrayOfStrings: [
            'Value 1', 'Value 2', 'Value 5', 'Value 6', 'Value 3', 'Value 4'
        ],
    })
})

it('Add to the end of arrayOfObjects', () => {
    return runTest({
        arrayOfObjects: [
            {
                name: "Name 1",
                age: 10
            },
            {
                name: "Name 2",
                age: 10
            },
            {
                name: "Name 3",
                age: 10
            },
            {
                name: "Name 4",
                age: 10
            },
            {
                name: "Name 5",
                age: 10
            },
            {
                name: "Name 6",
                age: 10
            }
        ]
    })
})

it('Add to the middle of arrayOfObjects', () => {
    return runTest({
        arrayOfObjects: [
            {
                name: "Name 1",
                age: 10
            },
            {
                name: "Name 2",
                age: 10
            },
            {
                name: "Name 5",
                age: 10
            },
            {
                name: "Name 6",
                age: 10
            },
            {
                name: "Name 3",
                age: 10
            },
            {
                name: "Name 4",
                age: 10
            }
        ]
    })
})

it('Remove from arrayOfStrings', () => {
    return runTest({
        arrayOfStrings: [
            'Value 1', 'Value 4'
        ],
    })
})

it('Remove from arrayOfObjects', () => {
    return runTest({
        arrayOfObjects: [
            {
                name: "Name 1",
                age: 10
            },
            {
                name: "Name 4",
                age: 10
            }
        ]
    })
})

it('Add fields to empty_object', () => {
    return runTest({
        empty_object: { x_pos: 166, y_pos: 100 }
    })
})

it('Remove fields from object', () => {
    return runTest({
        object: {}
    })
})

it('Add an arrayOfObjects field to an object in arrayOfObjects', () => {
    return runTest({
        arrayOfObjects: [
            {
                name: "Name 1",
                age: 10,
            },
            {
                name: "Name 2",
                age: 10
            },
            {
                name: "Name 3",
                age: 10,
                arrayOfObjects: [
                    { x_pos: 100, y_pos: 100 },
                    { x_pos: 200, y_pos: 200 },
                    { x_pos: 300, y_pos: 300 }]
            },
            {
                name: "Name 4",
                age: 10
            }
        ]
    })
})

it('Remove objects from an arrayOfObjects field in an object in arrayOfObjects', () => {
    return runTest({
        arrayOfObjects: [
            {
                name: "Name 1",
                age: 10,
            },
            {
                name: "Name 2",
                age: 10,
                arrayOfObjects: [
                    { x_pos: 100, y_pos: 100 },
                    { x_pos: 400, y_pos: 400 },
                    { x_pos: 500, y_pos: 500 }]
            },
            {
                name: "Name 3",
                age: 10
            },
            {
                name: "Name 4",
                age: 10
            }
        ]
    })
})

it('Replacing a string with an object inside arrayOfStrings', () => {
    return runTest({
        arrayOfStrings: [
            {
                name: "Name 4",
                age: 10
            },
            {
                name: "Name 4",
                age: 10
            },
            'Value 3', 'Value 4'
        ],
    })
})

it('Replacing a string with an array inside arrayOfStrings', () => {
    return runTest({
        arrayOfStrings: [
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            'Value 3', 'Value 4'
        ],
    })
})

it('Replacing an object with a string inside arrayOfObjects', () => {
    return runTest({
        arrayOfObjects: [
            "hello",
            "salut",
            {
                name: "Name 3",
                age: 10
            },
            {
                name: "Name 4",
                age: 10
            }
        ]
    })
})

it('Replacing an object with a number inside arrayOfObjects', () => {
    return runTest({
        arrayOfObjects: [
            12,
            15,
            {
                name: "Name 3",
                age: 10
            },
            {
                name: "Name 4",
                age: 10
            }
        ]
    })
})

it('Replacing an object with an array inside arrayOfObjects', () => {
    return runTest({
        arrayOfObjects: [
            [0, 1, 2, 3, 4],
            {
                name: "Name 2",
                age: 10
            },
            {
                name: "Name 3",
                age: 10
            },
            [0, 1, 2, 3, 4]
        ]
    })
})

it('Replacing an array with an object inside arrayOfArrays', () => {
    return runTest({
        arrayOfArrays: [{ first: "salut", last: "hello" }, { first: "salut", last: "hello" }, { first: "salut", last: "hello" }, 11, "ff"]
    })
})

it('Add a lot of objects to arrayOfObjects', () => {
    return runTest({
        arrayOfObjects: [
            {
                name: "Name 1",
                age: 10
            },
            {
                name: "Name 4",
                age: 10
            },
            {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }, {
                name: "Name 1",
                age: 10
            }
        ]
    })
})

it('The ZERO test', () => {
    return runTest({
        arrayOfArrays: [[0, 3, 4, 5], [0, 1, 2], 1, [{ first: "Y", last: "O" }]]
    })
})

it('Playing with $unset parent and children', () => {
    return runTest({
        object: {
            list: [
                {
                    type : "small rect",
                    width : 100
                },
                {
                    type : "rect",
                    width : 100,
                    height : 100
                },
                {
                    type : "big rect",
                    width : 100,
                    height : 100
                }
            ]
        }
    })
})