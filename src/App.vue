<template>
  <div id="app">
    <div class="navbar">
      <input @change="fileOnChange" ref="file_input" type="file" hidden />
      <div class="navbar_logo">
        <img class="logo" :src="require('./assets/hextacy_logo.png')" alt="" />
        HEXTACY
      </div>
      <div class="navbar_items">
        <div class="navbar_item">
          <i class="el-icon-document-add icon"></i>
          <div class="navbar_item_title">New File</div>
        </div>
        <div class="navbar_item" @click="onSaveFile">
          <i class="el-icon-download icon"></i>
          <div class="navbar_item_title">Export File</div>
        </div>
        <div class="navbar_item" @click="onOpenFile">
          <i class="el-icon-upload2 icon"></i>
          <div class="navbar_item_title">Open File</div>
        </div>
        <div class="navbar_item">
          <i class="el-icon-setting icon"></i>
          <div class="navbar_item_title">Settings</div>
        </div>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script>
import { mapActions, mapMutations } from "vuex";
export default {
  name: "App",
  methods: {
    ...mapMutations(["addArrayBuffer", "addDataView", "addFilename"]),
    ...mapActions(["saveFile"]),
    onSaveFile() {
      this.saveFile();
    },
    onOpenFile() {
      this.$refs.file_input.click();
    },
    async fileOnChange(e) {
      console.log(e);
      if (e.target.files.length > 0) {
        const f = e.target.files[0];
        console.log(f.name);
        const b = await f.arrayBuffer();
        this.addArrayBuffer(b);
        this.addDataView(new DataView(b));
        this.addFilename(f.name);
      }
    },
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap");
html {
  width: 100%;
  height: 100%;
  padding: 0px;
  margin: 0px;
}
body {
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
}
#app {
  width: 100%;
  height: 100%;
  font-family: "Roboto";
}
.navbar {
  height: 70px;
  background-color: #ebeef5;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px 10px;
  justify-content: space-between;
}
.navbar_items {
  display: flex;
}
.navbar_item {
  width: 60px;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.navbar_logo {
  font-size: 2rem;
  display: flex;
  align-items: center;
}
.icon {
  font-size: 30px;
  line-height: 40px;
}
.navbar_item_title {
  font-size: 0.7rem;
}
.logo {
  height: 50px;
}
</style>
