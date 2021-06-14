<template>
  <div class="home">
    <ControlsSidebar />
    <div class="editors">
      <div class="tabs">
        <div
          @click="() => onTabClick(i)"
          class="tab"
          v-for="(fname, i) in files"
          :key="i"
          :data-active="currentIndex === i"
        >
          <fa-icon icon="file" class="file_logo"></fa-icon>
          <div class="tab_name">{{ fname }}</div>
          <fa-icon icon="times" class="tab_close_icon"></fa-icon>
        </div>
      </div>
      <Editor />
    </div>
  </div>
</template>

<script>
import Editor from "../components/Editor";
import ControlsSidebar from "../components/ControlsSidebar";
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";

export default {
  name: "Home",
  data() {
    return {};
  },
  computed: {
    ...mapState({ currentIndex: (state) => state.data.current_buffer_index }),
    ...mapGetters({ files: "filenames" }),
  },
  components: { Editor, ControlsSidebar },
  methods: {
    ...mapActions(["updateCurrentBytes"]),
    ...mapMutations(["setCurrentBufferIndex"]),
    onTabClick(i) {
      this.setCurrentBufferIndex(i);
      this.updateCurrentBytes();
    },
  },
};
</script>

<style scoped lang="scss">
.home {
  width: 100%;
  height: calc(100% - 70px);
  display: flex;
  flex-direction: row;
}
.editors {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  width: 100%;
  margin: 0px;
  padding: 0px;
}
.tabs {
  height: 30px;
  border-top: 1px solid #dcdfe6;
  border-bottom: 1px solid #909399;
  background-color: #e4e7ed;
  display: flex;
}
.tab {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  height: 100%;
  width: 120px;
  background-color: #e4e7ed;
  color: #303133;
}
.tab[data-active="true"] {
  background-color: #c0c4cc;
}
.tab:hover {
  background-color: darken(#c0c4cc, 3%);
}
.file_logo {
  font-size: 0.8rem;
}
.tab_name {
  font-size: 0.9rem;
  max-width: 80px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  /*padding: 0px 10px;*/
}
.tab_close_icon {
  font-size: 0.7rem;
  opacity: 0.5;
}
.tab_close_icon:hover {
  opacity: 1;
}
</style>
