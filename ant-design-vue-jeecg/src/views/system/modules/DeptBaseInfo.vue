<template>
  <a-card :visible="visible">
    <a-form :form="form">
      <a-form-item
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        label="机构名称"
      >
        <a-input v-decorator="['departName', {}]" style="border:0px;" placeholder="" />
      </a-form-item>
      <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="上级部门">
        <a-tree-select
          v-model="model.parentId"
          disabled
          style="width:100%;border: 0px;border: none;outline:none;"
          :dropdown-style="{maxHeight:'200px',overflow:'auto'}"
          :tree-data="treeData"
          placeholder="无"
        />
      </a-form-item>
      <a-form-item
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        label="机构编码"
      >
        <a-input v-decorator="['orgCode', {}]" style="border:0px;" placeholder="" />
      </a-form-item>
      <a-form-item
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        label="机构类型"
      >
        <a-radio-group v-decorator="['orgCategory',{}]" :disabled="true" placeholder="请选择机构类型">
          <a-radio value="1">
            公司
          </a-radio>
          <a-radio value="2">
            部门
          </a-radio>
          <a-radio value="3">
            岗位
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        label="排序"
      >
        <a-input-number v-decorator="[ 'departOrder',{}]" style="border:0px;" />
      </a-form-item>
      <a-form-item
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        label="手机号"
      >
        <a-input v-decorator="['mobile', {}]" style="border:0px;" placeholder="" />
      </a-form-item>
      <a-form-item
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        label="地址"
      >
        <a-input v-decorator="['address', {}]" style="border:0px;" placeholder="" />
      </a-form-item>
      <a-form-item
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        label="备注"
      >
        <a-textarea v-decorator="['memo', {}]" style="border:0px;" placeholder="" />
      </a-form-item>
    </a-form>
  </a-card>
</template>
<script>
import pick from 'lodash.pick'
import { queryIdTree } from '@/api/api'

export default {
  name: 'DeptBaseInfo',
  components: {},
  data() {
    return {
      departTree: [],
      id: '',
      model: {},
      visible: false,
      disable: true,
      treeData: [],
      form: this.$form.createForm(this),
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    }
  },
  created() {
    this.loadTreeData()
  },
  methods: {
    loadTreeData() {
      queryIdTree().then((res) => {
        if (res.success) {
          for (let i = 0; i < res.result.length; i++) {
            const temp = res.result[i]
            this.treeData.push(temp)
          }
        }
      })
    },
    open(record) {
      this.form.resetFields()
      this.model = Object.assign({}, record)
      this.visible = true
      console.log('record:')
      console.log(record)
      this.$nextTick(() => {
        this.form.setFieldsValue(pick(record, 'orgCategory', 'departName', 'parentId', 'orgCode', 'departOrder', 'mobile', 'fax', 'address', 'memo'))
      })
    },
    clearForm() {
      this.form.resetFields()
      this.treeData = []
    }
  }
}
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>
