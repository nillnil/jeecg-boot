<template>
  <div :class="disabled?'jeecg-form-container-disabled':''">
    <fieldset disabled>
      <slot name="detail" />
    </fieldset>
    <slot name="edit" />
    <fieldset disabled>
      <slot />
    </fieldset>
  </div>
</template>

<script>
/**
   * 使用方法
   * 在form下直接写这个组件就行了，
   *<a-form layout="inline" :form="form" >
   *     <j-form-container :disabled="true">
   *         <!-- 表单内容省略..... -->
   *     </j-form-container>
   *</a-form>
   */
export default {
  name: 'JFormContainer',
  props: {
    disabled: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  mounted() {
    console.log('我是表单禁用专用组件,但是我并不支持表单中iframe的内容禁用')
  }
}
</script>
<style>
  .jeecg-form-container-disabled{
    cursor: not-allowed;
  }
  .jeecg-form-container-disabled fieldset[disabled] {
    -ms-pointer-events: none;
    pointer-events: none;
  }
  .jeecg-form-container-disabled .ant-select{
    -ms-pointer-events: none;
    pointer-events: none;
  }
</style>
