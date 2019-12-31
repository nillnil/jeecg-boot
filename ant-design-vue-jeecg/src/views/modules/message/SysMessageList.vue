<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="消息标题">
              <a-input v-model="queryParam.esTitle" placeholder="请输入消息标题" />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="发送内容">
              <a-input v-model="queryParam.esContent" placeholder="请输入发送内容" />
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="接收人">
                <a-input v-model="queryParam.esReceiver" placeholder="请输入接收人" />
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" icon="search" @click="searchQuery">查询</a-button>
              <a-button type="primary" icon="reload" style="margin-left: 8px" @click="searchReset">重置</a-button>
              <a style="margin-left: 8px" @click="handleToggleSearch">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
              </a>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button v-show="show" type="primary" icon="plus" @click="handleAdd">新增</a-button>
      <a-button v-show="show" type="primary" icon="download" @click="handleExportXls('消息')">导出</a-button>
      <a-upload
        v-show="show"
        name="file"
        :show-upload-list="false"
        :multiple="false"
        :headers="tokenHeader"
        :action="importExcelUrl"
        @change="handleImportExcel"
      >
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel">
            <a-icon type="delete" />
            删除
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon" /> 已选择 <a style="font-weight: 600">{{
          selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        bordered
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :row-selection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange"
      >

        <!-- 字符串超长截取省略号显示-->
        <span slot="esContent" slot-scope="text">
          <j-ellipsis :value="text" :length="10" />
        </span>

        <span slot="action" slot-scope="text, record">
          <a href="javascript:;" @click="handleDetail(record)">详情</a>
          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多<a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item v-show="show">
                <a @click="handleEdit(record)">编辑</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <sysMessage-modal ref="modalForm" @ok="modalFormOk" />
  </a-card>
</template>

<script>
import SysMessageModal from './modules/SysMessageModal'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import JEllipsis from '@/components/jeecg/JEllipsis'

export default {
  name: 'SysMessageList',
  components: {
    JEllipsis,
    SysMessageModal
  },
  mixins: [JeecgListMixin],
  data() {
    return {
      description: '消息管理页面',
      // 新增修改按钮是否显示
      show: false,
      // 表头
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function(t, r, index) {
            return parseInt(index) + 1
          }
        },
        {
          title: '消息标题',
          align: 'center',
          dataIndex: 'esTitle'
        },
        {
          title: '发送内容',
          align: 'center',
          dataIndex: 'esContent',
          scopedSlots: { customRender: 'esContent' }
        },
        {
          title: '接收人',
          align: 'center',
          dataIndex: 'esReceiver'
        },
        {
          title: '发送次数',
          align: 'center',
          dataIndex: 'esSendNum'
        },
        {
          title: '发送状态',
          align: 'center',
          dataIndex: 'esSendStatus_dictText'
        },
        {
          title: '发送时间',
          align: 'center',
          dataIndex: 'esSendTime'
        },
        {
          title: '发送方式',
          align: 'center',
          dataIndex: 'esType_dictText'
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          scopedSlots: { customRender: 'action' }
        }
      ],
      url: {
        list: '/message/sysMessage/list',
        delete: '/message/sysMessage/delete',
        deleteBatch: '/message/sysMessage/deleteBatch',
        exportXlsUrl: 'message/sysMessage/exportXls',
        importExcelUrl: 'message/sysMessage/importExcel'
      }
    }
  },
  computed: {
    importExcelUrl: function() {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    }
  },
  methods: {}
}
</script>
<style lang="less" scoped>
  /** Button按钮间距 */
  .ant-btn {
    margin-left: 3px
  }

  .ant-card-body .table-operator {
    margin-bottom: 18px;
  }

  .ant-table-tbody .ant-table-row td {
    padding-top: 15px;
    padding-bottom: 15px;
  }

  .anty-row-operator button {
    margin: 0 5px
  }

  .ant-btn-danger {
    background-color: #ffffff
  }

  .ant-modal-cust-warp {
    height: 100%
  }

  .ant-modal-cust-warp .ant-modal-body {
    height: calc(100% - 110px) !important;
    overflow-y: auto
  }

  .ant-modal-cust-warp .ant-modal-content {
    height: 90% !important;
    overflow-y: hidden
  }
</style>
