<template>
  <j-select-biz-component
    :value="value"

    name="角色"
    display-key="roleName"

    :return-keys="returnKeys"
    :list-url="url.list"
    :columns="columns"
    query-param-text="角色编码"

    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script>
import JSelectBizComponent from './JSelectBizComponent'

export default {
  name: 'JSelectMultiUser',
  components: { JSelectBizComponent },
  props: ['value'],
  data() {
    return {
      returnKeys: ['id', 'roleCode'],
      url: { list: '/sys/role/list' },
      columns: [
        { title: '角色名称', dataIndex: 'roleName', align: 'center', width: 120 },
        { title: '角色编码', dataIndex: 'roleCode', align: 'center', width: 120 }
      ]
    }
  }
}
</script>

<style lang="scss" scoped></style>
