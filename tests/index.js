import Entity from '../source/MongoDB'
import CacheHash from '../source/Redis/CacheHash'
import MongoDB from '@oudyworks/drivers/MongoDB'

class URL extends Entity { // Website class extends from @oudyworks/entity/MongoDB
    async validate(state, errors, context) {
        if(!state.name)
            errors.name = 'blank'
    }
}

URL.type = { // Website type
    id: String,
    name: String,
    country: String,
    url: String,
    list: Array,
    data: Object
}

URL[Entity.context] = ['website']

let url = new URL()

url.bind({
    data: {
        hi: true
    }
}).then(console.log)

console.log(url)

// CacheHash.use(Entity)
// URL[CacheHash.cacheHash] = [
//     'id', 'url'
// ]

// console.log(URL.isExistInCacheHash('url', 'www.mm.es', {website:'mm'}))

// URL.on('update', () => {})



// MongoDB.configure( // need to configure MongoDB first
//     'mongodb://192.168.42.1:27017',
//     'entity_test',
// ).then(
//     () => {

//         Website.load('5afc657b8841225ab9272cc2').then(
//             website => {

//                 website.on('update', ()=> {})

//                 website.bind({
//                     name: 'blalala',
//                     list: [
//                         'val1', 'val2'
//                     ]
//                 }).then(
//                     bind => {

//                         website.save(bind).then(
//                             () => {

//                                 console.log(website)

//                             }
//                         )

//                     }
//                 )

//             }
//         )

//         // let website = new Website() // init a website

//         // console.log('new website : ', website.json())

//         // website.bind({ // bind the new data
//         //     name: 'brasal',
//         //     country: 'MA',
//         //     url: 'https://www.brasal.ma'
//         // }).then(
//         //     bind => {

//         //         console.log('website after bind : ', website.json())

//         //         website.save().then( // save it
//         //             () => {

//         //                 console.log('website after save : ', website.json())

//         //             }
//         //         )

//         //     }
//         // )

//     }
// )

// class WebsiteEntity extends Entity {
    
// }

// WebsiteEntity[Entity.collection] = function(context) {
//     return `${this.pluralName.toLowerCase()}:${context.website}`
// }
// WebsiteEntity[Entity.database] = function(context) {
//     return context.website == 'amazonID' ? 'amazon' : 'default'
// }

// class URL extends WebsiteEntity {

// }

// URL.type = {
//     id: String,
//     url: String,
//     type: String
// }

// const context = {
//     website: '5a69dbb3f2161d67ba6f465a'
// }

// console.log(URL[Entity.collection](context))


// // Website[Entity.collection] = function(id) {
// //     return `${this.pluralName.toLowerCase()}_${id}`
// // }


// console.log(URL[Entity.collection]({website:'mm'}))
// console.log(URL[CacheHash.key]('url', {website:'ss'}))
