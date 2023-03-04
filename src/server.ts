import fastify from 'fastify'

const app = fastify()

app.get('/hello', () => {
  return 'first'
})

app.listen({ port: 3333 }).then(() => {
  console.log('server up 2')
})
