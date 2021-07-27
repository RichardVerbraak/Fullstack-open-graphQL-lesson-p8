const { ApolloServer, UserInputError, gql } = require('apollo-server')
const { v1: uuidv1 } = require('uuid')

let persons = [
	{
		name: 'Arto Hellas',
		phone: '040-123543',
		street: 'Tapiolankatu 5 A',
		city: 'Espoo',
		id: '3d594650-3436-11e9-bc57-8b80ba54c431',
	},
	{
		name: 'Matti Luukkainen',
		phone: '040-432342',
		street: 'Malminkaari 10 A',
		city: 'Helsinki',
		id: '3d599470-3436-11e9-bc57-8b80ba54c431',
	},
	{
		name: 'Venla Ruuska',
		street: 'Nallemäentie 22 C',
		city: 'Helsinki',
		id: '3d599471-3436-11e9-bc57-8b80ba54c431',
	},
]

// GraphQL Schema
// The exclamation mark tells that the fields for Person and the return values for the query has to have a value (not be null)

// Types
// Mutation: This is a type used for operations that cause change
// Enum: A type used to restrict the data returned by the set values, the values being YES & NO in this case (it's nullable so could be left out)

const typeDefs = gql`
	type Address {
		street: String!
		city: String!
	}

	type Person {
		name: String!
		phone: String
		address: Address!
		id: ID!
	}

	enum YesNo {
		YES
		NO
	}

	type Query {
		personCount: Int!
		allPersons(phone: YesNo): [Person!]!
		findPerson(name: String!): Person
	}

	type Mutation {
		addPerson(
			name: String!
			phone: String
			street: String!
			city: String!
		): Person
		editNumber(name: String!, phone: String!): Person
	}
`

// Resolvers is how GraphQL should respond to these queries (the logic behind the queries)
// There have to be resolvers for each field in each type of schema
// If there isn't, Apollo will define default resolvers for them, these are accessed through the root parameter (root being the object)
// Person: { name: (root) => root.name} is the same as person.name in this case

// Since the persons in the array do not have an address field, we have to add a resolver that returns the street and city when there is a query for address
// So when a Person object gets returned, every field is using it's default resolver to return the object except for the address field

// You can have multiple types of queries like so and also multiple of the same query (have to give alternative name)
// It's also beneficial to name the query like the last example

//// Multiple
// query {
// 	personCount
// 	allPersons {
// 		name
// 	}
// }

// Multiple of the same
// query PhoneOwnerShip {
// 	hasPhone: allPersons(phone: YES) {
// 		name
// 	}
// 	phoneless: allPersons(phone: NO) {
// 		name
// 	}
// }

const resolvers = {
	Query: {
		personCount: () => persons.length,
		allPersons: (root, args) => {
			if (!args.phone) {
				return persons
			}

			// YES: only returns person object if it has a phone prop
			// NO: returns person without phone prop
			const personsWithPhone = (person) => {
				return args.phone === 'YES' ? person.phone : !person.phone
			}

			return persons.filter(personsWithPhone)
		},
		findPerson: (root, args) => persons.find((p) => p.name === args.name),
	},
	Person: {
		address: (root) => {
			return {
				street: root.street,
				city: root.city,
			}
		},
	},
	Mutation: {
		addPerson: (root, args) => {
			const samePerson = persons.find((person) => {
				return person.name === args.name
			})

			if (samePerson) {
				throw new UserInputError('Name must be unique', {
					invalidArgs: args.name,
				})
			}

			const id = uuidv1()
			const person = { ...args, id }
			persons = persons.concat(person)
			return person
		},
		editNumber: (root, args) => {
			const person = persons.find((person) => {
				return person.name === args.name
			})

			if (!person) {
				return null
			}

			const updatedPerson = { ...person, phone: args.phone }

			// Update the persons array on the server
			persons.map((person) => {
				return person.name === args.name ? updatedPerson : person
			})

			return updatedPerson
		},
	},
}

// These combined make up the Apollo server
const server = new ApolloServer({
	typeDefs,
	resolvers,
})

server.listen().then(({ url }) => {
	console.log(`Server ready at ${url}`)
})
