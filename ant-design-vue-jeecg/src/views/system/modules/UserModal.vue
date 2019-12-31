<template>
  <a-drawer
    :title="title"
    :mask-closable="true"
    :width="drawerWidth"
    placement="right"
    :closable="true"
    :visible="visible"
    style="height: calc(100% - 55px);overflow: auto;padding-bottom: 53px;"
    @close="handleCancel"
  >

    <template slot="title">
      <div style="width: 100%;">
        <span>{{ title }}</span>
        <span style="display:inline-block;width:calc(100% - 51px);padding-right:10px;text-align: right">
          <a-button icon="appstore" style="height:20px;width:20px;border:0px" @click="toggleScreen" />
        </span>
      </div>

    </template>

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item label="用户账号" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-input v-decorator="[ 'username', validatorRules.username]" placeholder="请输入用户账号" :read-only="!!model.id" />
        </a-form-item>

        <template v-if="!model.id">
          <a-form-item label="登陆密码" :label-col="labelCol" :wrapper-col="wrapperCol">
            <a-input v-decorator="[ 'password', validatorRules.password]" type="password" placeholder="请输入登陆密码" />
          </a-form-item>

          <a-form-item label="确认密码" :label-col="labelCol" :wrapper-col="wrapperCol">
            <a-input v-decorator="[ 'confirmpassword', validatorRules.confirmpassword]" type="password" placeholder="请重新输入登陆密码" @blur="handleConfirmBlur" />
          </a-form-item>
        </template>

        <a-form-item label="用户名字" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-input v-decorator="[ 'realname', validatorRules.realname]" placeholder="请输入用户名称" />
        </a-form-item>

        <a-form-item label="工号" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-input v-decorator="[ 'workNo', validatorRules.workNo]" placeholder="请输入工号" />
        </a-form-item>

        <a-form-item label="职务" :label-col="labelCol" :wrapper-col="wrapperCol">
          <j-select-position v-decorator="['post', {}]" placeholder="请选择职务" :multiple="false" />
        </a-form-item>

        <a-form-item v-show="!roleDisabled" label="角色分配" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-select
            v-model="selectedRole"
            mode="multiple"
            style="width: 100%"
            placeholder="请选择用户角色"
            option-filter-prop="children"
          >
            <a-select-option v-for="(role,roleindex) in roleList" :key="roleindex.toString()" :value="role.id">
              {{ role.roleName }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <!--部门分配-->
        <a-form-item v-show="!departDisabled" label="部门分配" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-input-search
            v-model="checkedDepartNameString"
            placeholder="点击右侧按钮选择部门"
            disabled
            @search="onSearch"
          >
            <a-button slot="enterButton" icon="search">选择</a-button>
          </a-input-search>
        </a-form-item>
        <a-form-item label="头像" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-upload
            list-type="picture-card"
            class="avatar-uploader"
            :show-upload-list="false"
            :action="uploadAction"
            :data="{'isup':1}"
            :headers="headers"
            :before-upload="beforeUpload"
            @change="handleChange"
          >
            <img v-if="picUrl" :src="getAvatarView()" alt="头像" style="height:104px;max-width:300px">
            <div v-else>
              <a-icon :type="uploadLoading ? 'loading' : 'plus'" />
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
        </a-form-item>

        <a-form-item label="生日" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-date-picker
            v-decorator="['birthday', {initialValue:!model.birthday?null:moment(model.birthday,dateFormat)}]"
            style="width: 100%"
            placeholder="请选择生日"
          />
        </a-form-item>

        <a-form-item label="性别" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-select v-decorator="[ 'sex', {}]" placeholder="请选择性别">
            <a-select-option :value="1">男</a-select-option>
            <a-select-option :value="2">女</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="邮箱" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-input v-decorator="[ 'email', validatorRules.email]" placeholder="请输入邮箱" />
        </a-form-item>

        <a-form-item label="手机号码" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-input v-decorator="[ 'phone', validatorRules.phone]" placeholder="请输入手机号码" :disabled="isDisabledAuth('user:form:phone')" />
        </a-form-item>

        <a-form-item label="座机" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-input v-decorator="[ 'telephone', validatorRules.telephone]" placeholder="请输入座机" />
        </a-form-item>

        <a-form-item label="工作流引擎" :label-col="labelCol" :wrapper-col="wrapperCol">
          <j-dict-select-tag v-decorator="['activitiSync', {}]" placeholder="请选择是否同步工作流引擎" :type="'radio'" :trigger-change="true" dict-code="activiti_sync" />
        </a-form-item>

      </a-form>
    </a-spin>
    <depart-window ref="departWindow" @ok="modalFormOk" />

    <div v-show="!disableSubmit" class="drawer-bootom-button">
      <a-popconfirm title="确定放弃编辑？" ok-text="确定" cancel-text="取消" @confirm="handleCancel">
        <a-button style="margin-right: .8rem">取消</a-button>
      </a-popconfirm>
      <a-button type="primary" :loading="confirmLoading" @click="handleSubmit">提交</a-button>
    </div>
  </a-drawer>
</template>

<script>
import pick from 'lodash.pick'
import moment from 'moment'
import Vue from 'vue'
// 引入搜索部门弹出框的组件
import departWindow from './DepartWindow'
import JSelectPosition from '@/components/jeecgbiz/JSelectPosition'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { getAction } from '@/api/manage'
import { addUser, editUser, queryUserRole, queryall } from '@/api/api'
import { disabledAuthFilter } from '@/utils/authFilter'
import { duplicateCheck } from '@/api/api'

export default {
  name: 'UserModal',
  components: {
    departWindow,
    JSelectPosition
  },
  data() {
    return {
      departDisabled: false, // 是否是我的部门调用该页面
      roleDisabled: false, // 是否是角色维护调用该页面
      modalWidth: 800,
      drawerWidth: 700,
      modaltoggleFlag: true,
      confirmDirty: false,
      selectedDepartKeys: [], // 保存用户选择部门id
      checkedDepartKeys: [],
      checkedDepartNames: [], // 保存部门的名称 =>title
      checkedDepartNameString: '', // 保存部门的名称 =>title
      userId: '', // 保存用户id
      disableSubmit: false,
      userDepartModel: { userId: '', departIdList: [] }, // 保存SysUserDepart的用户部门中间表数据需要的对象
      dateFormat: 'YYYY-MM-DD',
      validatorRules: {
        username: {
          rules: [{
            required: true, message: '请输入用户账号!'
          }, {
            validator: this.validateUsername
          }]
        },
        password: {
          rules: [{
            required: true,
            pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,./]).{8,}$/,
            message: '密码由8位数字、大小写字母和特殊符号组成!'
          }, {
            validator: this.validateToNextPassword
          }]
        },
        confirmpassword: {
          rules: [{
            required: true, message: '请重新输入登陆密码!'
          }, {
            validator: this.compareToFirstPassword
          }]
        },
        realname: { rules: [{ required: true, message: '请输入用户名称!' }] },
        phone: { rules: [{ validator: this.validatePhone }] },
        email: {
          rules: [{
            validator: this.validateEmail
          }]
        },
        roles: {},
        //  sex:{initialValue:((!this.model.sex)?"": (this.model.sex+""))}
        workNo: {
          rules: [
            { required: true, message: '请输入工号' },
            { validator: this.validateWorkNo }
          ]
        },
        telephone: {
          rules: [
            { pattern: /^0\d{2,3}-[1-9]\d{6,7}$/, message: '请输入正确的座机号码' }
          ]
        }
      },
      title: '操作',
      visible: false,
      model: {},
      roleList: [],
      selectedRole: [],
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      uploadLoading: false,
      confirmLoading: false,
      headers: {},
      form: this.$form.createForm(this),
      picUrl: '',
      url: {
        fileUpload: window._CONFIG['domianURL'] + '/sys/common/upload',
        imgerver: window._CONFIG['domianURL'] + '/sys/common/view',
        userWithDepart: '/sys/user/userDepartList', // 引入为指定用户查看部门信息需要的url
        userId: '/sys/user/generateUserId', // 引入生成添加用户情况下的url
        syncUserByUserName: '/process/extActProcess/doSyncUserByUserName'// 同步用户到工作流
      }
    }
  },
  computed: {
    uploadAction: function() {
      return this.url.fileUpload
    }
  },
  created() {
    const token = Vue.ls.get(ACCESS_TOKEN)
    this.headers = { 'X-Access-Token': token }
  },
  methods: {
    isDisabledAuth(code) {
      return disabledAuthFilter(code)
    },
    // 窗口最大化切换
    toggleScreen() {
      if (this.modaltoggleFlag) {
        this.modalWidth = window.innerWidth
      } else {
        this.modalWidth = 800
      }
      this.modaltoggleFlag = !this.modaltoggleFlag
    },
    initialRoleList() {
      queryall().then((res) => {
        if (res.success) {
          this.roleList = res.result
        } else {
          console.log(res.message)
        }
      })
    },
    loadUserRoles(userid) {
      queryUserRole({ userid: userid }).then((res) => {
        if (res.success) {
          this.selectedRole = res.result
        } else {
          console.log(res.message)
        }
      })
    },
    refresh() {
      this.selectedDepartKeys = []
      this.checkedDepartKeys = []
      this.checkedDepartNames = []
      this.checkedDepartNameString = ''
      this.userId = ''
    },
    add() {
      this.picUrl = ''
      this.refresh()
      this.edit({ activitiSync: '1' })
    },
    edit(record) {
      this.resetScreenSize() // 调用此方法,根据屏幕宽度自适应调整抽屉的宽度
      const that = this
      that.initialRoleList()
      that.checkedDepartNameString = ''
      that.form.resetFields()
      if (record.hasOwnProperty('id')) {
        that.loadUserRoles(record.id)
        this.picUrl = 'Has no pic url yet'
      }
      that.userId = record.id
      that.visible = true
      that.model = Object.assign({}, record)
      that.$nextTick(() => {
        that.form.setFieldsValue(pick(this.model, 'username', 'sex', 'realname', 'email', 'phone', 'activitiSync', 'workNo', 'telephone', 'post'))
      })
      // 调用查询用户对应的部门信息的方法
      that.checkedDepartKeys = []
      that.loadCheckedDeparts()
    },
    //
    loadCheckedDeparts() {
      const that = this
      if (!that.userId) { return }
      getAction(that.url.userWithDepart, { userId: that.userId }).then((res) => {
        that.checkedDepartNames = []
        if (res.success) {
          for (let i = 0; i < res.result.length; i++) {
            that.checkedDepartNames.push(res.result[i].title)
            this.checkedDepartNameString = this.checkedDepartNames.join(',')
            that.checkedDepartKeys.push(res.result[i].key)
          }
          that.userDepartModel.departIdList = that.checkedDepartKeys
        } else {
          console.log(res.message)
        }
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
      this.disableSubmit = false
      this.selectedRole = []
      this.userDepartModel = { userId: '', departIdList: [] }
      this.checkedDepartNames = []
      this.checkedDepartNameString = ''
      this.checkedDepartKeys = []
      this.selectedDepartKeys = []
    },
    moment,
    handleSubmit() {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true
          const avatar = that.model.avatar
          if (!values.birthday) {
            values.birthday = ''
          } else {
            values.birthday = values.birthday.format(this.dateFormat)
          }
          const formData = Object.assign(this.model, values)
          formData.avatar = avatar
          formData.selectedroles = this.selectedRole.length > 0 ? this.selectedRole.join(',') : ''
          formData.selecteddeparts = this.userDepartModel.departIdList.length > 0 ? this.userDepartModel.departIdList.join(',') : ''

          // that.addDepartsToUser(that,formData); // 调用根据当前用户添加部门信息的方法
          let obj
          if (!this.model.id) {
            formData.id = this.userId
            obj = addUser(formData)
          } else {
            obj = editUser(formData)
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
            that.checkedDepartNames = []
            that.userDepartModel.departIdList = { userId: '', departIdList: [] }

            that.close()
          })
        }
      })
    },
    handleCancel() {
      this.close()
    },
    validateToNextPassword(rule, value, callback) {
      const form = this.form
      const confirmpassword = form.getFieldValue('confirmpassword')

      if (value && confirmpassword && value !== confirmpassword) {
        callback('两次输入的密码不一样！')
      }
      if (value && this.confirmDirty) {
        form.validateFields(['confirm'], { force: true })
      }
      callback()
    },
    compareToFirstPassword(rule, value, callback) {
      const form = this.form
      if (value && value !== form.getFieldValue('password')) {
        callback('两次输入的密码不一样！')
      } else {
        callback()
      }
    },
    validatePhone(rule, value, callback) {
      if (!value) {
        callback()
      } else {
        // update-begin--Author:kangxiaolin  Date:20190826 for：[05] 手机号不支持199号码段--------------------
        if (new RegExp(/^1[3|4|5|7|8|9][0-9]\d{8}$/).test(value)) {
          // update-end--Author:kangxiaolin  Date:20190826 for：[05] 手机号不支持199号码段--------------------

          var params = {
            tableName: 'sys_user',
            fieldName: 'phone',
            fieldVal: value,
            dataId: this.userId
          }
          duplicateCheck(params).then((res) => {
            if (res.success) {
              callback()
            } else {
              callback('手机号已存在!')
            }
          })
        } else {
          callback('请输入正确格式的手机号码!')
        }
      }
    },
    validateEmail(rule, value, callback) {
      if (!value) {
        callback()
      } else {
        if (new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(value)) {
          var params = {
            tableName: 'sys_user',
            fieldName: 'email',
            fieldVal: value,
            dataId: this.userId
          }
          duplicateCheck(params).then((res) => {
            console.log(res)
            if (res.success) {
              callback()
            } else {
              callback('邮箱已存在!')
            }
          })
        } else {
          callback('请输入正确格式的邮箱!')
        }
      }
    },
    validateUsername(rule, value, callback) {
      var params = {
        tableName: 'sys_user',
        fieldName: 'username',
        fieldVal: value,
        dataId: this.userId
      }
      duplicateCheck(params).then((res) => {
        if (res.success) {
          callback()
        } else {
          callback('用户名已存在!')
        }
      })
    },
    validateWorkNo(rule, value, callback) {
      var params = {
        tableName: 'sys_user',
        fieldName: 'work_no',
        fieldVal: value,
        dataId: this.userId
      }
      duplicateCheck(params).then((res) => {
        if (res.success) {
          callback()
        } else {
          callback('工号已存在!')
        }
      })
    },
    handleConfirmBlur(e) {
      const value = e.target.value
      this.confirmDirty = this.confirmDirty || !!value
    },

    normFile(e) {
      console.log('Upload event:', e)
      if (Array.isArray(e)) {
        return e
      }
      return e && e.fileList
    },
    beforeUpload: function(file) {
      var fileType = file.type
      if (fileType.indexOf('image') < 0) {
        this.$message.warning('请上传图片')
        return false
      }
      // TODO 验证文件大小
    },
    handleChange(info) {
      this.picUrl = ''
      if (info.file.status === 'uploading') {
        this.uploadLoading = true
        return
      }
      if (info.file.status === 'done') {
        var response = info.file.response
        this.uploadLoading = false
        console.log(response)
        if (response.success) {
          this.model.avatar = response.message
          this.picUrl = 'Has no pic url yet'
        } else {
          this.$message.warning(response.message)
        }
      }
    },
    getAvatarView() {
      return this.url.imgerver + '/' + this.model.avatar
    },
    // 搜索用户对应的部门API
    onSearch() {
      this.$refs.departWindow.add(this.checkedDepartKeys, this.userId)
    },

    // 获取用户对应部门弹出框提交给返回的数据
    modalFormOk(formData) {
      this.checkedDepartNames = []
      this.selectedDepartKeys = []
      this.checkedDepartNameString = ''
      this.userId = formData.userId
      this.userDepartModel.userId = formData.userId
      for (let i = 0; i < formData.departIdList.length; i++) {
        this.selectedDepartKeys.push(formData.departIdList[i].key)
        this.checkedDepartNames.push(formData.departIdList[i].title)
        this.checkedDepartNameString = this.checkedDepartNames.join(',')
      }
      this.userDepartModel.departIdList = this.selectedDepartKeys
      this.checkedDepartKeys = this.selectedDepartKeys // 更新当前的选择keys
    },
    // 根据屏幕变化,设置抽屉尺寸
    resetScreenSize() {
      const screenWidth = document.body.clientWidth
      if (screenWidth < 500) {
        this.drawerWidth = screenWidth
      } else {
        this.drawerWidth = 700
      }
    }
  }
}
</script>

<style scoped>
  .avatar-uploader > .ant-upload {
    width:104px;
    height:104px;
  }
  .ant-upload-select-picture-card i {
    font-size: 49px;
    color: #999;
  }

  .ant-upload-select-picture-card .ant-upload-text {
    margin-top: 8px;
    color: #666;
  }

  .ant-table-tbody .ant-table-row td{
    padding-top:10px;
    padding-bottom:10px;
  }

  .drawer-bootom-button {
    position: absolute;
    bottom: -8px;
    width: 100%;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: right;
    left: 0;
    background: #fff;
    border-radius: 0 0 2px 2px;
  }
</style>
