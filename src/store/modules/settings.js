const state = {
  columns: 4,
  column_width: 4,
  base: 16,
  ascii_preview_enabled: true,
};

const getters = {
  settings: (state) => ({ ...state }),
};

const actions = {};

const mutations = {
  setBase(state, b) {
    state.base = b;
  },
};

export default { state, getters, actions, mutations };
