const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const jsonwebtoken = require('jsonwebtoken');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  enum Rank {
    UNRANKED
    BRONZE
    SILVER
    GOLD
    PLATINIUM
    DIAMOND
    MASTER
    CHALLENGER
  }

  enum Availability {
    ONLINE
    IN_GAME
    IN_LOBBY
    IN_CHAMPION_SELECT
    BUSY
    AWAY
  }

  type User {
    id: Int
    name: String
    rank: Rank
    availability: Availability
    icon: Int
  }

  type Lobby {
    id: Int
    name: String
    gamemode: Gamemode
    maxPlayer: Int
    players: [User]
  }

  type Gamemode {
    name: String
    map: Int
  }

  type Query {
    user(id: Int!): User
    users: [User]
    lobby(id: Int!): Lobby
    lobbies: [Lobby]
  }

  type Mutation {
    connect(username: String!, iconId: Int!): String
  } 
`;

const users = [{
    id: 5,
    name: 'Neekhaulas',
    rank: 'CHALLENGER',
    availability: 'IN_GAME'
},
{
    id: 7,
    name: 'Boto',
    rank: 'UNRANKED',
    availability: 'AWAY'
},
{
    id: 8,
    name: 'Deudly',
    rank: 'BRONZE',
    availability: 'ONLINE'
},
{
    id: 9,
    name: 'Blitzcrank',
    rank: 'GOLD',
    availability: 'IN_LOBBY'
}];

const lobbies = [{
    id: 1,
    name: 'Super lobby',
    gamemode: {
        name: 'Kill Deudly',
        map: 12
    },
    maxPlayer: 10,
    players: [
        {
            id: 9,
            name: 'Blitzcrank',
            rank: 'GOLD',
            availability: 'IN_LOBBY'
        }
    ]
}];

let lastId = 0;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    users: () => users,
    user: (root, args) => users.filter(user => user.id == args.id)[0],
    lobbies: () => lobbies,
    lobby: (root, args) => lobbies.filter(lobby => lobby.id == args.id)[0],
  },
  Mutation: {
    connect: (root, args, context) => {
        const token = jsonwebtoken.sign({
            id: lastId++
        }, 'somesuperdupersecret', { expiresIn: '7d' });
        return token;
    },
  }
};



const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        // get the user token from the headers
        const token = req.headers.authorization || '';

        console.log(token);
        
        if(token != '') {
            var decoded = jsonwebtoken.verify(token, 'somesuperdupersecret', function(err, decoded) {
                if(err) {
                    return null;
                }
                return decoded;
            });
            return decoded;
        }
        return null;
    },
});

const app = express();

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`),
);