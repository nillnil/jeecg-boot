<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :mask-closable="false"
    :confirm-loading="confirmLoading"
    cancel-text="关闭"
    @ok="handleOk"
    @cancel="handleCancel"
  >

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="规则名称"
        >
          <a-input v-decorator="['ruleName', validatorRules.ruleName]" placeholder="请输入规则名称" />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="规则Code"
        >
          <a-input v-decorator="['ruleCode', validatorRules.ruleCode]" placeholder="请输入规则Code" :disabled="disabledCode" />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="规则实现类"
        >
          <a-input v-decorator="['ruleClass', validatorRules.ruleClass]" placeholder="请输入规则实现类" />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="规则参数"
        >
          <a-textarea v-decorator="['ruleParams', validatorRules.ruleParams]" placeholder="请输入规则参数" :rows="5" />
        </a-form-item>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { httpAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'

export default {
  name: 'SysFillRuleModal',
  components: {},
  data() {
    return {
      title: '操作',
      visible: false,
      model: {},
      labelCol: { xs: { span: 24 }, sm: { span: 5 }},
      wrapperCol: { xs: { span: 24 }, sm: { span: 16 }},

      confirmLoading: false,
      form: this.$form.createForm(this),
      validatorRules: {
        ruleName: { rules: [{ required: true, message: '规则名称不能为空' }] },
        ruleCode: {
          rules: [
            { required: true, message: '规则Code不能为空' },
            { validator: (rule, value, callback) => validateDuplicateValue('sys_fill_rule', 'rule_code', value, this.model.id, callback) }
          ]
        },
        ruleClass: { rules: [{ required: true, message: '规则实现类不能为空' }] },
        ruleParams: {
          rules: [{
            validator: (rule, value, callback) => {
              try {
                const json = JSON.parse(value)
                if (json instanceof Array) {
                  callback('只能传递JSON对象，不能传递JSON数组')
                } else if (json instanceof Object) {
                  callback()
                } else {
                  callback('请输入JSON字符串')
                }
              } catch {
                callback('请输入JSON字符串')
              }
            }
          }]
        }
      },
      url: {
        add: '/sys/fillRule/add',
        edit: '/sys/fillRule/edit'
      }
    }
  },
  computed: {
    disabledCode() {
      return !!this.model.id
    }
  },
  created() {
  },
  methods: {
    add() {
      this.edit({})
    },
    edit(record) {
      this.form.resetFields()
      this.model = Object.assign({}, record)
      this.visible = true
      this.$nextTick(() => {
        this.form.setFieldsValue(pick(this.model, 'ruleName', 'ruleCode', 'ruleClass', 'ruleParams'))
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
    },
    handleOk() {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true
          let httpUrl = this.url.add; let method = 'post'
          if (this.model.id) {
            httpUrl = this.url.edit
            method = 'put'
          }

          const formData = Object.assign(this.model, values)
          httpAction(httpUrl, formData, method).then((res) => {
            if (res.success) {
              that.$message.success(res.message)
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
    }

  }
}
</script>

<style lang="less" scoped>

</style>
