const express = require('express');
const expressGraphQL = require('express-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql');
const app = express();

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const authorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This represents an author',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: { 
      type: new GraphQLList(bookType),
      resolve: (author) => {
        return books.filter(book => book.authorId === author.id)
      } 
    }
  })
})

const bookType = new GraphQLObjectType({
  name: 'Book',
  description: 'This represents a book written by an author',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: authorType,
      resolve: (book) => {
        return authors.find(author => author.id === book.authorId)
      }
    }
  })
})

// const schema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: 'HelloWorld',
//     fields: () => ({
//       message: { 
//         type: GraphQLString ,
//         resolve: () => 'Hello World'
//       }
//     })
//   })
// });

const rootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () =>({
    books: {
      type: new GraphQLList(bookType),
      description: 'List of all books',
      resolve: () => books
    },
    book: {
      type: bookType,
      description: 'A single book',
      args: {
        id: { type: GraphQLInt}
      },
      resolve: (parent, args) => books.find(book => book.id === args.id)
    },
    authors: {
      type: new GraphQLList(authorType),
      description: 'List of all authors',
      resolve: () => authors
    },
    author: {
      type: authorType,
      description: 'Single author',
      args: {
        id: { type: GraphQLInt}
      },
      resolve: (parent, args) => authors.find(author => author.id === args.id)
    }
  })
})

const rootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addBook: {
      type: bookType,
      description: 'Add a book',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
      },
        resolve: (parent, args) => {
          const book = { id: books.length + 1, name: args.name, authorId: args.authorId };
          books.push(book);
          return book;
        }
    },
    addAuthor: {
      type: authorType,
      description: 'Add an author',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
        resolve: (parent, args) => {
          const author = { id: authors.length + 1, name: args.name };
          authors.push(author);
          return author;
        }
    }
  })
})

const schema = new GraphQLSchema({
  query: rootQueryType,
  mutation: rootMutationType
})

app.use('/graphql', expressGraphQL({
  schema: schema,
  graphiql: true
}))
app.listen(5000., () => console.log('Server Running'))