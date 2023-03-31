import { beforeAll, afterAll, describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'child_process'

describe('Transactions', () => {
    beforeAll(async () => {
        await app.ready()
    })
    
    afterAll(async () => {
        await app.close()
    })
    
    beforeEach(async () => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })
    
    it('should create a transaction', async () => {
        await request(app.server)
            .post('/transactions')
            .send({
                title: 'first deposit',
                amount: 5000,
                type: 'credit'
            })
            .expect(201)
    })

    it('should be able to list all transactions', async () => {
        const response = await request(app.server)
            .post('/transactions')
            .send({
                title: 'first deposit',
                amount: 5000,
                type: 'credit'
            })
            .expect(201)

        const cookies = response.get('Set-Cookie')

        const allTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200)

        expect(allTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: 'first deposit',
                amount: 5000
            })
        ])
    })

    it('should be able to list a specific transaction', async () => {
        const response = await request(app.server)
            .post('/transactions')
            .send({
                title: 'first deposit',
                amount: 5000,
                type: 'credit'
            })
            .expect(201)

        const cookies = response.get('Set-Cookie')

        const allTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200)

        const transactionId = allTransactionsResponse.body.transactions[0].id

        const oneTransactionReponse = await request(app.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookies)
            .expect(200)

        expect(oneTransactionReponse.body.transaction).toEqual(
            expect.objectContaining({
                title: 'first deposit',
                amount: 5000
            })
        )
    })

    it('should be able to get the summary', async () => {
        const response = await request(app.server)
            .post('/transactions')
            .send({
                title: 'first deposit',
                amount: 5000,
                type: 'credit'
            })
            .expect(201)
        
        const cookies = response.get('Set-Cookie')
        
        await request(app.server)
            .post('/transactions')
            .set('Cookie', cookies)
            .send({
                title: 'second deposit',
                amount: 2000,
                type: 'debit'
            })
            .expect(201)
        
        
        const summaryResponse = await request(app.server)
            .get('/transactions/summary')
            .set('Cookie', cookies)
            .expect(200)
        
        expect(summaryResponse.body.summary).toEqual(
            expect.objectContaining({
                amount: 3000
            })
        )
    })
})

