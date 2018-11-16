const Entity = require('../index')

class Test extends Entity {

}
Test.on('text', console.log)
console.log(new Test())
Test.emit('text', true, 1, 3)