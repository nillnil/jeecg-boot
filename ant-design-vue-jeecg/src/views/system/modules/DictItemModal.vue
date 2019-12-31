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

        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="名称"
        >
          <a-input v-decorator="['itemText', validatorRules.itemText]" placeholder="请输入名称" />
        </a-form-item>

        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="数据值"
        >
          <a-input v-decorator="['itemValue', validatorRules.itemValue]" placeholder="请输入数据值" />
        </a-form-item>

        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="描述"
        >
          <a-input v-decorator="['description']" />
        </a-form-item>

        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="排序值"
        >
          <a-input-number v-decorator="['sortOrder',{'initialValue':1}]" :min="1" />
          值越小越靠前，支持小数
        </a-form-item>

        <a-form-item
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          label="是否启用"
          has-feedback
        >
          <a-switch v-model="visibleCheck" checked-children="启用" un-checked-children="禁用" @change="onChose" />
        </a-form-item>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { addDictItem, editDictItem } from '@/api/api'

export default {
  name: 'DictItemModal',
  data() {
    return {
      title: '操作',
      visible: false,
      visibleCheck: true,
      model: {},
      dictId: '',
      status: 1,
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
        itemText: { rules: [{ required: true, message: '请输入名称!' }] },
        itemValue: { rules: [{ required: true, message: '请输入数据值!' }] }
      }
    }
  },
  created() {
  },
  methods: {
    add(dictId) {
      this.dictId = dictId
      this.edit({})
    },
    edit(record) {
      if (record.id) {
        this.dictId = record.dictId
        this.visibleCheck = (record.status === 1)
      }
      this.form.resetFields()
      this.model = Object.assign({}, record)
      this.model.dictId = this.dictId
      this.model.status = this.status
      this.visible = true
      this.$nextTick(() => {
        this.form.setFieldsValue(pick(this.model, 'itemText', 'itemValue', 'description', 'sortOrder'))
      })
    },
    onChose(checked) {
      if (checked) {
        this.status = 1
        this.visibleCheck = true
      } else {
        this.status = 0
        this.visibleCheck = false
      }
    },
    // 确定
    handleOk() {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true
          values.itemText = (values.itemText || '').trim()
          values.itemValue = (values.itemValue || '').trim()
          values.description = (values.description || '').trim()
          const formData = Object.assign(this.model, values)
          formData.status = this.status
          let obj
          if (!this.model.id) {
            obj = addDictItem(formData)
          } else {
            obj = editDictItem(formData)
          }
          obj.then((res) => {
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
    // 关闭
    handleCancel() {
      this.close()
    },
    close() {
      this.$emit('close')
      this.visible = false
    }
  }
}
</script>
