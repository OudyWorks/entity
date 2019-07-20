import Entity from './index'

test(
  'Global Events',
  () => {
    class Test extends Entity {

    }
    Test.on(
      'test',
      (value) => {
        expect(value).toBe(true)
      }
    )
    Test.emit('test', true)
  }
)

test(
  'Instance Events',
  () => {
    class Test extends Entity {

    }
    const _test = new Test()
    _test.on(
      'test',
      (value) => {
        expect(value).toBe(true)
      }
    )
    _test.emit('test', true)
  }
)

test(
  '$type && $defaultValues',
  () => {
    class Test extends Entity {

    }
    Test[Entity.$type] = {
      id: String,
      name: String
    }
    Test[Entity.$defaultValues] = {
      name: 'Eyup'
    }
    const _test = new Test()
    expect(_test.json()).toBe(`{
  "id": "",
  "name": "Eyup"
}`)
  }
)

test(
  '$pluralName',
  () => {
    class Test extends Entity {

    }
    expect(Test[Entity.$pluralName]()).toBe('Tests')
  }
)