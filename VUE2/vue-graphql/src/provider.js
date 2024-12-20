import Vue from "vue";
import VueApollo from "vue-apollo";
import { ApolloClient } from "apollo-client";
// import { restartWebsockets } from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";

// Install the vue plugin
Vue.use(VueApollo);

// Name of the localStorage item
const AUTH_TOKEN = "apollo-token";

// Http endpoint
const httpEndpoint = "http://localhost:4000/graphql";

// Files URL root
export const filesRoot =
  process.env.VUE_APP_FILES_ROOT ||
  httpEndpoint.substr(0, httpEndpoint.indexOf("/graphql"));

const myCache = {
  cache: new InMemoryCache(),
  connectToDevTools: true,
};

Vue.prototype.$filesRoot = filesRoot;

// Config
const defaultOptions = {
  // You can use `https` for secure connection (recommended in production)
  httpEndpoint,
  // You can use `wss` for secure connection (recommended in production)
  // Use `null` to disable subscriptions
  wsEndpoint: process.env.VUE_APP_GRAPHQL_WS || "ws://localhost:4000/graphql",
  // LocalStorage token
  tokenName: AUTH_TOKEN,
  // Enable Automatic Query persisting with Apollo Engine
  persisting: false,
  // Use websockets for everything (no HTTP)
  // You need to pass a `wsEndpoint` for this to work
  websocketsOnly: false,
  // Is being rendered on the server?
  ssr: false,

  // Override default apollo link
  // note: don't override httpLink here, specify httpLink options in the
  // httpLinkOptions property of defaultOptions.
  // link: myLink

  // Override default cache
  cache: myCache,

  // Override the way the Authorization header is set
  // getAuth: (tokenName) => ...

  // Additional ApolloClient options
  // apollo: {
  //   // Can be used to pass headers to the server
  //   // tokenName: AUTH_TOKEN,
  // },

  // Client local data (see apollo-link-state)
  // clientState: {
  //   resolvers: {
  //     Mutation: {
  //       updateNetworkStatus: (_, { isConnected }, { cache }) => {
  //         cache.writeData({ data: { isConnected } });
  //         return null;
  //       }
  //     }
  //   },
  //   defaults: { isConnected: true }
  // }
};

// Call this in the Vue app file
export function createProvider(options = {}) {
  // Create apollo client
  const { apolloClient, wsClient } = new ApolloClient({
    ...defaultOptions,
    ...options,
  });

  // Create vue apollo provider
  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
    defaultOptions: {
      $query: {
        fetchPolicy: "cache-and-network",
      },
    },
    errorHandler(error) {
      // eslint-disable-next-line no-console
      console.log(
        "%cError",
        "background: red; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;",
        error.message
      );
    },
  });
  return apolloProvider;
}

// Manually call this when user log in
export async function onLogin(apolloClient, token) {
  if (typeof localStorage !== "undefined" && token) {
    localStorage.setItem(AUTH_TOKEN, token);
  }

  try {
    await apolloClient.resetStore();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log("%cError on cache reset (login)", "color: orange;", e.message);
  }
}

// Manually call this when user log out
export async function onLogout(apolloClient) {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN);
  }

  try {
    await apolloClient.resetStore();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log("%cError on cache reset (logout)", "color: orange;", e.message);
  }
}
