<template>
  <a-tree-select
    allow-clear
    label-in-value
    style="width: 100%"
    :disabled="disabled"
    :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
    :placeholder="placeholder"
    :load-data="asyncLoadTreeData"
    :value="treeValue"
    :tree-data="treeData"
    @change="onChange"
    @search="onSearch"
  />
</template>

<script>
import { getAction } from '@/api/manage'

export default {
  name: 'JTreeDict',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: String,
      required: false
    },
    placeholder: {
      type: String,
      default: '请选择',
      required: false
    },
    parentCode: {
      type: String,
      default: '',
      required: false
    },
    field: {
      type: String,
      default: 'id',
      required: false
    },
    root: {
      type: Object,
      required: false,
      default: () => {
        return {
          pid: '0'
        }
      }
    },
    async: {
      type: Boolean,
      default: false,
      required: false
    },
    disabled: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  data() {
    return {
      treeData: [],
      treeValue: null,
      url_root: '/sys/category/loadTreeRoot',
      url_children: '/sys/category/loadTreeChildren',
      url_view: '/sys/category/loadOne'
    }
  },
  watch: {
    root: {
      handler(val) {
        console.log('root-change', val)
      },
      deep: true
    },
    parentCode: {
      handler() {
        this.loadRoot()
      }
    },
    value: {
      handler() {
        this.loadViewInfo()
      }
    }
  },
  created() {
    this.loadRoot()
    this.loadViewInfo()
  },
  methods: {
    loadViewInfo() {
      if (!this.value || this.value == '0') {
        this.treeValue = null
      } else {
        const param = {
          field: this.field,
          val: this.value
        }
        getAction(this.url_view, param).then(res => {
          if (res.success) {
            this.treeValue = {
              value: this.value,
              label: res.result.name
            }
          }
        })
      }
    },
    loadRoot() {
      const param = {
        async: this.async,
        pcode: this.parentCode
      }
      getAction(this.url_root, param).then(res => {
        if (res.success) {
          this.handleTreeNodeValue(res.result)
          console.log('aaaa', res.result)
          this.treeData = [...res.result]
        } else {
          this.$message.error(res.message)
        }
      })
    },
    asyncLoadTreeData(treeNode) {
      return new Promise((resolve) => {
        if (!this.async) {
          resolve()
          return
        }
        if (treeNode.$vnode.children) {
          resolve()
          return
        }
        const pid = treeNode.$vnode.key
        const param = {
          pid: pid
        }
        getAction(this.url_children, param).then(res => {
          if (res.success) {
            this.handleTreeNodeValue(res.result)
            this.addChildren(pid, res.result, this.treeData)
            this.treeData = [...this.treeData]
          }
          resolve()
        })
      })
    },
    addChildren(pid, children, treeArray) {
      if (treeArray && treeArray.length > 0) {
        for (const item of treeArray) {
          if (item.key == pid) {
            if (!children || children.length == 0) {
              item.leaf = true
            } else {
              item.children = children
            }
            break
          } else {
            this.addChildren(pid, children, item.children)
          }
        }
      }
    },
    handleTreeNodeValue(result) {
      const storeField = this.field == 'code' ? 'code' : 'key'
      for (const i of result) {
        i.value = i[storeField]
        i.isLeaf = !(!i.leaf)
        if (i.children && i.children.length > 0) {
          this.handleTreeNodeValue(i.children)
        }
      }
    },
    onChange(value) {
      console.log(value)
      this.$emit('change', value.value)
      this.treeValue = value
    },
    onSearch(value) {
      console.log(value)
    },
    getCurrTreeData() {
      return this.treeData
    }
  }

}
</script>
