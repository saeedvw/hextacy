import Vue from "vue";
import router from "./router";
import store from "./store";

import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faFileDownload,
  faFileUpload,
  faCogs,
  faCaretUp,
  faCaretDown,
  faFile,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faFileUpload);
library.add(faFileDownload);
library.add(faCogs);
library.add(faCaretDown);
library.add(faCaretUp);
library.add(faFile);
library.add(faTimes);

Vue.component("fa-icon", FontAwesomeIcon);

Vue.use(ElementUI);
Vue.config.productionTip = false;
import App from "./App.vue";

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
