<template>
  <a-card :body-style="{padding: '24px 32px'}" :bordered="false">
    <a-form :form="form" @submit="handleSubmit">
      <a-form-item
        label="标题"
        :label-col="{lg: {span: 7}, sm: {span: 7}}"
        :wrapper-col="{lg: {span: 10}, sm: {span: 17} }"
      >
        <a-input
          v-decorator="[
            'name',
            {rules: [{ required: true, message: '请输入标题' }]}
          ]"
          name="name"
          placeholder="给目标起个名字"
        />
      </a-form-item>
      <a-form-item
        label="起止日期"
        :label-col="{lg: {span: 7}, sm: {span: 7}}"
        :wrapper-col="{lg: {span: 10}, sm: {span: 17} }"
      >
        <a-range-picker
          v-decorator="[
            'buildTime',
            {rules: [{ required: true, message: '请选择起止日期' }]}
          ]"
          name="buildTime"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item
        label="目标描述"
        :label-col="{lg: {span: 7}, sm: {span: 7}}"
        :wrapper-col="{lg: {span: 10}, sm: {span: 17} }"
      >
        <a-textarea
          v-decorator="[
            'description',
            {rules: [{ required: true, message: '请输入目标描述' }]}
          ]"
          rows="4"
          placeholder="请输入你阶段性工作目标"
        />
      </a-form-item>
      <a-form-item
        label="衡量标准"
        :label-col="{lg: {span: 7}, sm: {span: 7}}"
        :wrapper-col="{lg: {span: 10}, sm: {span: 17} }"
      >
        <a-textarea
          v-decorator="[
            'type',
            {rules: [{ required: true, message: '请输入衡量标准' }]}
          ]"
          rows="4"
          placeholder="请输入衡量标准"
        />
      </a-form-item>
      <a-form-item
        label="客户"
        :label-col="{lg: {span: 7}, sm: {span: 7}}"
        :wrapper-col="{lg: {span: 10}, sm: {span: 17} }"
      >
        <a-input
          v-decorator="[
            'customer',
            {rules: [{ required: true, message: '请描述你服务的客户' }]}
          ]"
          placeholder="请描述你服务的客户，内部客户直接 @姓名／工号"
        />
      </a-form-item>
      <a-form-item
        label="邀评人"
        :label-col="{lg: {span: 7}, sm: {span: 7}}"
        :wrapper-col="{lg: {span: 10}, sm: {span: 17} }"
        :required="false"
      >
        <a-input placeholder="请直接 @姓名／工号，最多可邀请 5 人" />
      </a-form-item>
      <a-form-item
        label="权重"
        :label-col="{lg: {span: 7}, sm: {span: 7}}"
        :wrapper-col="{lg: {span: 10}, sm: {span: 17} }"
        :required="false"
      >
        <a-input-number :min="0" :max="100" />
        <span> %</span>
      </a-form-item>
      <a-form-item
        label="目标公开"
        :label-col="{lg: {span: 7}, sm: {span: 7}}"
        :wrapper-col="{lg: {span: 10}, sm: {span: 17} }"
        :required="false"
        help="客户、邀评人默认被分享"
      >
        <a-radio-group v-model="value">
          <a-radio :value="1">公开</a-radio>
          <a-radio :value="2">部分公开</a-radio>
          <a-radio :value="3">不公开</a-radio>
        </a-radio-group>
        <a-form-item>
          <a-select v-if="value === 2" mode="multiple">
            <a-select-option value="4">同事一</a-select-option>
            <a-select-option value="5">同事二</a-select-option>
            <a-select-option value="6">同事三</a-select-option>
          </a-select>
        </a-form-item>
      </a-form-item>
      <a-form-item
        :wrapper-col="{ span: 24 }"
        style="text-align: center"
      >
        <a-button html-type="submit" type="primary">提交</a-button>
        <a-button style="margin-left: 8px">保存</a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script>
export default {
  name: 'BaseForm',
  data() {
    return {
      description: '表单页用于向用户收集或验证信息，基础表单常见于数据项较少的表单场景。',
      value: 1,

      // form
      form: this.$form.createForm(this)

    }
  },
  methods: {

    // handler
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          // eslint-disable-next-line no-console
          console.log('Received values of form: ', values)
        }
      })
    }
  }
}
</script>
