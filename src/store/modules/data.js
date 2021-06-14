const state = {
  current_buffer_index: null,
  filenames: [],
  buffers: [],
  dataviews: [],
  maxLines: null,
  cursorPosition: 0,
  currentStartingAddress: 0,
  current_bytes: [],
};

const getters = {
  current_buffer: (state) => state.buffers[state.current_buffer_index],
  current_dataview: (state) => state.dataviews[state.current_buffer_index],
  current_bytesArray: (state, getters) => {
    if (!getters.current_bytes || state.current_buffer_index === null) {
      return [];
    }
    return getters.current_bytes.map((v) =>
      v
        .toString(getters.settings.base)
        .toUpperCase()
        .padStart(getters.byteSize, (0).toString(getters.settings.base))
    );
  },
  filenames: (state) => state.filenames,
  byteSize: (state, getters) => {
    return (255).toString(getters.settings.base).length;
  },
  bytesPerPage: (state, getters) => {
    return (
      (state.maxLines - 1) *
      getters.settings.column_width *
      getters.settings.columns
    );
  },

  current_bytes: (state) => {
    return state.current_bytes;
  },
};

const actions = {
  initialize({ commit, dispatch }) {
    const randomBytes = [];
    for (let i = 0; i < 1024; i++)
      randomBytes[i] = Math.floor(Math.random() * 255);
    const b = Uint8Array.from(randomBytes);
    console.log({ b });
    commit("addArrayBuffer", b.buffer);
    commit("addDataView", new DataView(b.buffer));
    commit("addFilename", "Untitled");
    commit("setCurrentBufferIndex", 0);
    dispatch("updateCurrentBytes");
  },

  updateCurrentBytes({ commit, getters, state }) {
    if (
      !getters.current_buffer ||
      !getters.current_dataview ||
      state.current_buffer_index === null
    ) {
      return;
    }
    let bytes = [];
    for (
      let i = state.currentStartingAddress;
      i < getters.bytesPerPage + state.currentStartingAddress;
      i++
    ) {
      if (i >= getters.current_buffer.byteLength) {
        break;
      }
      const b = getters.current_dataview.getUint8(i);
      bytes.push(b);
    }
    commit("setCurrentBytes", bytes);
  },
  removeBytes({ commit, getters, state, dispatch }, { offset, number }) {
    const temp = getters.current_dataview;
    const n = new Uint8Array(temp.byteLength - number);
    const a = new Uint8Array(temp.buffer, 0, offset);
    const b = new Uint8Array(temp.buffer, offset + number);
    n.set(a, 0);
    n.set(b, a.length);
    commit("setArrayBuffer", { i: state.current_buffer_index, a: n.buffer });
    commit("setDataView", {
      i: state.current_buffer_index,
      d: new DataView(n.buffer),
    });
    dispatch("updateCurrentBytes");
  },
  insertBytes({ commit, dispatch, state, getters }, { offset, number, value }) {
    console.log({ offset, number, value });
    const temp = getters.current_dataview;
    const newBytes = new Uint8Array(number);
    for (let i = 0; i < number; i++) {
      newBytes[i] = value;
    }
    const n = new Uint8Array(temp.byteLength + newBytes.length);
    const a = new Uint8Array(temp.buffer, 0, offset);
    const b = new Uint8Array(temp.buffer, offset);
    n.set(a, 0);
    n.set(newBytes, a.length);
    n.set(b, a.length + newBytes.length);

    commit("setDataView", {
      i: state.current_buffer_index,
      d: new DataView(n.buffer),
    });
    commit("setArrayBuffer", { i: state.current_buffer_index, a: n.buffer });
    dispatch("updateCurrentBytes");
  },
  saveFile({ getters }) {
    const b = new Blob([new Uint8Array(getters.current_dataview.buffer)], {
      type: "octet/stream",
    });
    const url = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.setAttribute("download", "data");
    a.setAttribute("href", url);
    a.style.visibility = "hidden";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
};

const mutations = {
  setMaxLines(state, l) {
    state.maxLines = l;
  },
  setCursorPosition(state, p) {
    state.cursorPosition = p;
  },
  setStartingAddress(state, p) {
    state.currentStartingAddress = p;
  },
  addArrayBuffer(state, b) {
    state.buffers[state.buffers.length] = b;
  },
  addDataView(state, d) {
    state.dataviews[state.dataviews.length] = d;
  },
  setArrayBuffer(state, { i, a }) {
    state.buffers = state.buffers.map((ab, j) => {
      if (i === j) {
        return a;
      }
      return ab;
    });
  },
  setDataView(state, { i, d }) {
    state.dataviews = state.dataviews.map((dv, j) => {
      if (j === i) {
        return d;
      }
      return dv;
    });
  },
  setFilename(state, { i, n }) {
    state.filenames[i] = n;
  },
  addFilename(state, n) {
    //state.filenames[state.filenames.length] = n;
    state.filenames = [...state.filenames, n];
  },
  setCurrentBufferIndex(state, i) {
    state.current_buffer_index = i;
  },
  setCurrentBytes(state, bytes) {
    state.current_bytes = bytes;
  },
  changeByte(state, { pos, b }) {
    state.dataviews[state.current_buffer_index].setUint8(pos, b);
  },
};

export default { state, getters, actions, mutations };
