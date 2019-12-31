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

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="消息标题"
        >
          <a-input v-decorator="['esTitle', {}]" placeholder="请输入消息标题" />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="发送内容"
        >
          <a-input v-decorator="['esContent', {}]" placeholder="请输入发送内容" />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="发送所需参数"
        >
          <a-input v-decorator="['esParam', {}]" placeholder="请输入发送所需参数Json格式" />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="接收人"
        >
          <a-input v-decorator="['esReceiver', {}]" placeholder="请输入接收人" />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="发送方式"
        >
          <j-dict-select-tag v-decorator="[ 'esType', {}]" :trigger-change="true" dict-code="msgType" placeholder="请选择发送方式" />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="发送时间"
        >
          <a-date-picker v-decorator="[ 'esSendTime', {}]" show-time format="YYYY-MM-DD HH:mm:ss" />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="发送状态"
        >
          <j-dict-select-tag v-decorator="[ 'esSendStatus', {}]" :trigger-change="true" dict-code="msgSendStatus" placeholder="请选择发送状态" />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="发送次数"
        >
          <a-input-number v-decorator="[ 'esSendNum', {}]" />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="发送失败原因"
        >
          <a-input v-decorator="['esResult', {}]" />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="备注"
        >
          <a-input v-decorator="['remark', {}]" />
        </a-form-item>
      </a-form>
    </a-spin>
    <div v-show="!disableSubmit">
      <a-button style="margin-right: .8rem" @confirm="handleCancel">取消</a-button>
      <a-button type="primary" :loading="confirmLoading" @click="handleOk">提交</a-button>
    </div>
  </a-drawer>
</template>

<script>
import { httpAction } from '@/api/manage'
import pick from 'lodash.pick'
import moment from 'moment'

export default {
  name: 'SysMessageModal',
  data() {
    return {
      title: '操作',
      visible: false,
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
      validatorRules: {},
      disableSubmit: true,
      url: {
        add: '/message/sysMessage/add',
        edit: '/message/sysMessage/edit'
      }
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
        this.form.setFieldsValue(pick(this.model, 'esContent', 'esParam', 'esReceiver', 'esResult', 'esSendNum', 'esSendStatus', 'esTitle', 'esType', 'remark'))
        // 时间格式化
        this.form.setFieldsValue({ esSendTime: this.model.esSendTime ? moment(this.model.esSendTime) : null })
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
          formData.esSendTime = formData.esSendTime ? formData.esSendTime.format('YYYY-MM-DD HH:mm:ss') : null

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
    handleCancel() {
      this.close()
    }

  }
}
</script>

<style scoped>

</style>
