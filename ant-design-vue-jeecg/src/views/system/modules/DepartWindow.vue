<template>
  <a-modal
    :width="modalWidth"
    :visible="visible"
    title="部门搜索"
    :confirm-loading="confirmLoading"
    cancel-text="关闭"
    wrap-class-name="ant-modal-cust-warp"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <!--部门树-->
    <template>
      <a-form :form="form">
        <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="上级部门">
          <a-tree
            multiple
            tree-checkable="tree"
            checkable
            :checked-keys="checkedKeys"
            allow-clear="true"
            :check-strictly="true"
            :dropdown-style="{maxHeight:'200px',overflow:'auto'}"
            :tree-data="departTree"
            placeholder="请选择上级部门"
            @check="onCheck"
          />
        </a-form-item>
      </a-form>
    </template>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { getAction } from '@/api/manage'
import { queryIdTree } from '@/api/api'
export default {
  name: 'DepartWindow',
  data() {
    return {
      checkedKeys: [], // 存储选中的部门id
      userId: '', // 存储用户id
      model: {}, // 存储SysUserDepartsVO表
      userDepartModel: { userId: '', departIdList: [] }, // 存储用户id一对多部门信息的对象
      departList: [], // 存储部门信息
      modalWidth: 400,
      departTree: [],
      title: '操作',
      visible: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      confirmLoading: false,
      headers: {},
      form: this.$form.createForm(this),
      url: {
        userId: '/sys/user/generateUserId' // 引入生成添加用户情况下的url
      }
    }
  },
  methods: {
    add(checkedDepartKeys, userId) {
      this.checkedKeys = checkedDepartKeys
      this.userId = userId
      this.edit({})
    },
    edit(record) {
      this.departList = []
      this.queryDepartTree()
      this.form.resetFields()
      this.visible = true
      this.model = Object.assign({}, record)
      const filedsVal = pick(this.model, 'id', 'userId', 'departIdList')
      this.$nextTick(() => {
        this.form.setFieldsValue(filedsVal)
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
      this.departList = []
      this.checkedKeys = []
    },
    handleSubmit() {
      const that = this
      // 触发表单验证
      this.form.validateFields((err) => {
        if (!err) {
          that.confirmLoading = true
          if (this.userId == null) {
            getAction(this.url.userId).then((res) => {
              if (res.success) {
                const formData = { userId: res.result,
                  departIdList: this.departList }
                console.log(formData)
                that.$emit('ok', formData)
              }
            }).finally(() => {
              that.departList = []
              that.confirmLoading = false
              that.close()
            })
          } else {
            const formData = { userId: this.userId,
              departIdList: this.departList }
            console.log(formData)
            that.departList = []
            that.$emit('ok', formData)
            that.confirmLoading = false
            that.close()
          }
        }
      })
    },
    handleCancel() {
      this.close()
    },

    // 选择部门时作用的API
    onCheck(checkedKeys, info) {
      this.departList = []
      this.checkedKeys = checkedKeys.checked
      const checkedNodes = info.checkedNodes
      for (let i = 0; i < checkedNodes.length; i++) {
        const de = checkedNodes[i].data.props
        const depart = { key: '', value: '', title: '' }
        depart.key = de.value
        depart.value = de.value
        depart.title = de.title
        this.departList.push(depart)
      }
      console.log('onCheck', checkedKeys, info)
    },
    queryDepartTree() {
      queryIdTree().then((res) => {
        if (res.success) {
          this.departTree = res.result
        }
      })
    },
    modalFormOk() {

    }
  }
}
</script>

<style scoped>
  .ant-table-tbody .ant-table-row td{
    padding-top:10px;
    padding-bottom:10px;
  }
</style>
