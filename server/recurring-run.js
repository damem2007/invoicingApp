import { initializeDatabase } from './db/index.js'
import { runDueSchedules } from './services/recurrence.js'
const db = initializeDatabase()
console.log(JSON.stringify({ created: runDueSchedules(db) }))
db.close()
