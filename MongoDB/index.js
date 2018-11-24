const Entity = require('@oudy/entity'),
  MongoDB = require('@oudy/mongodb'),
  $database = Symbol('database'),
  $collection = Symbol('collection');

class MongoDBEntity extends Entity {

}

MongoDBEntity[$database] = function() {
  return 'default'
}
MongoDBEntity[$collection] = function() {
  return this[this.$pluralName]().toLowerCase()
}

module.exports = MongoDBEntity

Object.assign(
  module.exports,
  {
    $database,
    $collection
  }
)