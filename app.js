const express = require('express')
const app = express()
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbpath = path.join(__dirname, 'todoApplication.db')
app.use(express.json())
let db = null
const initialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is start! ')
    })
  } catch (e) {
    console.log(`Error message ${e.message}`)
    process.exit(1)
  }
}

initialize()

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

app.get('/todos/', async (request, response) => {
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `SELECT * FROM todo WHERE
                     todo LIKE '%${search_q}%'
                     AND status = '${status}'
                     AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`
      break
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }

  const data = await db.all(getTodosQuery)
  response.send(data)
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodosQuery = `select * from todo where id = ${todoId}`
  const data = await db.get(getTodosQuery)
  response.send(data)
})

app.post('/todos/', async (request, response) => {
  const getDetails = request.body
  const {id, todo, priority, status} = getDetails
  const getTodosQuery = `insert into todo (id,todo,priority,status)
    values(
        '${id}',
        '${todo}',
        '${priority}',
        '${status}'
    );`
  await db.run(getTodosQuery)
  response.send('Todo Successfully Added')
})

const hasPriority = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasTodo = requestQuery => {
  return requestQuery.todo !== undefined
}

const hasStatus = requestQuery => {
  return requestQuery.status !== undefined
}

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const {
    todo = previousTodo.todo,
    status = previousTodo.status,
    priority = previousTodo.priority,
  } = request.body

  let getupdateQuery = ''
  switch (true) {
    case hasStatus(request.query):
      getupdateQuery = `update todo set status = '${status}' where id =${todoId};`
      await db.run(getupdateQuery)
      response.send('Status Updated')
      break

    case hasPriority(request.query):
      getupdateQuery = `update todo set priority = '${priority}'  where id =${todoId};`
      await db.run(getupdateQuery)
      response.send('Priority Updated')
      break

    case hasTodo(request.query):
      getupdateQuery = `update todo set todo = '${todo}' where id =${todoId};`
      await db.run(getupdateQuery)
      response.send('Todo Updated')
      break
    default:
      break
  }
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getdeleteQuery = `delete from todo where id = ${todoId};`
  await db.run(getdeleteQuery)
  response.send('Todo Deleted')
})
module.exports = app
