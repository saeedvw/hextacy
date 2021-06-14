import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import SettingsModule from "./modules/settings";
import DataModule from "./modules/data";

export default new Vuex.Store({
  modules: {
    settings: SettingsModule,
    data: DataModule,
  },
});
