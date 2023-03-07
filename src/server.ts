import fastify from 'fastify'
import { transactionRoutes } from './routes/transactions'
import { env } from '.'

const app = fastify()

app.register(transactionRoutes, {
  prefix: 'transactions'
})

app.listen({ port: env.PORT }).then(() => {
  console.log('server up 2')
})
