<template>
  <div class="components-input-demo-presuffix">
    <!---->
    <a-input v-model="departNames" placeholder="请点击选择部门" read-only :disabled="disabled" @click="openModal">
      <a-icon slot="prefix" type="cluster" title="部门选择控件" />
      <a-icon v-if="departIds" slot="suffix" type="close-circle" title="清空" @click="handleEmpty" />
    </a-input>

    <j-select-depart-modal
      ref="innerDepartSelectModal"
      :modal-width="modalWidth"
      :multi="multi"
      :root-opened="rootOpened"
      :depart-id="departIds"
      @ok="handleOK"
      @initComp="initComp"
    />
  </div>
</template>

<script>
import JSelectDepartModal from './modal/JSelectDepartModal'
export default {
  name: 'JSelectDepart',
  components: {
    JSelectDepartModal
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    modalWidth: {
      type: Number,
      default: 500,
      required: false
    },
    multi: {
      type: Boolean,
      default: false,
      required: false
    },
    rootOpened: {
      type: Boolean,
      default: true,
      required: false
    },
    value: {
      type: String,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    // 自定义返回字段，默认返回 id
    customReturnField: {
      type: String,
      default: 'id'
    }
  },
  data() {
    return {
      visible: false,
      confirmLoading: false,
      departNames: '',
      departIds: ''
    }
  },
  watch: {
    value(val) {
      if (this.customReturnField === 'id') {
        this.departIds = val
      }
    }
  },
  mounted() {
    this.departIds = this.value
  },
  methods: {
    initComp(departNames) {
      this.departNames = departNames
    },
    openModal() {
      this.$refs.innerDepartSelectModal.show()
    },
    handleOK(rows, idstr) {
      let value = ''
      if (!rows && rows.length <= 0) {
        this.departNames = ''
        this.departIds = ''
      } else {
        value = rows.map(row => row[this.customReturnField]).join(',')
        this.departNames = rows.map(row => row['departName']).join(',')
        this.departIds = idstr
      }
      this.$emit('change', value)
    },
    getDepartNames() {
      return this.departNames
    },
    handleEmpty() {
      this.handleOK('')
    }
  }
}
</script>

<style scoped>
  .components-input-demo-presuffix .anticon-close-circle {
    cursor: pointer;
    color: #ccc;
    transition: color 0.3s;
    font-size: 12px;
  }
  .components-input-demo-presuffix .anticon-close-circle:hover {
    color: #f5222d;
  }
  .components-input-demo-presuffix .anticon-close-circle:active {
    color: #666;
  }
</style>
