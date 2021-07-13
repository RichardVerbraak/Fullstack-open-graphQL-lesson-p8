const { ApolloServer, gql } = require('apollo-server')

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

	type Query {
		personCount: Int!
		allPersons: [Person!]!
		findPerson(name: String!): Person
	}
`

// Resolvers is how GraphQL should respond to these queries (the logic behind the queries)
// There have to be resolvers for each field in each type of schema
// If there isn't, Apollo will define default resolvers for them, these are accessed through the root parameter (root being the object)
// Person: { name: (root) => root.name} is the same as person.name in this case
const resolvers = {
	Query: {
		personCount: () => persons.length,
		allPersons: () => persons,
		findPerson: (root, args) => persons.find((p) => p.name === args.name),
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
