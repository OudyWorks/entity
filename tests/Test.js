import Entity from '../source/MongoDB'

class Test extends Entity {

}

Test.type = {
    id: String,
    string: String,
    number: Number,
    float: Number,
    object: Object,
    empty_object: Object,
    arrayOfStrings: Array,
    arrayOfNumbers: Array,
    arrayOfObjects: Array,
    arrayOfArrays : Array
}

Test.defaultValues = {
    string: 'Placeholder',
    number: 10,
    float: 9.9,
    object: { x_pos: 0, y_pos: 0 , list : [
        {
            type : "small rect",
            width : 100,
            height : 100
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
    ]},
    empty_object: {},
    arrayOfStrings: [
        'Value 1', 'Value 2', 'Value 3', 'Value 4'
    ],
    arrayOfArrays : [[0, 1, 2, 3, 4], [0, 1, 2]],
    arrayOfNumbers: [0, 1, 0, 3, 0],
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
        }
    ]
}

export default Test