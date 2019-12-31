<template>
  <a-drawer
    title="数据规则/按钮权限配置"
    width="365"
    :closable="false"
    :visible="visible"
    @close="onClose"
  >

    <a-tabs default-active-key="1">
      <a-tab-pane key="1" tab="数据规则">

        <a-checkbox-group v-if="dataruleList.length>0" v-model="dataruleChecked">
          <a-row>
            <a-col v-for="(item,index) in dataruleList" :key=" 'dr'+index " :span="24">
              <a-checkbox :value="item.id">{{ item.ruleName }}</a-checkbox>
            </a-col>

            <a-col :span="24">
              <div style="width: 100%;margin-top: 15px">
                <a-button type="primary" size="small" icon="save" @click="saveDataruleForRole">点击保存</a-button>
              </div>
            </a-col>
          </a-row>
        </a-checkbox-group>
        <div v-else><h3>无配置信息!</h3></div>

      </a-tab-pane>
      <!--<a-tab-pane tab="按钮权限" key="2">敬请期待!!!</a-tab-pane>-->
    </a-tabs>

  </a-drawer>
</template>

<script>
import ARow from 'ant-design-vue/es/grid/Row'
import ACol from 'ant-design-vue/es/grid/Col'
import { getAction, postAction } from '@/api/manage'

export default {
  name: 'RoleDataruleModal',
  components: { ACol, ARow },
  data() {
    return {
      functionId: '',
      roleId: '',
      visible: false,
      tabList: [{
        key: '1',
        tab: '数据规则'
      }, {
        key: '2',
        tab: '按钮权限'
      }],
      activeTabKey: '1',
      url: {
        datarule: '/sys/role/datarule'
      },
      dataruleList: [],
      dataruleChecked: []
    }
  },
  methods: {
    loadData() {
      getAction(`${this.url.datarule}/${this.functionId}/${this.roleId}`).then(res => {
        console.log(res)
        if (res.success) {
          this.dataruleList = res.result.datarule
          const drChecked = res.result.drChecked
          if (drChecked) {
            this.dataruleChecked = drChecked.split(',')
          }
        }
      })
    },
    saveDataruleForRole() {
      if (!this.dataruleChecked || this.dataruleChecked.length == 0) {
        this.$message.warning('请注意，现未勾选任何数据权限!')
      }
      const params = {
        permissionId: this.functionId,
        roleId: this.roleId,
        dataRuleIds: this.dataruleChecked.join(',')
      }
      console.log('保存数据权限', params)
      postAction(this.url.datarule, params).then(res => {
        if (res.success) {
          this.$message.success(res.message)
        } else {
          this.$message.error(res.message)
        }
      })
    },
    show(functionId, roleId) {
      this.onReset()
      this.functionId = functionId
      this.roleId = roleId
      this.visible = true
      this.loadData()
    },
    onClose() {
      this.visible = false
      this.onReset()
    },
    onTabChange(key) {
      this.activeTabKey = key
    },
    onReset() {
      this.functionId = ''
      this.roleId = ''
      this.dataruleList = []
      this.dataruleChecked = []
    }
  }
}
</script>

<style scoped>

</style>
