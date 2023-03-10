// const { request } = require('express')
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(express.json(), morgan('tiny'))
app.use(cors())
app.use(requestLogger)
app.use(express.static('build'))


app.get('/', (request, response) => {
    response.send('pies')
    // morgan.token('host', function (req, res) {
    //     return req.hostname;
    // });

})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })

})

app.get('/api/persons/:id', (request, response, next) => {
    // const id = Number(request.params.id)
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }

        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        // eslint-disable-next-line no-unused-vars
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

// const generateId = () => {
//     const maxId = phoneNumbers.length > 0
//         ? Math.max(...phoneNumbers.map(n => n.id))
//         : 0
//     return maxId + 1
// }

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    // if (!body.name || !body.number) {
    //     return response.status(400).json({
    //         error: 'content missing'
    //     })
    // }

    // if (phoneNumbers.find(number => number.name === body.name)) {
    //     return response.status(400).json({
    //         error: 'name already in there'
    //     })
    // }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))

    // morgan.token('user-type', function (req, res) { return JSON.stringify(newNumber) })

})

app.get('/info', (request, response) => {
    Person.find({}).then(people => {
        response.send(`Phone book has info for ${people.length} people <br> ${new Date()}`)
    })
    //response.send(`Phone book has info for ${phoneNumbers.length} people <br> ${new Date()}`)
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformed id' })
    }
    if (error.name === 'ValidationError') {
        return response.status(400).send(error.message)
    }

    next(error)
}

app.use(errorHandler)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} at http://localhost:${PORT}`)
})
