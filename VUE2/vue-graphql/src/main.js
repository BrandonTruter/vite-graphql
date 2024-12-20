import Vue from "vue";

import App from "./App.vue";
import router from "./router";
import VueApollo from "vue-apollo";
import { createProvider } from "./provider";

import "./assets/main.css";

Vue.use(VueApollo);

new Vue({
  router,
  apolloProvider: createProvider(),
  render: (h) => h(App),
}).$mount("#app");
