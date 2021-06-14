<template>
  <div class="controls_sidebar">
    <div class="side_bar_group_title">Base</div>
    <el-button-group>
      <el-button
        @click="() => setBase(16)"
        :type="base == 16 ? 'info' : 'default'"
        size="mini"
        >HEX<sub>16</sub>
      </el-button>
      <el-button
        @click="() => setBase(10)"
        :type="base == 10 ? 'info' : 'default'"
        size="mini"
        >DEC<sub>10</sub></el-button
      >
      <el-button
        @click="() => setBase(8)"
        :type="base == 8 ? 'info' : 'default'"
        size="mini"
        >OCT<sub>8</sub></el-button
      >
      <el-button
        @click="() => setBase(2)"
        :type="base == 2 ? 'info' : 'default'"
        size="mini"
        >BIN<sub>2</sub></el-button
      >
    </el-button-group>
    <div class="side_bar_group_title">Address</div>
    <div class="input">
      <label for="current_address">Current Address</label>
      <el-input
        readonly
        :value="
          '0x' +
          currentAddress
            .toString(base)
            .padStart(maxAddress.toString(base).length, (0).toString(base))
            .toUpperCase()
        "
        class="input_field"
        size="mini"
      ></el-input>
      <el-button size="mini" type="info">Memo</el-button>
    </div>

    <div class="input">
      <label for="current_address">Last Address</label>
      <el-input
        readonly
        class="input_field"
        :value="'0x' + maxAddress.toString(base).toUpperCase()"
        size="mini"
      ></el-input>
    </div>

    <div class="input">
      <label for="current_address">Go To</label>
      <el-input class="input_field" size="mini"></el-input>
      <el-button size="mini"><i class="el-icon-arrow-right"></i></el-button>
    </div>
    <div class="side_bar_group_title">Search</div>

    <div class="input">
      <label for="current_address">Search For</label>
      <el-input class="input_field" size="mini"></el-input>
    </div>
    <el-button size="mini" type="info">Find Next</el-button>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";

export default {
  name: "ControlsSidebar",
  data() {
    return {};
  },
  computed: {
    ...mapState({
      base: (state) => state.settings.base,
      currentAddress: (state) =>
        state.data.currentStartingAddress + state.data.cursorPosition,
      maxAddress: (state) => {
        if (state.data.current_buffer_index === null) {
          return 0;
        }
        return (
          state.data.buffers[state.data.current_buffer_index].byteLength - 1
        );
      },
    }),
  },
  methods: {
    ...mapMutations(["setBase"]),
    changeBase(e) {
      console.log(e);
      this.setBase(e);
    },
  },
};
</script>

<style scoped lang="scss">
.controls_sidebar {
  width: 400px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  /*padding: 20px 0px;*/
  border-right: 1px solid #dcdfe6;
}
.input {
  display: flex;
  width: 100%;
  margin: 5px;
  align-items: flex-end;
}
.input label {
  font-size: 0.7rem;
  width: 100px;
  /*background-color: grey;*/
}
.input_field {
  width: 250px;
}
.side_bar_group_title {
  height: 30px;
  text-align: left;
  padding-left: 10px;
  display: flex;
  align-items: center;
  width: 100%;
  background-color: #dcdfe6;
  color: #303133;
  margin-bottom: 10px;
  margin-top: 10px;
}
.side_bar_group_title:nth-child(1) {
  margin-top: 0px;
}
</style>
