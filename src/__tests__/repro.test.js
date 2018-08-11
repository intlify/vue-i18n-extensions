const { renderToString } = require('@vue/server-test-utils')

it('cannot work correctly', () => {
  const str = renderToString({
    template: `<div>
      <ul>
        <li v-for="(item, index) in items" :key="index">
         {{item}}:{{index}} 
        </li>
      </ul>
    </div>`,
    data () {
      const items = ['foo', 'bar']
      for (let i = items.length; i < 1000; i++) {
        items.push(`buz${i}`)
      }
      return { items }
    }
  })
  expect(str).not.toContain('')
})
