// Must run before any modules are imported so PrismaClient picks up the test DATABASE_URL
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../../.env') })
process.env['DATABASE_URL'] = process.env['DATABASE_URL_TEST'] ?? ''
