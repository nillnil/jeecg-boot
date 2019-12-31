<template>
  <div>
    <index-chart v-if="indexStyle==1" />
    <index-bdc v-if="indexStyle==2" />
    <index-task v-if="indexStyle==3" />
    <div style="width: 100%;text-align: right;margin-top: 20px">
      请选择首页样式：
      <a-radio-group v-model="indexStyle">
        <a-radio :value="1">统计图表</a-radio>
        <a-radio :value="2">统计图表2</a-radio>
        <a-radio :value="3">任务表格</a-radio>
      </a-radio-group>
    </div>
  </div>
</template>

<script>
import IndexChart from './IndexChart'
import IndexTask from './IndexTask'
import IndexBdc from './IndexBdc'

export default {
  name: 'Analysis',
  components: {
    IndexChart,
    IndexTask,
    IndexBdc
  },
  data() {
    return {
      indexStyle: 1
    }
  },
  created() {

  },
  methods: {

  }
}
</script>
