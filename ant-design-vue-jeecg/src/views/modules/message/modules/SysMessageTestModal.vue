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
      <a-form>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="模板标题"
        >
          <a-input v-model="templateName" disabled />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="模板内容"
        >
          <a-textarea v-model="templateContent" disabled :autosize="{ minRows: 5, maxRows: 8 }" />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="测试数据"
        >
          <a-textarea v-model="testData" placeholder="请输入json格式测试数据" :autosize="{ minRows: 5, maxRows: 8 }" />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="消息类型"
        >
          <j-dict-select-tag
            v-model="msgType"
            placeholder="请选择消息类型"
            dict-code="msgType"
          />
        </a-form-item>
        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="消息接收方"
        >
          <a-input v-model="receiver" placeholder="请输入消息接收方" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { httpAction } from '@/api/manage'

export default {
  name: 'SysMessageTestModal',
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
      url: {
        send: '/message/sysMessageTemplate/sendMsg'
      },
      templateName: '',
      templateContent: '',
      receiver: '',
      msgType: '',
      testData: '',
      sendParams: {}
    }
  },
  methods: {
    open(record) {
      this.sendParams.templateCode = record.templateCode
      this.templateName = record.templateName
      this.templateContent = record.templateContent
      this.testData = record.templateTestJson
      this.visible = true
    },
    close() {
      this.receiver = ''
      this.msgType = ''
      this.sendParams = {}
      this.visible = false
    },
    handleOk() {
      const httpurl = this.url.send
      const method = 'post'
      this.sendParams.testData = this.testData
      this.sendParams.receiver = this.receiver
      this.sendParams.msgType = this.msgType
      httpAction(httpurl, this.sendParams, method).then((res) => {
        if (res.success) {
          this.$message.success(res.message)
        } else {
          this.$message.warning(res.message)
        }
      }).finally(() => {
        this.confirmLoading = false
        this.close()
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
