<template>
  <a-card :bordered="false">

    <a-tabs>

      <a-tab-pane key="1" tab="普通列表">
        <default-table />
      </a-tab-pane>

      <a-tab-pane key="2" tab="只读列表">
        <read-only-table />
      </a-tab-pane>

      <a-tab-pane key="3" tab="三级联动">
        <three-linkage />
      </a-tab-pane>

    </a-tabs>

  </a-card>
</template>

<script>
import DefaultTable from './modules/JEditableTable/DefaultTable'
import ReadOnlyTable from './modules/JEditableTable/ReadOnlyTable'
import ThreeLinkage from './modules/JEditableTable/ThreeLinkage'

export default {
  name: 'JeecgEditableTableExample',
  components: { DefaultTable, ReadOnlyTable, ThreeLinkage },
  data() {
    return {}
  },
  methods: {}
}
</script>

<style scoped>

</style>
