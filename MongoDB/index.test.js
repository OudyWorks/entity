const Entity = require('./index')

test(
  '$pluralName',
  () => {
    class Test extends Entity {

    }
    expect(Test[Entity.$collection]()).toBe('tests')
  }
)