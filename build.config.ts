import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  outDir: 'dist',
  entries: [
    {
      name: 'index',
      input: 'src/index'
    }
  ],
  rollup: {
    emitCJS: true
  }
})
