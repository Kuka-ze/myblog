<template>
  <div>
    <!-- <el-button @click="handleClick" type="success">按钮</el-button> -->
    <div class="div1">试试方块</div>
  </div>
</template>

<script>
export default {
  methods: {
    handleClick() {
      console.log("点击成功!");
    },
  },
};
</script>

<style scoped>
.div1 {
  width: 100%;
  height: 100px;
  background: #f00;
}
</style>
