<template>
  <a-modal
    title="选择部门"
    :width="modalWidth"
    :visible="visible"
    :confirm-loading="confirmLoading"
    cancel-text="关闭"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin tip="Loading..." :spinning="false">
      <a-input-search style="margin-bottom: 1px" placeholder="请输入部门名称按回车进行搜索" @search="onSearch" />
      <a-tree
        checkable
        :tree-data="treeData"
        :check-strictly="true"
        :auto-expand-parent="autoExpandParent"
        :expanded-keys="expandedKeys"
        :checked-keys="checkedKeys"
        @check="onCheck"
        @select="onSelect"
        @expand="onExpand"
      >

        <template slot="title" slot-scope="{title}">
          <span v-if="title.indexOf(searchValue) > -1">
            {{ title.substr(0, title.indexOf(searchValue)) }}
            <span style="color: #f50">{{ searchValue }}</span>
            {{ title.substr(title.indexOf(searchValue) + searchValue.length) }}
          </span>
          <span v-else>{{ title }}</span>
        </template>
      </a-tree>

    </a-spin>
  </a-modal>
</template>

<script>
import { queryDepartTreeList } from '@/api/api'
export default {
  name: 'JSelectDepartModal',
  props: ['modalWidth', 'multi', 'rootOpened', 'departId'],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      treeData: [],
      autoExpandParent: true,
      expandedKeys: [],
      dataList: [],
      checkedKeys: [],
      checkedRows: [],
      searchValue: ''
    }
  },
  watch: {
    departId() {
      this.initDepartComponent()
    },
    visible: {
      handler() {
        if (this.departId) {
          this.checkedKeys = this.departId.split(',')
          // console.log('this.departId', this.departId)
        } else {
          this.checkedKeys = []
        }
      }
    }
  },
  created() {
    this.loadDepart()
  },
  methods: {
    show() {
      this.visible = true
      this.checkedRows = []
      this.checkedKeys = []
    },
    loadDepart() {
      queryDepartTreeList().then(res => {
        if (res.success) {
          const arr = [...res.result]
          this.reWriterWithSlot(arr)
          this.treeData = arr
          this.initDepartComponent()
          if (this.rootOpened) {
            this.initExpandedKeys(res.result)
          }
        }
      })
    },
    initDepartComponent() {
      let names = ''
      if (this.departId) {
        const currDepartId = this.departId
        for (const item of this.dataList) {
          if (currDepartId.indexOf(item.key) >= 0) {
            names += ',' + item.title
          }
        }
        if (names) {
          names = names.substring(1)
        }
      }
      this.$emit('initComp', names)
    },
    reWriterWithSlot(arr) {
      for (const item of arr) {
        if (item.children && item.children.length > 0) {
          this.reWriterWithSlot(item.children)
          const temp = Object.assign({}, item)
          temp.children = {}
          this.dataList.push(temp)
        } else {
          this.dataList.push(item)
          item.scopedSlots = { title: 'title' }
        }
      }
    },
    initExpandedKeys(arr) {
      if (arr && arr.length > 0) {
        const keys = []
        for (const item of arr) {
          if (item.children && item.children.length > 0) {
            keys.push(item.id)
          }
        }
        this.expandedKeys = [...keys]
      } else {
        this.expandedKeys = []
      }
    },
    onCheck(checkedKeys, info) {
      if (!this.multi) {
        const arr = checkedKeys.checked.filter(item => this.checkedKeys.indexOf(item) < 0)
        this.checkedKeys = [...arr]
        this.checkedRows = (this.checkedKeys.length === 0) ? [] : [info.node.dataRef]
      } else {
        this.checkedKeys = checkedKeys.checked
        this.checkedRows = this.getCheckedRows(this.checkedKeys)
      }
    },
    onSelect(selectedKeys, info) {
      const keys = []
      keys.push(selectedKeys[0])
      if (!this.checkedKeys || this.checkedKeys.length === 0 || !this.multi) {
        this.checkedKeys = [...keys]
        this.checkedRows = [info.node.dataRef]
      } else {
        const currKey = info.node.dataRef.key
        if (this.checkedKeys.indexOf(currKey) >= 0) {
          this.checkedKeys = this.checkedKeys.filter(item => item !== currKey)
        } else {
          this.checkedKeys.push(...keys)
        }
      }
      this.checkedRows = this.getCheckedRows(this.checkedKeys)
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    handleSubmit() {
      if (!this.checkedKeys || this.checkedKeys.length == 0) {
        this.$emit('ok', '')
      } else {
        this.$emit('ok', this.checkedRows, this.checkedKeys.join(','))
      }
      this.handleClear()
    },
    handleCancel() {
      this.handleClear()
    },
    handleClear() {
      this.visible = false
      this.checkedKeys = []
    },
    getParentKey(currKey, treeData) {
      let parentKey
      for (let i = 0; i < treeData.length; i++) {
        const node = treeData[i]
        if (node.children) {
          if (node.children.some(item => item.key === currKey)) {
            parentKey = node.key
          } else if (this.getParentKey(currKey, node.children)) {
            parentKey = this.getParentKey(currKey, node.children)
          }
        }
      }
      return parentKey
    },
    onSearch(value) {
      const expandedKeys = this.dataList.map((item) => {
        if (item.title.indexOf(value) > -1) {
          return this.getParentKey(item.key, this.treeData)
        }
        return null
      }).filter((item, i, self) => item && self.indexOf(item) === i)

      Object.assign(this, {
        expandedKeys,
        searchValue: value,
        autoExpandParent: true
      })
    },
    // 根据 checkedKeys 获取 rows
    getCheckedRows(checkedKeys) {
      const forChildren = (list, key) => {
        for (const item of list) {
          if (item.id === key) {
            return item
          }
          if (item.children instanceof Array) {
            const value = forChildren(item.children, key)
            if (value != null) {
              return value
            }
          }
        }
        return null
      }

      const rows = []
      for (const key of checkedKeys) {
        const row = forChildren(this.treeData, key)
        if (row != null) {
          rows.push(row)
        }
      }
      return rows
    }
  }
}

</script>

<style scoped>

</style>
