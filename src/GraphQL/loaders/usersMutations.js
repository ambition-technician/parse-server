import { GraphQLNonNull, GraphQLString, GraphQLBoolean } from 'graphql';
import { mutationWithClientMutationId } from 'graphql-relay';
import UsersRouter from '../../Routers/UsersRouter';
import * as objectsMutations from '../helpers/objectsMutations';
import { getUserFromSessionToken } from './usersQueries';

const usersRouter = new UsersRouter();

const load = parseGraphQLSchema => {
  if (parseGraphQLSchema.isUsersClassDisabled) {
    return;
  }

  const signUpMutation = mutationWithClientMutationId({
    name: 'SignUp',
    description:
      'The signUp mutation can be used to create and sign up a new user.',
    inputFields: {
      userFields: {
        descriptions:
          'These are the fields of the new user to be created and signed up.',
        type:
          parseGraphQLSchema.parseClassTypes['_User'].classGraphQLCreateType,
      },
    },
    outputFields: {
      viewer: {
        description:
          'This is the new user that was created, signed up and returned as a viewer.',
        type: new GraphQLNonNull(parseGraphQLSchema.viewerType),
      },
    },
    mutateAndGetPayload: async (args, context, mutationInfo) => {
      try {
        const { userFields } = args;
        const { config, auth, info } = context;

        const { sessionToken } = await objectsMutations.createObject(
          '_User',
          userFields,
          config,
          auth,
          info
        );

        info.sessionToken = sessionToken;

        return {
          viewer: await getUserFromSessionToken(
            config,
            info,
            mutationInfo,
            'viewer.user.',
            true
          ),
        };
      } catch (e) {
        parseGraphQLSchema.handleError(e);
      }
    },
  });

  parseGraphQLSchema.addGraphQLType(
    signUpMutation.args.input.type.ofType,
    true,
    true
  );
  parseGraphQLSchema.addGraphQLType(signUpMutation.type, true, true);
  parseGraphQLSchema.addGraphQLMutation('signUp', signUpMutation, true, true);

  const logInMutation = mutationWithClientMutationId({
    name: 'LogIn',
    description: 'The logIn mutation can be used to log in an existing user.',
    inputFields: {
      username: {
        description: 'This is the username used to log in the user.',
        type: new GraphQLNonNull(GraphQLString),
      },
      password: {
        description: 'This is the password used to log in the user.',
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    outputFields: {
      viewer: {
        description:
          'This is the existing user that was logged in and returned as a viewer.',
        type: new GraphQLNonNull(parseGraphQLSchema.viewerType),
      },
    },
    mutateAndGetPayload: async (args, context, mutationInfo) => {
      try {
        const { username, password } = args;
        const { config, auth, info } = context;

        const { sessionToken } = (
          await usersRouter.handleLogIn({
            body: {
              username,
              password,
            },
            query: {},
            config,
            auth,
            info,
          })
        ).response;

        info.sessionToken = sessionToken;

        return {
          viewer: await getUserFromSessionToken(
            config,
            info,
            mutationInfo,
            'viewer.user.',
            true
          ),
        };
      } catch (e) {
        parseGraphQLSchema.handleError(e);
      }
    },
  });

  parseGraphQLSchema.addGraphQLType(
    logInMutation.args.input.type.ofType,
    true,
    true
  );
  parseGraphQLSchema.addGraphQLType(logInMutation.type, true, true);
  parseGraphQLSchema.addGraphQLMutation('logIn', logInMutation, true, true);

  const logOutMutation = mutationWithClientMutationId({
    name: 'LogOut',
    description: 'The logOut mutation can be used to log out an existing user.',
    outputFields: {
      viewer: {
        description:
          'This is the existing user that was logged out and returned as a viewer.',
        type: new GraphQLNonNull(parseGraphQLSchema.viewerType),
      },
    },
    mutateAndGetPayload: async (_args, context, mutationInfo) => {
      try {
        const { config, auth, info } = context;

        const viewer = await getUserFromSessionToken(
          config,
          info,
          mutationInfo,
          'viewer.user.',
          true
        );

        await usersRouter.handleLogOut({
          config,
          auth,
          info,
        });

        return { viewer };
      } catch (e) {
        parseGraphQLSchema.handleError(e);
      }
    },
  });

  parseGraphQLSchema.addGraphQLType(
    logOutMutation.args.input.type.ofType,
    true,
    true
  );
  parseGraphQLSchema.addGraphQLType(logOutMutation.type, true, true);
  parseGraphQLSchema.addGraphQLMutation('logOut', logOutMutation, true, true);

  const resetPasswordMutation = mutationWithClientMutationId({
    name: 'ResetPassword',
    description:
      'The resetPassword mutation can be used to reset the password of an existing user.',
    inputFields: {
      email: {
        descriptions: 'Email of the user that should receive the reset email',
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    outputFields: {
      ok: {
        description: "It's always true.",
        type: new GraphQLNonNull(GraphQLBoolean),
      },
    },
    mutateAndGetPayload: async ({ email }, context) => {
      const { config, auth, info } = context;

      await usersRouter.handleResetRequest({
        body: {
          email,
        },
        config,
        auth,
        info,
      });

      return { ok: true };
    },
  });

  parseGraphQLSchema.addGraphQLType(
    resetPasswordMutation.args.input.type.ofType,
    true,
    true
  );
  parseGraphQLSchema.addGraphQLType(resetPasswordMutation.type, true, true);
  parseGraphQLSchema.addGraphQLMutation(
    'resetPassword',
    resetPasswordMutation,
    true,
    true
  );

  const sendVerificationEmailMutation = mutationWithClientMutationId({
    name: 'SendVerificationEmail',
    description:
      'The sendVerificationEmail mutation can be used to send the verification email again.',
    inputFields: {
      email: {
        descriptions:
          'Email of the user that should receive the verification email',
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    outputFields: {
      ok: {
        description: "It's always true.",
        type: new GraphQLNonNull(GraphQLBoolean),
      },
    },
    mutateAndGetPayload: async ({ email }, context) => {
      try {
        const { config, auth, info } = context;

        await usersRouter.handleVerificationEmailRequest({
          body: {
            email,
          },
          config,
          auth,
          info,
        });

        return { ok: true };
      } catch (e) {
        parseGraphQLSchema.handleError(e);
      }
    },
  });

  parseGraphQLSchema.addGraphQLType(
    sendVerificationEmailMutation.args.input.type.ofType,
    true,
    true
  );
  parseGraphQLSchema.addGraphQLType(
    sendVerificationEmailMutation.type,
    true,
    true
  );
  parseGraphQLSchema.addGraphQLMutation(
    'sendVerificationEmail',
    sendVerificationEmailMutation,
    true,
    true
  );
};

export { load };
