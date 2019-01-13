const {$type} = Entity = require('./index'),
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

class Country extends Entity {

}

Country[$type] = {
  id: String,
  'Country Name': String,
  Language: String,
  ISO: Number
}

test(
  'Entity.loadAll',
  (resolve) => {

    Country.loadAll({page:5}).then(
      response => {
        console.log(response)
        resolve()
      }
    )

  }
)

// const count = 13

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