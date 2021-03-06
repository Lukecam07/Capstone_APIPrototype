import * as graphqlHTTP from 'express-graphql';

import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import { Router, Request, Response, NextFunction } from "express";
const routes = Router();

import { InformationType, InformationQueries, InformationMutations } from "./../graphql/informationSchema";
import { NodeType, NodeQueries, NodeMutations } from "./../graphql/nodeSchema";
import { CommentType, CommentQueries, CommentMutations } from "./../graphql/commentSchema";
import {CourseQueries, CourseMutations} from './../graphql/courseSchema';
import { UserType, UserQueries, UserMutations } from "./../graphql/userSchema";
import { AccountType, AccountQueries, AccountMutations } from "./../graphql/accountSchema";
// WE SHOULD IMPLEMENT THIS https://github.com/Urigo/graphql-scalars?source=post_page-----3f8a38965b53----------------------

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        ...InformationQueries,
        ...NodeQueries,
        ...CommentQueries,
        ...CourseQueries,
        ...UserQueries,
        ...AccountQueries
    }
});

const RootMutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        ...InformationMutations,
        ...NodeMutations,
        ...CommentMutations,
        ...UserMutations,
        ...AccountMutations,
        ...CourseMutations
    }
});

const RootSchema = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
  });

const root = { hello: () => 'Hello world!' };

routes.use('/graphql', (req, res) => {
    graphqlHTTP({
    schema: RootSchema,
    rootValue: root,
    graphiql: true,
    context: {req},

    })(req,res);
});

export default routes;