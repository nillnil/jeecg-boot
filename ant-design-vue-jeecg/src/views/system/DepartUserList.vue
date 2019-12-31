<template>
  <a-row :gutter="10">
    <a-col :md="8" :sm="24">
      <a-card :bordered="false">
        <div style="background: #fff;padding-left:16px;height: 100%; margin-top: 5px">
          <a-input-search style="width:100%;margin-top: 10px" placeholder="请输入部门名称" @search="onSearch" />
          <!-- 树-->

          <template>

            <!--组织机构-->
            <a-tree
              show-line
              :selected-keys="selectedKeys"
              :check-strictly="true"
              :dropdown-style="{maxHeight:'200px',overflow:'auto'}"
              :tree-data="departTree"
              @select="onSelect"
            />

          </template>

        </div>
      </a-card>
    </a-col>
    <a-col :md="16" :sm="24">
      <a-card :bordered="false">
        <a-tabs default-active-key="2" @change="callback">
          <a-tab-pane key="1" tab="基本信息" force-render>
            <Dept-Base-Info ref="DeptBaseInfo" />
          </a-tab-pane>
          <a-tab-pane key="2" tab="用户信息">
            <Dept-User-Info ref="DeptUserInfo" />
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </a-col>
  </a-row>
</template>
<script>
import DeptBaseInfo from './modules/DeptBaseInfo'
import DeptUserInfo from './modules/DeptUserInfo'
import { queryDepartTreeList, searchByKeywords } from '@/api/api'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'

export default {
  name: 'DepartUserList',
  components: {
    DeptBaseInfo,
    DeptUserInfo
  },
  mixins: [JeecgListMixin],
  data() {
    return {
      currentDeptId: '',
      iExpandedKeys: [],
      loading: false,
      autoExpandParent: true,
      currFlowId: '',
      currFlowName: '',
      disable: true,
      treeData: [],
      visible: false,
      departTree: [],
      rightClickSelectedKey: '',
      hiding: true,
      model: {},
      dropTrigger: '',
      depart: {},
      disableSubmit: false,
      checkedKeys: [],
      selectedKeys: [],
      autoIncr: 1,
      currSelected: {},
      form: this.$form.createForm(this),
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      graphDatasource: {
        nodes: [],
        edges: []
      }
    }
  },
  created() {
    this.currFlowId = this.$route.params.id
    this.currFlowName = this.$route.params.name
    // this.loadTree()
  },
  methods: {
    callback(key) {
      console.log(key)
    },
    loadData() {
      this.refresh()
    },
    loadTree() {
      var that = this
      that.treeData = []
      that.departTree = []
      queryDepartTreeList().then((res) => {
        if (res.success) {
          for (let i = 0; i < res.result.length; i++) {
            const temp = res.result[i]
            that.treeData.push(temp)
            that.departTree.push(temp)
            that.setThisExpandedKeys(temp)
            // console.log(temp.id)
          }
          this.loading = false
        }
      })
    },
    setThisExpandedKeys(node) {
      if (node.children && node.children.length > 0) {
        this.iExpandedKeys.push(node.key)
        for (let a = 0; a < node.children.length; a++) {
          this.setThisExpandedKeys(node.children[a])
        }
      }
    },
    refresh() {
      this.loading = true
      this.loadTree()
    },

    onExpand(expandedKeys) {
      // console.log('onExpand', expandedKeys)
      // if not set autoExpandParent to false, if children expanded, parent can not collapse.
      // or, you can remove all expanded children keys.
      this.iExpandedKeys = expandedKeys
      this.autoExpandParent = false
    },

    onSearch(value) {
      const that = this
      if (value) {
        searchByKeywords({ keyWord: value }).then((res) => {
          if (res.success) {
            that.departTree = []
            for (let i = 0; i < res.result.length; i++) {
              const temp = res.result[i]
              that.departTree.push(temp)
            }
          } else {
            that.$message.warning(res.message)
          }
        })
      } else {
        that.loadTree()
      }
    },
    onCheck(checkedKeys, e) {
      const record = e.node.dataRef
      // console.log('onCheck', checkedKeys, e);
      this.checkedKeys = []
      // if (e.checked === true) {
      this.currentDeptId = record.id
      this.checkedKeys.push(record.id)

      this.$refs.DeptBaseInfo.open(record)
      this.$refs.DeptUserInfo.open(record)
      // }
      // else {
      //   this.checkedKeys = [];
      //   this.$refs.DeptBaseInfo.clearForm();
      //   this.$refs.DeptUserInfo.clearList();
      // }

      this.hiding = false
      // this.checkedKeys = checkedKeys.checked
    },
    onSelect(selectedKeys, e) {
      if (this.selectedKeys[0] !== selectedKeys[0]) {
        this.selectedKeys = [selectedKeys[0]]
      }
      const record = e.node.dataRef
      this.checkedKeys.push(record.id)
      this.$refs.DeptBaseInfo.open(record)
      this.$refs.DeptUserInfo.onClearSelected()
      this.$refs.DeptUserInfo.open(record)
    }
  }
}
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>
