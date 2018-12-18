const Entity = require('./index'),
  MongoDB = require('@oudy/mongodb')

beforeAll(
  () =>
    MongoDB.configure(
      'mongodb://localhost:27017',
      {
        useNewUrlParser: true
      },
      'test'
    )
)

class Test extends Entity {

}

Test[Entity.$type] = {
  id: String,
  string: String,
  number: Number,
  float: Number,
  object: Object,
  empty_object: Object,
  arrayOfStrings: Array,
  arrayOfNumbers: Array,
  arrayOfObjects: Array,
  arrayOfArrays: Array
}
Test[Entity.$defaultValues] = {
  string: 'Placeholder',
  number: 10,
  float: 9.9,
  object: {
    x_pos: 0, y_pos: 0, list: [
      {
        type: 'small rect',
        width: 100,
        height: 100
      },
      {
        type: 'rect',
        width: 100,
        height: 100
      },
      {
        type: 'big rect',
        width: 100,
        height: 100
      }
    ]
  },
  arrayOfStrings: [
    'Value 1', 'Value 2', 'Value 3', 'Value 4'
  ],
  arrayOfArrays: [[0, 1, 2, 3, 4, [0, 0]], [0, 1, 2, 3, 4]],
  arrayOfNumbers: [0, 1, 0, 3, 0],
  arrayOfObjects: [
    {
      name: 'Name 1',
      age: 10,
      list: [1, 2, 3],
      obj: { likes: 10, deslikes: 10 }
    },
    {
      name: 'Name 2',
      age: 10
    }
  ]
}

test(
  '$pluralName',
  () => {
    const _test = new Test()
    expect(Test[Entity.$collection]()).toBe('tests')
  }
)

const count = 13

test(
  'Entity.load',
  (resolve) => {
    Promise.all(
      new Array(count).fill().map(
        (u, i) =>
          Test.load('5c07a7919a1cdb2fe278e4c3').catch(
            error => {
              console.log('catched error', error)
            }
          )
      )
    ).then(
      () => resolve()
    )
  }
)

test(
  'Instance.save',
  (resolve) => {
    Promise.all(
      new Array(count).fill().map(
        (u, i) => {
          Test.load('ayoub').then(
            _test =>
              _test.save()
          )
        }
      )
    ).then(
      () => resolve()
    )
  }
)
test(
  'Entity.bindAndSave',
  (resolve) => {
    Promise.all(
      new Array(count).fill().map(
        (u, i) => {
          Test.bindAndSave(
            'ayoub',
            {
              string: 'Ayouuuub'
            }
          )
        }
      )
    ).then(
      () => resolve()
    )
  }
)