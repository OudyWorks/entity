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
  object: {
    name: String
  },
  array: Array,
}

test(
  '$pluralName',
  () => {
    const _test = new Test()
    _test.bind(
      {
        string: 'aa',
        object: {
          name: 'aaaaaa'
        },
        array: [
          1, 2, {
            id: 1,
            name: 'iwuehiuwhe'
          }
        ]
      }
    ).then(
      bind => {
        console.log(bind)
        console.log(_test)
      }
    )
    expect(Test[Entity.$collection]()).toBe('tests')
  }
)

const count = 13

// test(
//   'Entity.load',
//   (resolve) => {
//     Promise.all(
//       new Array(count).fill().map(
//         (u, i) =>
//           Test.load('5c07a7919a1cdb2fe278e4c3').catch(
//             error => {
//               console.log('catched error', error)
//             }
//           )
//       )
//     ).then(
//       () => resolve()
//     )
//   }
// )

// test(
//   'Instance.save',
//   (resolve) => {
//     Promise.all(
//       new Array(count).fill().map(
//         (u, i) => {
//           Test.load('ayoub').then(
//             _test =>
//               _test.save()
//           )
//         }
//       )
//     ).then(
//       () => resolve()
//     )
//   }
// )
// test(
//   'Entity.bindAndSave',
//   (resolve) => {
//     Promise.all(
//       new Array(count).fill().map(
//         (u, i) => {
//           Test.bindAndSave(
//             'ayoub',
//             {
//               string: 'Ayouuuub'
//             }
//           )
//         }
//       )
//     ).then(
//       () => resolve()
//     )
//   }
// )