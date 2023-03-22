import { FastifyInstance } from "fastify"
import crypto, { randomUUID } from 'node:crypto'
import { knex } from "../database"
import { z } from 'zod'
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"

export async function transactionRoutes(app: FastifyInstance) {
    app.addHook('preHandler', async (req, rep) => {
        console.log(`[${req.method}] - ${req.url}`)
    })
    
    app.post('/', async (request, reply) => {
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit'])
        })

        const { title, amount, type } = createTransactionBodySchema.parse(request.body)

        let { sessionId } = request.cookies

        if(!sessionId) {
            sessionId = randomUUID();

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1_000 * 60 * 60 * 24 * 7, // 7days
            })
        }

        await knex('transactions').insert({
          id: crypto.randomUUID(),
          title,
          amount: type === 'credit'? amount : -1 * amount,
          session_id: sessionId,
        })
      
        return reply.status(201).send()
    })
    
    app.get(
        '/',
        {
            preHandler: [
                checkSessionIdExists
            ]
        },
        async (req) => {
            const { sessionId } = req.cookies

            const transactions = await knex('transactions')
                .where('session_id', sessionId)
                .select()
            
            return { transactions }
        }
    )

    app.get(
        '/:id',
        {
            preHandler: [
                checkSessionIdExists
            ]
        },
        async (request) => {
            const getTransactionParamsSchema = z.object({
                id: z.string().uuid(),
            })
            const { id } = getTransactionParamsSchema.parse(request.params)
            const { sessionId } = request.cookies

            const transaction = await knex('transactions')
                .where({
                    session_id: sessionId,
                    id: id,
                })
                .first()
            
            return { transaction }
        }
    )

    app.get(
        '/summary',
        {
            preHandler: [
                checkSessionIdExists
            ]
        },
        async (req) => {
            const { sessionId } = req.cookies
            const summary = await knex('transactions')
                .where('session_id', sessionId)
                .sum('amount', { as: 'amount' })
                .first()

            return { summary }
        }
    )

}
