const knex = require('knex')
const app = require('./app')
const { PORT, DATABASE_URL } = require('./config')

// The following is necessary to return all timestamps in UTC format:
const types = require('pg').types;
const TIMESTAMPTZ_OID = 1184;
const TIMESTAMP_OID = 1114;
types.setTypeParser(TIMESTAMPTZ_OID, val => val);
types.setTypeParser(TIMESTAMP_OID, val => val);

const db = knex({
	client: 'pg',
	connection: DATABASE_URL,
})

app.set('db', db)

app.listen(PORT, () => {
	console.log(`Server listening at http://localhost:${PORT}`)
})
