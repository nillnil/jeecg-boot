<template>
  <a-modal
    :title="title"
    :width="800"
    :ok="false"
    :visible="visible"
    :confirm-loading="confirmLoading"
    :ok-button-props="{ props: {disabled: disableSubmit} }"
    cancel-text="关闭"
    @ok="handleOk"
    @cancel="handleCancel"
  >

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="机构名称"
          :hidden="false"
          has-feedback
        >
          <a-input id="departName" v-decorator="['departName', validatorRules.departName ]" placeholder="请输入机构/部门名称" />
        </a-form-item>
        <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" :hidden="seen" label="上级部门" has-feedback>
          <a-tree-select
            v-model="model.parentId"
            style="width:100%"
            :dropdown-style="{maxHeight:'200px',overflow:'auto'}"
            :tree-data="departTree"
            placeholder="请选择上级部门"
            :disabled="condition"
          />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="机构类型"
        >
          <template v-if="seen">
            <a-radio-group v-decorator="['orgCategory',validatorRules.orgCategory]" placeholder="请选择机构类型">
              <a-radio value="1">
                公司
              </a-radio>
            </a-radio-group>
          </template>
          <template v-else>
            <a-radio-group v-decorator="['orgCategory',validatorRules.orgCategory]" placeholder="请选择机构类型">
              <a-radio value="2">
                部门
              </a-radio>
              <a-radio value="3">
                岗位
              </a-radio>
            </a-radio-group>
          </template>
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="电话"
        >
          <a-input v-decorator="['mobile',validatorRules.mobile]" placeholder="请输入电话" />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="传真"
        >
          <a-input v-decorator="['fax', {}]" placeholder="请输入传真" />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="地址"
        >
          <a-input v-decorator="['address', {}]" placeholder="请输入地址" />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="排序"
        >
          <a-input-number v-decorator="[ 'departOrder',{'initialValue':0}]" />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="备注"
        >
          <a-textarea v-decorator="['memo', {}]" placeholder="请输入备注" />
        </a-form-item>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { httpAction } from '@/api/manage'
import { queryIdTree } from '@/api/api'
import pick from 'lodash.pick'
import ATextarea from 'ant-design-vue/es/input/TextArea'
export default {
  name: 'SysDepartModal',
  components: { ATextarea },
  data() {
    return {
      departTree: [],
      orgTypeData: [],
      phoneWarning: '',
      departName: '',
      title: '操作',
      seen: false,
      visible: false,
      condition: true,
      disableSubmit: false,
      model: {},
      menuhidden: false,
      menuusing: true,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },

      confirmLoading: false,
      form: this.$form.createForm(this),
      validatorRules: {
        departName: { rules: [{ required: true, message: '请输入机构/部门名称!' }] },
        orgCode: { rules: [{ required: true, message: '请输入机构编码!' }] },
        mobile: { rules: [{ validator: this.validateMobile }] }
      },
      url: {
        add: '/sys/sysDepart/add'
      },
      dictDisabled: true
    }
  },
  created() {
  },
  methods: {
    loadTreeData() {
      var that = this
      queryIdTree().then((res) => {
        if (res.success) {
          that.departTree = []
          for (let i = 0; i < res.result.length; i++) {
            const temp = res.result[i]
            that.departTree.push(temp)
          }
        }
      })
    },
    add(depart) {
      if (depart) {
        this.seen = false
        this.dictDisabled = false
      } else {
        this.seen = true
        this.dictDisabled = true
      }
      this.edit(depart)
    },
    edit(record) {
      this.form.resetFields()
      this.model = Object.assign({}, {})
      this.visible = true
      this.loadTreeData()
      this.model.parentId = record != null ? record.toString() : null
      if (this.seen) {
        this.model.orgCategory = '1'
      } else {
        this.model.orgCategory = '2'
      }
      this.$nextTick(() => {
        this.form.setFieldsValue(pick(this.model, 'orgCategory', 'departName', 'departNameEn', 'departNameAbbr', 'departOrder', 'description', 'orgType', 'orgCode', 'mobile', 'fax', 'address', 'memo', 'status', 'delFlag'))
      })
    },
    close() {
      this.$emit('close')
      this.disableSubmit = false
      this.visible = false
    },
    handleOk() {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true
          const formData = Object.assign(this.model, values)
          // 时间格式化
          console.log(formData)
          httpAction(this.url.add, formData, 'post').then((res) => {
            if (res.success) {
              that.$message.success(res.message)
              that.loadTreeData()
              that.$emit('ok')
            } else {
              that.$message.warning(res.message)
            }
          }).finally(() => {
            that.confirmLoading = false
            that.close()
          })
        }
      })
    },
    handleCancel() {
      this.close()
    },
    validateMobile(rule, value, callback) {
      if (!value || new RegExp(/^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/).test(value)) {
        callback()
      } else {
        callback('您的手机号码格式不正确!')
      }
    }
  }
}
</script>

<style scoped>

</style>
