<template>

  <a-select
    v-if="async"
    v-model="selectedAsyncValue"
    show-search
    label-in-value
    :placeholder="placeholder"
    style="width: 100%"
    :filter-option="false"
    allow-clear
    :not-found-content="loading ? undefined : null"
    @search="loadData"
    @change="handleAsyncChange"
  >
    <a-spin v-if="loading" slot="notFoundContent" size="small" />
    <a-select-option v-for="d in options" :key="d.value" :value="d.value">{{ d.text }}</a-select-option>
  </a-select>

  <a-select
    v-else
    v-model="selectedValue"
    show-search
    :placeholder="placeholder"
    option-filter-prop="children"
    style="width: 100%"
    :filter-option="filterOption"
    allow-clear
    :not-found-content="loading ? undefined : null"
    @change="handleChange"
  >
    <a-spin v-if="loading" slot="notFoundContent" size="small" />
    <a-select-option v-for="d in options" :key="d.value" :value="d.value">{{ d.text }}</a-select-option>
  </a-select>

</template>

<script>
import { ajaxGetDictItems } from '@/api/api'
import debounce from 'lodash/debounce'
import { getAction } from '../../api/manage'

export default {
  name: 'JSearchSelectTag',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    disabled: Boolean,
    value: String,
    dict: String,
    dictOptions: Array,
    async: Boolean,
    placeholder: {
      type: String,
      default: '请选择',
      required: false
    }
  },
  data() {
    this.loadData = debounce(this.loadData, 800)// 消抖
    this.lastLoad = 0
    return {
      loading: false,
      selectedValue: [],
      selectedAsyncValue: [],
      options: []
    }
  },
  watch: {
    'value': {
      immediate: true,
      handler(val) {
        if (!val) {
          this.selectedValue = []
          this.selectedAsyncValue = []
        } else {
          this.initSelectValue()
        }
      }
    },
    'dict': {
      handler() {
        this.initDictData()
      }
    }
  },
  created() {
    this.initDictData()
  },
  methods: {
    initSelectValue() {
      if (this.async) {
        if (!this.selectedAsyncValue || !this.selectedAsyncValue.key || this.selectedAsyncValue.key != this.value) {
          console.log('这才请求后台')
          getAction(`/sys/dict/loadDictItem/${this.dict}`, { key: this.value }).then(res => {
            if (res.success) {
              const obj = {
                key: this.value,
                label: res.result
              }
              this.selectedAsyncValue = { ...obj }
            }
          })
        }
      } else {
        this.selectedValue = this.value
      }
    },
    loadData(value) {
      console.log('数据加载', value)
      this.lastLoad += 1
      const currentLoad = this.lastLoad
      this.options = []
      this.loading = true
      // 字典code格式：table,text,code
      getAction(`/sys/dict/loadDict/${this.dict}`, { keyword: value }).then(res => {
        this.loading = false
        if (res.success) {
          if (currentLoad != this.lastLoad) {
            return
          }
          this.options = res.result
          console.log('我是第一个', res)
        } else {
          this.$message.warning(res.message)
        }
      })
    },
    initDictData() {
      if (!this.async) {
        // 如果字典项集合有数据
        if (this.dictOptions && this.dictOptions.length > 0) {
          this.options = [...this.dictOptions]
        } else {
          // 根据字典Code, 初始化字典数组
          ajaxGetDictItems(this.dict, null).then((res) => {
            if (res.success) {
              this.options = res.result
            }
          })
        }
      }
    },
    filterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
    handleChange(selectedValue) {
      console.log('selectedValue', selectedValue)
      this.selectedValue = selectedValue
      this.callback()
    },
    handleAsyncChange(selectedObj) {
      this.selectedAsyncValue = selectedObj
      this.selectedValue = selectedObj.key
      this.callback()
    },
    callback() {
      this.$emit('change', this.selectedValue)
    },
    setCurrentDictOptions(dictOptions) {
      this.options = dictOptions
    },
    getCurrentDictOptions() {
      return this.options
    }

  }
}
</script>

<style scoped>

</style>
