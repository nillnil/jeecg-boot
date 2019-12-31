<template>
  <a-modal
    :title="title"
    :width="1200"
    :visible="visible"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
  >

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <!-- 主表单区域 -->
        <a-row class="form-row" :gutter="16">
          <a-col :lg="8">
            <a-form-item
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              label="订单号"
            >
              <a-input v-decorator="['orderCode', {rules: [{ required: true, message: '请输入订单号!' }]}]" placeholder="请输入订单号" />
            </a-form-item>
          </a-col>
          <a-col :lg="8">
            <a-form-item
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              label="订单类型"
            >
              <a-select v-decorator="['ctype',{}]" placeholder="请输入订单类型">
                <a-select-option value="1">国内订单</a-select-option>
                <a-select-option value="2">国际订单</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :lg="8">
            <a-form-item
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              label="订单日期"
            >
              <a-date-picker v-decorator="[ 'orderDate',{}]" show-time format="YYYY-MM-DD HH:mm:ss" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row class="form-row" :gutter="16">
          <a-col :lg="8">
            <a-form-item
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              label="订单金额"
            >
              <a-input-number v-decorator="[ 'orderMoney', {}]" style="width: 200px" />
            </a-form-item>
          </a-col>
          <a-col :lg="8">
            <a-form-item
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              label="订单备注"
            >
              <a-input v-decorator="['content', {}]" placeholder="请输入订单备注" />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 子表单区域 -->
        <a-tabs default-active-key="1">
          <a-tab-pane key="1" tab="客户信息">
            <div>
              <a-row type="flex" style="margin-bottom:10px" :gutter="16">
                <a-col :span="5">客户名</a-col>
                <a-col :span="5">性别</a-col>
                <a-col :span="5">身份证号码</a-col>
                <a-col :span="5">手机号</a-col>
                <a-col :span="4">操作</a-col>
              </a-row>

              <a-row v-for="(item, index) in orderMainModel.jeecgOrderCustomerList" :key="index" type="flex" style="margin-bottom:10px" :gutter="16">
                <a-col :span="5">
                  <a-form-item>
                    <a-input v-decorator="['jeecgOrderCustomerList['+index+'].name', {'initialValue':item.name,rules: [{ required: true, message: '请输入用户名!' }]}]" placeholder="客户名" />
                  </a-form-item>
                </a-col>
                <a-col :span="5">
                  <a-form-item>
                    <a-select v-decorator="['jeecgOrderCustomerList['+index+'].sex', {'initialValue':item.sex}]" placeholder="性别">
                      <a-select-option value="1">男</a-select-option>
                      <a-select-option value="2">女</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="5">
                  <a-form-item>
                    <a-input v-decorator="['jeecgOrderCustomerList['+index+'].idcard', {'initialValue':item.idcard,rules: [{ pattern: '^\\d{6}(18|19|20)?\\d{2}(0[1-9]|1[012])(0[1-9]|[12]\\d|3[01])\\d{3}(\\d|[xX])$', message: '身份证号格式不对!' }]}]" placeholder="身份证号" />
                  </a-form-item>
                </a-col>
                <a-col :span="5">
                  <a-form-item>
                    <a-input v-decorator="['jeecgOrderCustomerList['+index+'].telphone', {'initialValue':item.telphone,rules: [{ pattern: '^1(3|4|5|7|8)\\d{9}$', message: '手机号格式不对!' }]}]" placeholder="手机号" />
                  </a-form-item>
                </a-col>
                <a-col :span="4">
                  <a-form-item>
                    <a-button icon="plus" @click="addRowCustom" />&nbsp;
                    <a-button icon="minus" @click="delRowCustom(index)" />
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
          </a-tab-pane>

          <a-tab-pane key="2" tab="机票信息" force-render>
            <div>
              <a-row type="flex" style="margin-bottom:10px" :gutter="16">
                <a-col :span="6">航班号</a-col>
                <a-col :span="6">航班时间</a-col>
                <a-col :span="6">操作</a-col>
              </a-row>
              <a-row v-for="(item, index) in orderMainModel.jeecgOrderTicketList" :key="index" type="flex" style="margin-bottom:10px" :gutter="16">
                <a-col :span="6">
                  <a-form-item>
                    <a-input v-decorator="['jeecgOrderTicketList['+index+'].ticketCode', {'initialValue':item.ticketCode,rules: [{ required: true, message: '请输入航班号!' }]}]" placeholder="航班号" />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item>
                    <j-date v-decorator="['jeecgOrderTicketList['+index+'].tickectDate', {'initialValue':item.tickectDate}]" placeholder="航班时间" :trigger-change="true" />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item>
                    <a-button icon="plus" @click="addRowTicket" />&nbsp;
                    <a-button icon="minus" @click="delRowTicket(index)" />
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
          </a-tab-pane>
        </a-tabs>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { httpAction, getAction } from '@/api/manage'
import JDate from '@/components/jeecg/JDate'
import pick from 'lodash.pick'
import moment from 'moment'

export default {
  name: 'JeecgOrderMainModal',
  components: {
    JDate
  },
  data() {
    return {
      title: '操作',
      visible: false,
      orderMainModel: { jeecgOrderCustomerList: [{}],
        jeecgOrderTicketList: [{}] },
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
      validatorRules: {
      },
      url: {
        add: '/test/jeecgOrderMain/add',
        edit: '/test/jeecgOrderMain/edit',
        orderCustomerList: '/test/jeecgOrderMain/queryOrderCustomerListByMainId',
        orderTicketList: '/test/jeecgOrderMain/queryOrderTicketListByMainId'
      }
    }
  },
  created() {
  },
  methods: {
    add() {
      this.edit({})
    },
    edit(record) {
      this.form.resetFields()
      this.orderMainModel = Object.assign({}, record)
      this.orderMainModel.jeecgOrderCustomerList = [{}]
      this.orderMainModel.jeecgOrderTicketList = [{}]
      // --------------------------------------------------------
      // 初始化明细表数据
      console.log(this.orderMainModel.id)
      if (this.orderMainModel.id) {
        const params = { id: this.orderMainModel.id }
        // 初始化订单机票列表
        getAction(this.url.orderCustomerList, params).then((res) => {
          if (res.success) {
            this.orderMainModel.jeecgOrderCustomerList = res.result
            this.$forceUpdate()
          }
        })
        // 初始化订单客户列表
        getAction(this.url.orderTicketList, params).then((res) => {
          if (res.success) {
            this.orderMainModel.jeecgOrderTicketList = res.result
            this.$forceUpdate()
          }
        })
      }
      // --------------------------------------------------------
      this.visible = true
      this.$nextTick(() => {
        this.form.setFieldsValue(pick(this.orderMainModel, 'orderCode', 'ctype', 'orderMoney', 'content'))
        this.form.setFieldsValue({ orderDate: this.orderMainModel.orderDate ? moment(this.orderMainModel.orderDate) : null }) // 时间格式化
      })
      console.log(this.orderMainModel)
    },
    close() {
      this.$emit('close')
      this.visible = false
    },
    handleOk() {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true
          let httpurl = ''
          let method = ''
          if (!this.orderMainModel.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'put'
          }
          const orderMainData = Object.assign(this.orderMainModel, values)
          // 时间格式化
          orderMainData.orderDate = orderMainData.orderDate ? orderMainData.orderDate.format('YYYY-MM-DD HH:mm:ss') : null
          const formData = {
            ...orderMainData,
            jeecgOrderCustomerList: orderMainData.jeecgOrderCustomerList,
            jeecgOrderTicketList: orderMainData.jeecgOrderTicketList
          }

          console.log(formData)
          httpAction(httpurl, formData, method).then((res) => {
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
    addRowCustom() {
      this.orderMainModel.jeecgOrderCustomerList.push({})
      this.$forceUpdate()
    },
    delRowCustom(index) {
      console.log(index)
      this.orderMainModel.jeecgOrderCustomerList.splice(index, 1)
      this.$forceUpdate()
    },
    addRowTicket() {
      this.orderMainModel.jeecgOrderTicketList.push({})
      console.log(this.orderMainModel.jeecgOrderTicketList)
      this.$forceUpdate()
    },
    delRowTicket(index) {
      console.log(index)
      this.orderMainModel.jeecgOrderTicketList.splice(index, 1)
      this.$forceUpdate()
    }

  }
}
</script>

<style scoped>
  .ant-btn {
    padding: 0 10px;
    margin-left: 3px;
  }
  .ant-form-item-control {
    line-height: 0px;
  }
  /** 主表单行间距 */
  .ant-form .ant-form-item {
    margin-bottom: 10px;
  }
  /** Tab页面行间距 */
  .ant-tabs-content .ant-form-item {
    margin-bottom: 0px;
  }
</style>
