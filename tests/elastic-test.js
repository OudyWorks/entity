const ElasticsearchEntity = require("../npm/Elasticsearch").default
const Elasticsearch = require('@oudyworks/drivers/ElasticSearch').default

class Game extends ElasticsearchEntity {
}

Game.type = {
    id: String,
    name: String,
    release_date: String,
    rating: Number
}

Elasticsearch.configure({
    host: 'localhost:9200'
}).then(client => {
    let state = {
        name: 'Dark Souls 3',
        release_date: '11/11/2016',
        rating: 100
    }
    Game.loadAll({
        query: { 'match': { 'name': 'Dark Souls 3' } },
        page: 1,
        limit: 10
    })
        .then(console.log)
})