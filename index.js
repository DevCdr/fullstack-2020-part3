require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const personModel = require('./models/person')

morgan.token('body', function getBody(request) {
  return JSON.stringify(request.body)
})

const app = express()

app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

app.get('/info', (request, response) => {
  personModel.countDocuments()
    .then(count => {
      const info = `<p>Phonebook has info for ${count} people</p>${new Date()}`
      response.send(info)
    })
})

app.get('/api/persons', (request, response) => {
  personModel.find()
    .then(persons => response.json(persons.map(person => person.toJSON())))
})

app.get('/api/persons/:id', (request, response, next) => {
  personModel.findById(request.params.id)
    .then(person => {
      person
        ? response.json(person.toJSON())
        : response.status(404).end()
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  personModel.findByIdAndRemove(request.params.id)
    .then(() => response.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new personModel({
    name: body.name,
    number: body.number || null
  })

  person.save()
    .then(savedPerson => response.json(savedPerson.toJSON()))
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number || null
  }

  personModel.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => response.json(updatedPerson.toJSON()))
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))