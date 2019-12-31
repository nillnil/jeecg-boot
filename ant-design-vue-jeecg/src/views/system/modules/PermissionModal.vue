<template>
  <a-drawer
    :title="title"
    :width="drawerWidth"
    :visible="visible"
    :confirm-loading="confirmLoading"
    :wrap-style="{height: 'calc(100% - 108px)',overflow: 'auto',paddingBottom: '108px'}"
    @close="handleCancel"
  >
    <div :style="{width: '100%',border: '1px solid #e9e9e9',padding: '10px 16px',background: '#fff',}">
      <a-spin :spinning="confirmLoading">
        <a-form :form="form">

          <a-form-item label="菜单类型" :label-col="labelCol" :wrapper-col="wrapperCol">
            <a-radio-group v-decorator="['menuType',{'initialValue':localMenuType}]" @change="onChangeMenuType">
              <a-radio :value="0">一级菜单</a-radio>
              <a-radio :value="1">子菜单</a-radio>
              <a-radio :value="2">按钮/权限</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :label="menuLabel"
            has-feedback
          >
            <a-input v-decorator="[ 'name', validatorRules.name]" placeholder="请输入菜单名称" :read-only="disableSubmit" />
          </a-form-item>

          <a-form-item
            v-show="localMenuType!=0"
            label="上级菜单"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :validate-status="validateStatus"
            :has-feedback="true"
            :required="true"
          >
            <span slot="help">{{ validateStatus=='error'?'请选择上级菜单':'&nbsp;&nbsp;' }}</span>
            <a-tree-select
              v-model="model.parentId"
              style="width:100%"
              :dropdown-style="{ maxHeight: '200px', overflow: 'auto' }"
              :tree-data="treeData"
              placeholder="请选择父级菜单"
              :disabled="disableSubmit"
              @change="handleParentIdChange"
            />
          </a-form-item>

          <a-form-item
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            label="菜单路径"
          >
            <a-input v-decorator="[ 'url',validatorRules.url]" placeholder="请输入菜单路径" :read-only="disableSubmit" />
          </a-form-item>

          <a-form-item
            v-show="show"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            label="前端组件"
          >
            <a-input v-decorator="[ 'component',validatorRules.component]" placeholder="请输入前端组件" :read-only="disableSubmit" />
          </a-form-item>

          <a-form-item
            v-show="localMenuType==0"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            label="默认跳转地址"
          >
            <a-input v-decorator="[ 'redirect',{}]" placeholder="请输入路由参数 redirect" :read-only="disableSubmit" />
          </a-form-item>

          <a-form-item
            v-show="!show"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            label="授权标识"
          >
            <a-input v-decorator="[ 'perms', {}]" placeholder="多个用逗号分隔, 如: user:list,user:create" :read-only="disableSubmit" />
          </a-form-item>

          <a-form-item
            v-show="!show"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            label="授权策略"
          >
            <j-dict-select-tag v-decorator="['permsType', {}]" placeholder="请选择授权策略" :type="'radio'" :trigger-change="true" dict-code="global_perms_type" />

          </a-form-item>
          <a-form-item
            v-show="!show"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            label="状态"
          >
            <j-dict-select-tag v-decorator="['status', {}]" placeholder="请选择状态" :type="'radio'" :trigger-change="true" dict-code="valid_status" />

          </a-form-item>

          <a-form-item
            v-show="show"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            label="菜单图标"
          >
            <a-input v-model="model.icon" placeholder="点击右侧按钮选择图标" :read-only="disableSubmit">
              <a-icon slot="addonAfter" type="setting" @click="selectIcons" />
            </a-input>
          </a-form-item>

          <a-form-item
            v-show="show"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            label="排序"
          >
            <a-input-number v-decorator="[ 'sortNo',validatorRules.sortNo]" placeholder="请输入菜单排序" style="width: 200px" :read-only="disableSubmit" />
          </a-form-item>

          <a-form-item
            v-show="show"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            label="是否路由菜单"
          >
            <a-switch v-model="routeSwitch" checked-children="是" un-checked-children="否" />
          </a-form-item>

          <a-form-item
            v-show="show"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            label="隐藏路由"
          >
            <a-switch v-model="menuHidden" checked-children="是" un-checked-children="否" />
          </a-form-item>

          <a-form-item
            v-show="show"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            label="是否缓存路由"
          >
            <a-switch v-model="isKeepalive" checked-children="是" un-checked-children="否" />
          </a-form-item>

          <a-form-item
            v-show="show"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            label="聚合路由"
          >
            <a-switch v-model="alwaysShow" checked-children="是" un-checked-children="否" />
          </a-form-item>

          <!--update_begin author:wuxianquan date:20190908 for:增加组件，外链打开方式可选 -->
          <a-form-item
            v-show="show"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            label="打开方式"
          >
            <a-switch v-model="internalOrExternal" checked-children="外部" un-checked-children="内部" />
          </a-form-item>
        <!--update_end author:wuxianquan date:20190908 for:增加组件，外链打开方式可选 -->

        </a-form>

        <!-- 选择图标 -->
        <icons :icon-choose-visible="iconChooseVisible" @choose="handleIconChoose" @close="handleIconCancel" />
      </a-spin>
      <a-row :style="{textAlign:'right'}">
        <a-button :style="{marginRight: '8px'}" @click="handleCancel">
          关闭
        </a-button>
        <a-button :disabled="disableSubmit" type="primary" @click="handleOk">确定</a-button>
      </a-row>
    </div>
  </a-drawer>
</template>

<script>
import { addPermission, editPermission, queryTreeList } from '@/api/api'
import Icons from './icon/Icons'
import pick from 'lodash.pick'

export default {
  name: 'PermissionModal',
  components: { Icons },
  data() {
    return {
      drawerWidth: 700,
      treeData: [],
      treeValue: '0-0-4',
      title: '操作',
      visible: false,
      disableSubmit: false,
      model: {},
      localMenuType: 0,
      alwaysShow: false, // 表单元素-聚合路由
      menuHidden: false, // 表单元素-隐藏路由
      routeSwitch: true, // 是否路由菜单
      /* update_begin author:wuxianquan date:20190908 for:定义变量，初始值代表内部打开*/
      internalOrExternal: false, // 菜单打开方式
      /* update_end author:wuxianquan date:20190908 for:定义变量，初始值代表内部打开*/
      isKeepalive: true, // 是否缓存路由
      show: true, // 根据菜单类型，动态显示隐藏表单元素
      menuLabel: '菜单名称',
      isRequrie: true, // 是否需要验证
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

      iconChooseVisible: false,
      validateStatus: ''
    }
  },
  computed: {
    validatorRules: function() {
      return {
        name: { rules: [{ required: true, message: '请输入菜单标题!' }] },
        component: { rules: [{ required: this.show, message: '请输入前端组件!' }] },
        url: { rules: [{ required: this.show, message: '请输入菜单路径!' }] },
        permsType: { rules: [{ required: true, message: '请输入授权策略!' }] },
        sortNo: { initialValue: 1.0 }
      }
    }
  },
  created() {
    this.initDictConfig()
  },
  methods: {
    loadTree() {
      var that = this
      queryTreeList().then((res) => {
        if (res.success) {
          console.log('----queryTreeList---')
          console.log(res)
          that.treeData = []
          const treeList = res.result.treeList
          for (let a = 0; a < treeList.length; a++) {
            const temp = treeList[a]
            temp.isLeaf = temp.leaf
            that.treeData.push(temp)
          }
        }
      })
    },
    add() {
      // 默认值
      this.edit({ status: '1', permsType: '1', route: true })
    },
    edit(record) {
      this.resetScreenSize() // 调用此方法,根据屏幕宽度自适应调整抽屉的宽度
      this.form.resetFields()
      this.model = Object.assign({}, record)
      // --------------------------------------------------------------------------------------------------
      // 根据菜单类型，动态展示页面字段
      console.log(record)
      this.alwaysShow = !!record.alwaysShow
      this.menuHidden = !!record.hidden

      if (record.route != null) {
        this.routeSwitch = !!record.route
      }

      if (record.keepAlive != null) {
        this.isKeepalive = !!record.keepAlive
      } else {
        this.isKeepalive = false // 升级兼容 如果没有（后台没有传过来、或者是新建）默认为false
      }

      /* update_begin author:wuxianquan date:20190908 for:编辑初始化数据*/
      if (record.internalOrExternal != null) {
        this.internalOrExternal = !!record.internalOrExternal
      } else {
        this.internalOrExternal = false
      }
      /* update_end author:wuxianquan date:20190908 for:编辑初始化数据*/

      // console.log('record.menuType', record.menuType);
      this.show = record.menuType != 2
      this.menuLabel = record.menuType == 2 ? '按钮/权限' : '菜单名称'

      if (this.model.parentId) {
        this.localMenuType = 1
      } else {
        this.localMenuType = 0
      }
      // ----------------------------------------------------------------------------------------------

      this.visible = true
      this.loadTree()
      const fieldsVal = pick(this.model, 'name', 'perms', 'permsType', 'component', 'url', 'sortNo', 'menuType', 'status')
      this.$nextTick(() => {
        this.form.setFieldsValue(fieldsVal)
      })
    },
    close() {
      this.$emit('close')
      this.disableSubmit = false
      this.visible = false
    },
    handleOk() {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          this.model.alwaysShow = this.alwaysShow
          this.model.hidden = this.menuHidden
          this.model.route = this.routeSwitch
          this.model.keepAlive = this.isKeepalive
          /* update_begin author:wuxianquan date:20190908 for:获取值*/
          this.model.internalOrExternal = this.internalOrExternal
          /* update_end author:wuxianquan date:20190908 for:获取值*/

          const formData = Object.assign(this.model, values)
          if ((formData.menuType == 1 || formData.menuType == 2) && !formData.parentId) {
            that.validateStatus = 'error'
            that.$message.error('请检查你填的类型以及信息是否正确！')
            return
          } else {
            that.validateStatus = 'success'
          }
          that.confirmLoading = true
          console.log(formData)
          let obj
          if (!this.model.id) {
            obj = addPermission(formData)
          } else {
            obj = editPermission(formData)
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
    handleCancel() {
      this.close()
    },
    validateNumber(rule, value, callback) {
      if (!value || new RegExp(/^[0-9]*[1-9][0-9]*$/).test(value)) {
        callback()
      } else {
        callback('请输入正整数!')
      }
    },
    onChangeMenuType(e) {
      // console.log('localMenuType checked', e.target.value)
      this.localMenuType = e.target.value
      if (e.target.value == 2) {
        this.show = false
        this.menuLabel = '按钮/权限'
      } else {
        this.show = true
        this.menuLabel = '菜单名称'
      }
      this.$nextTick(() => {
        this.form.validateFields(['url', 'component'], { force: true })
      })
    },
    selectIcons() {
      this.iconChooseVisible = true
    },
    handleIconCancel() {
      this.iconChooseVisible = false
    },
    handleIconChoose(value) {
      console.log(value)
      this.model.icon = value
      this.form.icon = value
      this.iconChooseVisible = false
    },
    // 根据屏幕变化,设置抽屉尺寸
    resetScreenSize() {
      const screenWidth = document.body.clientWidth
      if (screenWidth < 500) {
        this.drawerWidth = screenWidth
      } else {
        this.drawerWidth = 700
      }
    },
    initDictConfig() {
    },
    handleParentIdChange(value) {
      if (!value) {
        this.validateStatus = 'error'
      } else {
        this.validateStatus = 'success'
      }
    }
  }
}
</script>

<style scoped>

</style>
