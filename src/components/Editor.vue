<template>
  <div class="ui">
    <div
      @contextmenu.prevent="() => {}"
      class="editor"
      @click="ctxMenuShowen = false"
    >
      <el-dialog
        title="Insert Bytes"
        :visible.sync="insertBytesDialogShowen"
        width="30%"
      >
        <div>
          <div class="field">
            <span class="field_label">Pattern/Value</span>
            <el-input-number
              size="small"
              v-model="insertBytesData.value"
              :min="0"
              :max="255"
            ></el-input-number>
          </div>
          <div class="field">
            <span class="field_label">Number/How many</span>
            <el-input-number
              :min="1"
              size="small"
              v-model="insertBytesData.number"
            ></el-input-number>
          </div>
          <div class="field">
            <span class="field_label">insert At current position</span>
            <el-checkbox
              v-model="insertBytesData.useCurrentAddress"
            ></el-checkbox>
          </div>
          <div class="field">
            <span class="field_label">Offset/Address</span>
            <el-input-number
              :disabled="insertBytesData.useCurrentAddress"
              size="small"
              v-model="insertBytesData.offset"
              :min="0"
              :max="dataArrayBuffer ? dataArrayBuffer.byteLength - 1 : 0"
            ></el-input-number>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="insertBytesDialogShowen = false">Cancel</el-button>
          <el-button type="primary" @click="onInsertBytesClick"
            >Insert</el-button
          >
        </span>
      </el-dialog>
      <ContextMenu
        :style="{
          position: 'absolute',
          top: ctxMenuTop + 'px',
          left: ctxMenuLeft + 'px',
        }"
        :showen="ctxMenuShowen"
        @delete="deleteByte"
        @selectAll="selectAll"
        @selectNone="selectNone"
        @insert="insertBytesDialogShowen = true"
      />
      <div
        tabindex="1"
        class="content"
        @keypress="contentOnKeyPress"
        @blur="setCursorPosition(null)"
        ref="content"
      >
        <div class="scrollbar"></div>
        <div
          class="up_button"
          @mousedown="() => setScrollTimeOut(scrollUp)"
          @mouseup="removeScrollTimeout"
          @click="scrollUp"
        >
          <fa-icon icon="caret-up" />
        </div>
        <div
          :style="{
            height: scrollBarThumbHeight + 'px',
            top: scrollBarThumbTop + 'px',
          }"
          class="scrollbar_thumb"
        ></div>
        <div
          class="down_button"
          @mousedown="() => setScrollTimeOut(scrollDown)"
          @mouseup="removeScrollTimeout"
          @click="scrollDown"
        >
          <fa-icon icon="caret-down" />
        </div>
        <div class="upper_address">
          <span v-if="false" class="address"
            >{{ "Address".padStart(addressWidth + 1, "&nbsp;") }}
          </span>
          <span style="padding-right: 8px">
            {{ "&nbsp;".repeat(addressWidth) }}</span
          >
          <span class="column" v-for="(c, j) in rows[0]" :key="j">
            <span style="padding-right: 4px" v-for="(b, k) in c" :key="k">{{
              (k + j * column_width)
                .toString(base)
                .toUpperCase()
                .padStart(byteSize, (0).toString(base))
            }}</span>
          </span>
        </div>
        <span v-for="(r, i) in rows" :key="i">
          <span class="address">{{
            (currentStartingAddress + i * columns * column_width)
              .toString(base)
              .toUpperCase()
              .padStart(addressWidth, (0).toString(base))
          }}</span>
          <span v-for="(c, j) in r" :key="j" class="column">
            <span
              class="byte"
              v-for="(b, k) in c"
              :key="k"
              @click="() => setCursorPosition(getByteAddress(i, j, k))"
              @mousedown="byteMouseDown"
              @mouseup="byteMouseUp"
              @mouseover="byteMouseOver"
              @blur="setCursorPosition(null)"
              :data-editing="cursorPosition === getByteAddress(i, j, k)"
              :data-offset="getByteAddress(i, j, k)"
              @contextmenu="editorOnContextMenu"
              :data-selected="
                selectionStartOffset !== null &&
                selectionEndOffset !== null &&
                getByteAddress(i, j, k) >= selectionStartOffset &&
                getByteAddress(i, j, k) <= selectionEndOffset
              "
              >{{ b }}</span
            >
          </span>
          <span class="ascii_preview" v-if="ascii_preview_enabled">
            <span v-for="(c, j) in r" :key="'ascii_' + j">
              <span v-for="(b, k) in c" :key="'char' + k">{{
                String.fromCharCode(parseInt(b, base)).trim() || "."
              }}</span>
            </span>
          </span>
          <br />
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import ContextMenu from "./ContextMenu";
import { mapGetters, mapState, mapActions, mapMutations } from "vuex";

export default {
  name: "Editor",
  components: { ContextMenu },
  data() {
    return {
      editing_index: null,
      ctxMenuShowen: false,
      ctxCursor: null,
      contentHeight: null,
      cursorBytePosition: 0,
      thumbActive: false,
      scrollingTimeout: null,
      thumbPosY: 0,
      ctxMenuLeft: 0,
      ctxMenuTop: 0,
      selectionStartOffset: null,
      selectionEndOffset: null,
      selecting: false,
      insertBytesDialogShowen: false,
      insertBytesData: {
        useCurrentAddress: true,
        offset: 0,
        value: 0,
        number: 1,
      },
    };
  },
  methods: {
    ...mapMutations([
      "setMaxLines",
      "setCursorPosition",
      "setStartingAddress",
      "changeByte",
    ]),
    ...mapActions([
      "initialize",
      "updateCurrentBytes",
      "removeBytes",
      "insertBytes",
    ]),
    getByteAddress(row, column, index) {
      const ua = column * this.column_width + index;
      const a = ua + row * this.columns * this.column_width;
      return a + this.currentStartingAddress;
    },
    scrollUp() {
      if (this.currentStartingAddress - this.scrollStep >= 0) {
        this.setStartingAddress(this.currentStartingAddress - this.scrollStep);
        this.updateCurrentBytes();
      }
    },
    scrollDown() {
      if (
        this.currentStartingAddress + this.bytesPerPage >=
        this.dataArrayBuffer.byteLength
      ) {
        return;
      }
      this.setStartingAddress(this.currentStartingAddress + this.scrollStep);
      this.updateCurrentBytes();
    },
    setScrollTimeOut(fn) {
      this.removeScrollTimeout();
      this.scrollingTimeout = setInterval(fn, 200);
    },
    removeScrollTimeout() {
      if (this.scrollingTimeout) {
        clearTimeout(this.scrollingTimeout);
      }
    },
    /*insertBytes(offset, number, value = 0) {*/
    /*const temp = this.dataViewObject;*/
    /*const newBytes = new Uint8Array(number);*/
    /*for (let i = 0; i < number; i++) {*/
    /*newBytes[i] = value;*/
    /*}*/
    /*const n = new Uint8Array(temp.byteLength + newBytes.length);*/
    /*const a = new Uint8Array(temp.buffer, 0, offset);*/
    /*const b = new Uint8Array(temp.buffer, offset);*/
    /*n.set(a, 0);*/
    /*n.set(newBytes, a.length);*/
    /*n.set(b, a.length + newBytes.length);*/
    /*this.dataArrayBuffer = n.buffer;*/
    /*this.dataViewObject = new DataView(n.buffer);*/
    /*},*/

    onInsertBytesClick() {
      if (this.insertBytesData.useCurrentAddress) {
        this.insertBytes({
          offset: this.currentStartingAddress + this.cursorPosition,
          number: this.insertBytesData.number,
          value: this.insertBytesData.value,
        });
        return;
      }
      this.insertBytes({
        offset: this.insertBytesData.offset,
        number: this.insertBytesData.number,
        value: this.insertBytesData.value,
      });
    },

    contentOnKeyPress(e) {
      const allowedKeys = "01234567890abcdefABCDEF";
      if (allowedKeys.indexOf(e.key) === -1) {
        return;
      }
      let oldByteText = this.dataViewObject.getUint8(this.cursorPosition);
      oldByteText = oldByteText
        .toString(this.base)
        .padStart(this.byteSize, (0).toString(this.base))
        .split("");
      oldByteText[this.cursorBytePosition] = e.key;
      oldByteText = parseInt(oldByteText.join(""), this.base);
      this.changeByte({
        pos: this.cursorPosition,
        b: oldByteText,
      });
      this.updateCurrentBytes();
      if (this.cursorBytePosition == this.byteSize - 1) {
        this.cursorBytePosition = 0;
        this.setCursorPosition(this.cursorPosition + 1);
        return;
      }
      this.cursorBytePosition++;
    },

    editorOnContextMenu(e) {
      e.preventDefault();
      this.ctxMenuShowen = true;
      this.ctxMenuTop = e.clientY;
      this.ctxMenuLeft = e.clientX;
      this.setCursorPosition(parseInt(e.target.dataset.offset));
      this.ctxCursor = this.cursorPosition;
    },
    deleteByte() {
      if (
        this.selectionStartOffset !== null &&
        this.selectionEndOffset !== null
      ) {
        this.removeBytes({
          offset: this.selectionStartOffset,
          number: this.selectionEndOffset - this.selectionStartOffset + 1,
        });
        this.selectNone();
        return;
      }
      this.removeBytes({ offset: this.ctxCursor, number: 1 });
    },
    selectAll() {
      this.selectionStartOffset = 0;
      this.selectionEndOffset = this.bytes.length - 1;
    },
    selectNone() {
      this.selectionStartOffset = null;
      this.selectionEndOffset = null;
    },
    byteMouseDown(e) {
      if (e.buttons === 1) {
        this.selectionStartOffset = parseInt(e.target.dataset.offset);
        this.selectionEndOffset = parseInt(e.target.dataset.offset);
        this.selecting = true;
      }
    },
    byteMouseUp(e) {
      this.selectionEndOffset = parseInt(e.target.dataset.offset);
      this.selecting = false;
    },
    byteMouseOver(e) {
      if (this.selecting) {
        this.selectionEndOffset = parseInt(e.target.dataset.offset);
      }
    },
  },
  mounted() {
    this.contentHeight = this.$refs.content.getClientRects()[0].height;
    let maxLines = Math.floor(
      this.$refs.content.getClientRects()[0].height / 20
    );
    this.setMaxLines(maxLines);
    this.initialize();
  },
  created() {},

  computed: {
    ...mapState({
      columns: (state) => state.settings.columns,
      column_width: (state) => state.settings.column_width,
      ascii_preview_enabled: (state) => state.settings.ascii_preview_enabled,
      base: (state) => state.settings.base,
      maxLines: (state) => state.maxLines,
      currentStartingAddress: (state) => state.data.currentStartingAddress,
      cursorPosition: (state) => state.data.cursorPosition,
    }),
    ...mapGetters({
      bytesPerPage: "bytesPerPage",
      bytes: "current_bytes",
      bytesArray: "current_bytesArray",
      dataViewObject: "current_dataview",
      dataArrayBuffer: "current_buffer",
    }),
    scrollStep() {
      return this.column_width * this.columns;
    },
    byteSize() {
      return (255).toString(this.base).length;
    },
    scrollBarThumbHeight() {
      if (!this.dataArrayBuffer) {
        return 0;
      }
      const perc = this.bytesArray.length / this.dataArrayBuffer.byteLength;
      const r = perc * this.contentHeight - 30;
      return r;
    },
    scrollBarThumbTop() {
      if (!this.dataArrayBuffer) {
        return 0;
      }
      const perc =
        this.currentStartingAddress / this.dataArrayBuffer.byteLength;
      const h = this.contentHeight; // - this.scrollBarThumbHeight;
      const r = perc * h + 15;
      return r;
    },
    addressWidth() {
      let w = this.rows.length * this.columns * this.column_width;
      w = w.toString(this.base).length;
      const adw = "Address  ";
      return adw.length > w ? w : w;
    },
    rows() {
      const cols = this.columns * this.column_width;
      const data = [];
      let c = 0;
      let r = [];
      let cc = [];
      while (c < this.bytesArray.length) {
        const b = this.bytesArray[c];
        cc.push(b);
        if ((c + 1) % this.column_width === 0) {
          r.push(cc);
          cc = [];
        }
        if ((c + 1) % cols == 0) {
          data.push(r);
          r = [];
        }
        if (c + 1 === this.bytesArray.length && cc.length > 0) {
          r.push(cc);
          cc = [];
        }
        if (c + 1 === this.bytesArray.length && r.length > 0) {
          data.push(r);
          r = [];
        }
        c++;
      }
      return data;
    },
  },
};
</script>

<style scoped lang="scss">
.editor {
  background-color: white;
  width: 100%;
  height: 100%;
  flex: 1;
  color: black;
  font-family: "Source Code Pro", monospace;
  overflow: hidden;
}
.content {
  height: 100%;
  overflow-y: hidden;
  position: relative;
  line-height: 20px;
  vertical-align: baseline;
  font-size: 14.5px;
}
.up_button {
  background-color: transparent;
  z-index: 4;
  width: 15px;
  height: 15px;
  position: absolute;
  font-size: 15px;
  right: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  line-height: 20px;
  top: 0px;
}
.scrollbar {
  width: 15px;
  height: 100%;
  background-color: #dcdfe6;
  position: absolute;
  z-index: 3;
  top: 0px;
  right: 0px;
}
.scrollbar_thumb {
  width: 15px;
  height: 30px;
  background-color: #c0c4cc;
  position: absolute;
  z-index: 4;
  right: 0px;
  top: 15px;
}
.down_button {
  z-index: 4;
  right: 0px;
  bottom: 0px;
  background-color: transparent;
  width: 15px;
  height: 15px;
  position: absolute;
  font-size: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  line-height: 20px;
}
.column {
  padding-right: 12px;
}
.byte {
  padding-inline-end: 4px;
  margin: 0px;
  user-select: none;
}
.byte:hover {
  background-color: #d0d0d0;
}
.byte[data-editing="true"] {
  animation: blinking 1s infinite;
}
.byte[data-selected="true"] {
  background-color: yellow;
}
.ui {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  justify-content: space-between;
}
.address {
  margin-right: 10px;
  user-select: none;
  background-color: #d0d0d0;
}
.upper_address {
  user-select: none;
  background-color: #d0d0d0;
}
.ascii_preview {
  user-select: none;
}
.editing {
  background-color: red;
}
.field {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
  margin-bottom: 10px;
}
.field_label {
  width: 60%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
@keyframes blinking {
  0% {
    box-shadow: inset 0px -1px 0px #b0b0b0;
  }

  25% {
    box-shadow: inset 0px -1px 0px #b0b0b0;
  }
  50% {
    box-shadow: inset 0px 0px 0px #d0d0d0;
  }
  100% {
    box-shadow: inset 0px 0px 0px #d0d0d0;
  }
}
</style>
