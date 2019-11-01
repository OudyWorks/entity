import {
  default as Entity,
  $type,
  $defaultValues,
  $pluralName,
  create
} from './src/index'

class Test extends Entity {

}

Test[$type] = {
  id: String,
  name: String,
  age: Number
}

test(
  'Global Events',
  () => {
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
    Test[$defaultValues] = {
      name: 'Eyup'
    }
    const _test = new Test()
    expect(_test.json()).toBe(JSON.stringify({
      id: '',
      name: 'Eyup',
      age: 0
    }, null, 2))
    _test.bind({
      name: 'Laila'
    }, true, {id:'Hahaha'}).then(console.log)
  }
)

test(
  '$pluralName',
  () => {
    expect(Test[$pluralName]()).toBe('Tests')
  }
)