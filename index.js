const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

morgan.token('body', function getBody(request) {
  return JSON.stringify(request.body)
})

const app = express()

app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
]

app.get('/info', (request, response) => {
  const info = `<p>Phonebook has info for ${persons.length} people</p>${new Date()}`
  response.send(info)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || body.name === '') {
    return response.status(400).json({error: 'name missing'})
  }

  if (persons.some(person => person.name.toLowerCase() === body.name.toLowerCase())) {
    return response.status(400).json({error: 'name must be unique'})
  }

  if (!body.number || body.number === '') {
    return response.status(400).json({error: 'number missing'})
  }

  const person = {
    name: body.name,
    number: body.number || null,
    id: Math.floor(Math.random() * Math.floor(1000))
  }

  persons = persons.concat(person)

  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})