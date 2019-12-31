<template>
  <a-drawer
    :title="title"
    :mask-closable="true"
    width="650"
    placement="right"
    :closable="true"
    :visible="visible"
    style="height: calc(100% - 55px);overflow: auto;padding-bottom: 53px;"
    @close="close"
  >

    <a-form>
      <a-form-item label="所拥有的权限">
        <a-tree
          checkable
          :checked-keys="checkedKeys"
          :tree-data="treeData"
          :selected-keys="selectedKeys"
          :expanded-keys="expandedKeysss"
          :check-strictly="checkStrictly"
          @check="onCheck"
          @expand="onExpand"
          @select="onTreeNodeSelect"
        >
          <span slot="hasDatarule" slot-scope="{slotTitle,ruleFlag}">
            {{ slotTitle }}<a-icon v-if="ruleFlag" type="align-left" style="margin-left:5px;color: red;" />
          </span>
        </a-tree>
      </a-form-item>
    </a-form>

    <div class="drawer-bootom-button">
      <a-dropdown style="float: left" :trigger="['click']" placement="topCenter">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="switchCheckStrictly(1)">父子关联</a-menu-item>
          <a-menu-item key="2" @click="switchCheckStrictly(2)">取消关联</a-menu-item>
          <a-menu-item key="3" @click="checkALL">全部勾选</a-menu-item>
          <a-menu-item key="4" @click="cancelCheckALL">取消全选</a-menu-item>
          <a-menu-item key="5" @click="expandAll">展开所有</a-menu-item>
          <a-menu-item key="6" @click="closeAll">合并所有</a-menu-item>
        </a-menu>
        <a-button>
          树操作 <a-icon type="up" />
        </a-button>
      </a-dropdown>
      <a-popconfirm title="确定放弃编辑？" ok-text="确定" cancel-text="取消" @confirm="close">
        <a-button style="margin-right: .8rem">取消</a-button>
      </a-popconfirm>
      <a-button type="primary" :loading="loading" @click="handleSubmit">提交</a-button>
    </div>

    <role-datarule-modal ref="datarule" />

  </a-drawer>

</template>
<script>
import { queryTreeListForRole, queryRolePermission, saveRolePermission } from '@/api/api'
import RoleDataruleModal from './RoleDataruleModal.vue'

export default {
  name: 'RoleModal',
  components: {
    RoleDataruleModal
  },
  data() {
    return {
      roleId: '',
      treeData: [],
      defaultCheckedKeys: [],
      checkedKeys: [],
      expandedKeysss: [],
      allTreeKeys: [],
      autoExpandParent: true,
      checkStrictly: true,
      title: '角色权限配置',
      visible: false,
      loading: false,
      selectedKeys: []
    }
  },
  watch: {
    visible() {
      if (this.visible) {
        queryTreeListForRole().then((res) => {
          this.treeData = res.result.treeList
          this.allTreeKeys = res.result.ids
          queryRolePermission({ roleId: this.roleId }).then((res) => {
            this.checkedKeys = [...res.result]
            this.defaultCheckedKeys = [...res.result]
            this.expandedKeysss = this.allTreeKeys
            // console.log(this.defaultCheckedKeys)
          })
        })
      }
    }
  },
  methods: {
    onTreeNodeSelect(id) {
      if (id && id.length > 0) {
        this.selectedKeys = id
      }
      this.$refs.datarule.show(this.selectedKeys[0], this.roleId)
    },
    onCheck(o) {
      if (this.checkStrictly) {
        this.checkedKeys = o.checked
      } else {
        this.checkedKeys = o
      }
    },
    show(roleId) {
      this.roleId = roleId
      this.visible = true
    },
    close() {
      this.reset()
      this.$emit('close')
      this.visible = false
    },
    onExpand(expandedKeys) {
      this.expandedKeysss = expandedKeys
      this.autoExpandParent = false
    },
    reset() {
      this.expandedKeysss = []
      this.checkedKeys = []
      this.defaultCheckedKeys = []
      this.loading = false
    },
    expandAll() {
      this.expandedKeysss = this.allTreeKeys
    },
    closeAll() {
      this.expandedKeysss = []
    },
    checkALL() {
      this.checkedKeys = this.allTreeKeys
    },
    cancelCheckALL() {
      // this.checkedKeys = this.defaultCheckedKeys
      this.checkedKeys = []
    },
    switchCheckStrictly(v) {
      if (v == 1) {
        this.checkStrictly = false
      } else if (v == 2) {
        this.checkStrictly = true
      }
    },
    handleCancel() {
      this.close()
    },
    handleSubmit() {
      const that = this
      const params = {
        roleId: that.roleId,
        permissionIds: that.checkedKeys.join(','),
        lastpermissionIds: that.defaultCheckedKeys.join(',')
      }
      that.loading = true
      console.log('请求参数：', params)
      saveRolePermission(params).then((res) => {
        if (res.success) {
          that.$message.success(res.message)
          that.loading = false
          that.close()
        } else {
          that.$message.error(res.message)
          that.loading = false
          that.close()
        }
      })
    }
  }
}

</script>
<style lang="scss" scoped>
  .drawer-bootom-button {
    position: absolute;
    bottom: 0;
    width: 100%;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: right;
    left: 0;
    background: #fff;
    border-radius: 0 0 2px 2px;
  }

</style>
