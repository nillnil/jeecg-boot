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
    :multiple="multiple"
    @change="onChange"
  />
</template>
<script>

import { getAction } from '@/api/manage'

export default {
  name: 'JCategorySelect',
  // 2.2新增 在组件内定义 指定父组件调用时候的传值属性和事件类型 这个牛逼
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
    disabled: {
      type: Boolean,
      default: false,
      required: false
    },
    condition: {
      type: String,
      default: '',
      required: false
    },
    // 是否支持多选
    multiple: {
      type: Boolean,
      default: false
    },
    loadTriggleChange: {
      type: Boolean,
      default: false,
      required: false
    },
    pid: {
      type: String,
      default: '',
      required: false
    },
    pcode: {
      type: String,
      default: '',
      required: false
    },
    back: {
      type: String,
      default: '',
      required: false
    }
  },
  data() {
    return {
      treeValue: '',
      treeData: [],
      url: '/sys/category/loadTreeData',
      view: '/sys/category/loadDictItem/',
      tableName: '',
      text: '',
      code: ''

    }
  },
  watch: {
    value() {
      this.loadItemByCode()
    },
    pcode() {
      this.loadRoot()
    }
  },
  created() {
    this.validateProp().then(() => {
      this.loadRoot()
      this.loadItemByCode()
    })
  },
  methods: {
    /** 加载一级节点 */
    loadRoot() {
      const param = {
        pid: this.pid,
        pcode: this.pcode,
        condition: this.condition
      }
      getAction(this.url, param).then(res => {
        if (res.success && res.result) {
          for (const i of res.result) {
            i.value = i.key
            if (i.leaf == false) {
              i.isLeaf = false
            } else if (i.leaf == true) {
              i.isLeaf = true
            }
          }
          this.treeData = [...res.result]
        } else {
          console.log('树一级节点查询结果-else', res)
        }
      })
    },

    /** 数据回显*/
    loadItemByCode() {
      if (!this.value || this.value == '0') {
        this.treeValue = []
      } else {
        getAction(this.view, { ids: this.value }).then(res => {
          console.log(124345)
          console.log(124345, res)
          if (res.success) {
            const values = this.value.split(',')
            this.treeValue = res.result.map((item, index) => ({
              key: values[index],
              value: values[index],
              label: item
            }))
            this.onLoadTriggleChange(res.result[0])
          }
        })
      }
    },
    onLoadTriggleChange(text) {
      // 只有单选才会触发
      if (!this.multiple && this.loadTriggleChange) {
        this.backValue(this.value, text)
      }
    },
    backValue(value, label) {
      const obj = {}
      if (this.back) {
        obj[this.back] = label
      }
      this.$emit('change', value, obj)
    },
    asyncLoadTreeData(treeNode) {
      return new Promise((resolve) => {
        if (treeNode.$vnode.children) {
          resolve()
          return
        }
        const pid = treeNode.$vnode.key
        const param = {
          pid: pid,
          condition: this.condition
        }
        getAction(this.url, param).then(res => {
          if (res.success) {
            for (const i of res.result) {
              i.value = i.key
              if (i.leaf == false) {
                i.isLeaf = false
              } else if (i.leaf == true) {
                i.isLeaf = true
              }
            }
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
              item.isLeaf = true
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

    onChange(value) {
      if (!value) {
        this.$emit('change', '')
        this.treeValue = ''
      } else if (value instanceof Array) {
        // this.$emit('change', value.map(item => item.value).join(','))
        // this.treeValue = value
      } else {
        this.backValue(value.value, value.label)
        this.treeValue = value
      }
    },
    getCurrTreeData() {
      return this.treeData
    },
    validateProp() {
      const mycondition = this.condition
      return new Promise((resolve, reject) => {
        if (!mycondition) {
          resolve()
        } else {
          try {
            const test = JSON.parse(mycondition)
            if (typeof test == 'object' && test) {
              resolve()
            } else {
              this.$message.error('组件JTreeSelect-condition传值有误，需要一个json字符串!')
              reject()
            }
          } catch (e) {
            this.$message.error('组件JTreeSelect-condition传值有误，需要一个json字符串!')
            reject()
          }
        }
      })
    }
  }
}
</script>
