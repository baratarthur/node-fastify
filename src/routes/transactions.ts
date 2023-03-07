import { FastifyInstance } from "fastify"
import crypto from 'node:crypto'
import { knex } from "../database"
import { z } from 'zod'

export async function transactionRoutes(app: FastifyInstance) {
    app.post('/', async (request, reply) => {
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit'])
        })

        const { title, amount, type } = createTransactionBodySchema.parse(request.body)

        await knex('transactions').insert({
          id: crypto.randomUUID(),
          title,
          amount: type === 'credit'? amount : -1 * amount,
        })
      
        return reply.status(201).send()
    })
    
    app.get('/', async () => {
        const transactions = await knex('transactions').select()
        
        return { transactions }
    })

    app.get('/:id', async (request) => {
        const getTransactionParamsSchema = z.object({
            id: z.string().uuid(),
        })
        const { id } = getTransactionParamsSchema.parse(request.params)

        const transaction = await knex('transactions').where('id', id).first()
        
        return { transaction }
    })

    app.get('/summary', async () => {
        const summary = await knex('transactions').sum('amount', { as: 'amount' }).first()

        return { summary }
    })

}
