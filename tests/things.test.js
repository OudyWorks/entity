import Test from "./Test"
import MongoDB from '@oudyworks/drivers/MongoDB'

let TESTS = null,
    test = 1

async function _Expect(obj) {
    let end_obj = await TESTS.findOne({ _id: obj.id.match(MongoDB.IDRegex) ? MongoDB.ObjectID(obj.id) : obj.id })
    delete end_obj._id
    return expect(JSON.stringify(end_obj)).toBe(JSON.stringify(obj.mongoDBDocument(true)))
}
function runTest(state) {
    // return Test.bindAndUpsert(['test', test++].join('_'), state)
    return Test.bindAndSave(['test', test++].join('_'), {})
        .then(obj => obj.bindAndSave(state))
        .then(_Expect)
}

it('MongoDB', async () => {
    let database = await MongoDB.configure("mongodb://localhost:27017/", "test")
    TESTS = database.collection("tests")
    await TESTS.drop()
    expect(1).toBe(1)
})

it('RANDOM', () => {
    return runTest({
        string: 'Placeholder',
        number: 10,
        float: 9.9,
        object: {
            number: { number: 20 },
            arrayOfStrings: [
                15,
                'Value 1', { '0': '10', '1': '1' }
            ],
            arrayOfNumbers: [{ 'num': 1 }, 0],
            arrayOfObjects: [
                {
                    name: "New name",
                    age: {between : [10 , 20]},
                    list: [1, 2, 30],
                    obj: [{ likes: 3, alerts : 14 }, { likes: 10, deslikes: 10 }]
                }
            ]
        },
        arrayOfStrings: [
            'Value 1', [0, 0, 50], 'Value 3', ['Value 4']
        ],
        arrayOfArrays: [[0, 1, [0, 1, 'Stuff', 3, 4], 2, [0]], [0, 1, [0, 1, 'hello', 4], 2, 3, 4], [0, 3, 4, {e : 'e'}]],
        arrayOfNumbers: [0, 1, 0, 3, [0, 1, 2, 3, 4], 0],
        arrayOfObjects: [
            {
                list: [1, [0, 1, 2, 3, 4]],
                obj: [[0, 0, 50], { likes: 10, alerts: 10 }, { alerts: 10, deslikes: 10 }]
            },
            {
                name: [0, 0, 50],
                age: [0, 0, 50]
            }
        ]
    })
})

it('array to object', () => {
    return runTest({
        arrayOfObjects: [
            {
                name: "Name 1",
                age: 10,
                list: {name : "jhon", last_name : "lent"}
            },
            {
                name: "Name 2",
                age: 10
            }
        ]
    })
})

it('Test 1', () => {
    return runTest({
        arrayOfArrays: [[0, 3, 4], [0, 1, 2, 3, 4, 10, 10], 1],
        arrayOfStrings: [
            'Value 1', 'Value 2'
        ],
        arrayOfObjects: [
            {
                name: { info: ["Name 1"] },
                age: { info: [10] },
                list: { name: "jhon", last: "lent" },
                obj : [{likes : 10, deslikes : 10}]
            },
            [0, 1, 2]
        ]
    })
})

it('set unset', () => {
    return runTest({
        arrayOfObjects: [
            {
                name: "Name 1",
                age : 20
            },
            [0,1,2]
        ]
    })
})

it('set push', () => {
    return runTest({
        arrayOfArrays : [[0, 1, 2, 3, 4, [0,0]], [0, 1, 2, 3, 5], 12]
        //arrayOfArrays: [[0, 1, 2, 3, 4, [0, 0]], [0, 1, 2, 3, 4]],
    })
})

it('set push 2', () => {
    return runTest({
        arrayOfArrays : [[0, 1, 2, 3, 4, [0,1]], [0, 1, 2, 3, 4],1],
    })
})

it('unset push', () => {
    return runTest({
        arrayOfArrays : [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4] , 1],
    })
})

it('pull push', () => {
    return runTest({
        arrayOfArrays: [[0, 1, 2, 3, 4, [0]], [0, 1, 2, 3, 4], 1],
    })
})

it('unset push 2', () => {
    return runTest({
        arrayOfArrays: [[0, 1, 2, 3], [0, 1, 2, 3, 4], 1],
    })
})

it('unset pull', () => {
    return runTest({
        arrayOfStrings: [
            'Value 1', 'Value 2'
        ]
    })
})

 it('push push', () => {
    return runTest({
        arrayOfArrays: [[0, 1, 2, 3, 4, [0, 0, 0]], [0, 1, 2, 3, 4], 1],
        //arrayOfArrays: [[0, 1, 2, 3, 4, [0, 0]], [0, 1, 2, 3, 4]],
    })
})

it('pull pull', () => {
    return runTest({
        arrayOfArrays: [[0, 1, [0,1]]]
    })
})

it('Remove fields from object', () => {
    return runTest({
        object: {}
    })
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