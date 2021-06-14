<template>
  <div class="context_menu" v-if="showen">
    <ul class="menu">
      <li @click="$emit('insert')" class="menu_item">Insert Bytes</li>
      <li @click="$emit('delete')" class="menu_item">Delete Byte</li>
      <li class="menu_item" @click="$emit('selectAll')">Select All</li>
      <li class="menu_item" @click="$emit('selectNone')">Select None</li>
    </ul>
  </div>
</template>
<script>
export default {
  name: "ContextMenu",
  props: {
    showen: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
<style scoped lang="scss">
.context_menu {
  position: relative;
  width: 200px;
  border: 1px solid grey;
  padding: 5px;
  background-color: white;
  z-index: 1000;
}
.menu {
  list-style: none;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0px;
  padding: 0px;
}
.menu_item {
  display: flex;
  width: 100%;
}
.menu_item:hover {
  background: grey;
}
</style>
