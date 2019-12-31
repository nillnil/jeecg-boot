<template>
  <a-card :bordered="false">
    <a-form :form="form" @submit="handleSubmit">
      <a-col :md="24" :sm="24">
        <a-form-item label="Note" :label-col="{ span: 7 }" :wrapper-col="{ span: 15 }">
          <a-input v-decorator="['note',{rules: [{ required: true, message: 'Please input your note!' }]}]" />
        </a-form-item>
      </a-col>
      <a-col :md="24" :sm="24">
        <a-form-item label="Gender" :label-col="{ span: 7 }" :wrapper-col="{ span: 15 }">
          <a-select v-decorator="['gender',{rules: [{ required: true, message: 'Please select your gender!' }]}]" placeholder="Select a option and change input text above" @change="this.handleSelectChange">
            <a-select-option value="male">male</a-select-option>
            <a-select-option value="female">female</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :md="24" :sm="24">
        <a-form-item label="Gender" :label-col="{ span: 7 }" :wrapper-col="{ span: 15 }">
          <a-cascader :options="areaOptions" :show-search="{filter}" placeholder="Please select" @change="onChange" />
        </a-form-item>
      </a-col>
      <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
        <a-col :md="24" :sm="24">
          <a-button type="primary" html-type="submit">Submit</a-button>
        </a-col>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script>
import { getAction } from '@/api/manage'
export default {
  data() {
    return {
      formLayout: 'horizontal',
      form: this.$form.createForm(this),
      areaOptions: []
    }
  },
  created() {
    getAction('/api/area').then((res) => {
      console.log('------------')
      console.log(res)
      this.areaOptions = res
    })
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values)
        }
      })
    },
    handleSelectChange(value) {
      console.log(value)
      this.form.setFieldsValue({
        note: `Hi, ${value === 'male' ? 'man' : 'lady'}!`
      })
    },
    onChange(value, selectedOptions) {
      console.log(value, selectedOptions)
    },
    filter(inputValue, path) {
      return (path.some(option => (option.label).toLowerCase().indexOf(inputValue.toLowerCase()) > -1))
    }
  }
}
</script>
