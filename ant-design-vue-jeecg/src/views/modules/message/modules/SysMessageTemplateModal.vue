<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirm-loading="confirmLoading"
    cancel-text="关闭"
    @ok="handleOk"
    @cancel="handleCancel"
  >

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
          <a-col :span="12">
            <a-form-item
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              label="模板CODE"
              style="margin-right: -35px"
            >
              <a-input
                v-decorator="['templateCode', validatorRules.templateCode ]"
                :disabled="disable"
                placeholder="请输入模板编码"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              label="模板类型"
            >
              <j-dict-select-tag v-decorator="['templateType', validatorRules.templateType ]" :trigger-change="true" dict-code="msgType" placeholder="请选择模板类型" @change="handleChangeTemplateType" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row class="form-row" :gutter="24">
          <a-col :span="24" pull="2">
            <a-form-item
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              label="模板标题"
              style="margin-left: -15px"
            >
              <a-input
                v-decorator="['templateName', validatorRules.templateName]"
                placeholder="请输入模板标题"
                style="width: 122%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row class="form-row" :gutter="24">
          <a-col :span="24" pull="4">
            <a-form-item
              v-show="!useEditor"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              label="模板内容"
              style="margin-left: 4px;width: 126%"
            >
              <a-textarea v-decorator="['templateContent', validatorRules.templateContent ]" placeholder="请输入模板内容" :autosize="{ minRows: 8, maxRows: 8 }" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row class="form-row" :gutter="24">
          <a-col :span="24" pull="4">
            <a-form-item
              v-show="useEditor"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              label="模板内容"
              style="margin-left: 4px;width: 126%"
            >
              <j-editor v-model="templateEditorContent" />
            </a-form-item>
          </a-col>
        </a-row>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { httpAction } from '@/api/manage'
import pick from 'lodash.pick'
import { duplicateCheck } from '@/api/api'
import JEditor from '@/components/jeecg/JEditor'

export default {
  name: 'SysMessageTemplateModal',
  components: {
    JEditor
  },
  data() {
    return {
      title: '操作',
      visible: false,
      disable: true,
      model: {},
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
        templateCode: { rules: [{ required: true, message: '请输入模板CODE!' }, { validator: this.validateTemplateCode }] },
        templateName: { rules: [{ required: true, message: '请输入模板标题!' }] },
        templateContent: { rules: [] },
        templateType: { rules: [{ required: true, message: '请输入模板类型!' }] }
      },
      url: {
        add: '/message/sysMessageTemplate/add',
        edit: '/message/sysMessageTemplate/edit'
      },
      useEditor: false,
      templateEditorContent: ''
    }
  },
  created() {
  },
  methods: {
    add() {
      this.disable = false
      this.edit({})
    },
    edit(record) {
      this.form.resetFields()
      this.model = Object.assign({}, record)
      this.useEditor = (record.templateType == 2 || record.templateType == 4)
      if (this.useEditor) {
        this.templateEditorContent = record.templateContent
      } else {
        this.templateEditorContent = ''
      }
      this.visible = true
      this.$nextTick(() => {
        if (this.useEditor) {
          this.form.setFieldsValue(pick(this.model, 'templateCode', 'templateName', 'templateTestJson', 'templateType'))
        } else {
          this.form.setFieldsValue(pick(this.model, 'templateCode', 'templateContent', 'templateName', 'templateTestJson', 'templateType'))
        }
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
      this.disable = true
    },
    handleOk() {
      this.model.templateType = this.templateType
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'put'
          }
          const formData = Object.assign(this.model, values)
          // 时间格式化

          if (this.useEditor) {
            formData.templateContent = this.templateEditorContent
          }
          console.log(formData)
          httpAction(httpurl, formData, method).then((res) => {
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
    validateTemplateCode(rule, value, callback) {
      var params = {
        tableName: 'sys_sms_template',
        fieldName: 'template_code',
        fieldVal: value,
        dataId: this.model.id
      }
      duplicateCheck(params).then((res) => {
        if (res.success) {
          callback()
        } else {
          callback(res.message)
        }
      })
    },
    handleCancel() {
      this.close()
    },
    handleChangeTemplateType(value) {
      // 如果是邮件类型那么则改变模板内容是富文本编辑器
      this.useEditor = (value == 2 || value == 4)
    }

  }
}
</script>

<style scoped>

</style>
