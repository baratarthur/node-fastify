import { knex as setupKnex, Knex } from 'knex'
import { env } from '.'

export const config: Knex.Config = {
    client: 'sqlite3',
    useNullAsDefault: true,
    migrations: {
        extension: "ts",
        directory: "db/migrations" 
    },
    connection: {
        filename: env.DATABASE_URL
    }
}

export const knex = setupKnex(config)
