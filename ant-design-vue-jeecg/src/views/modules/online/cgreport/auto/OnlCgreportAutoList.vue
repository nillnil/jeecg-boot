<template>
  <a-card :bordered="false" style="height: 100%">

    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row v-if="queryInfo && queryInfo.length>0" :gutter="24">
          <template v-for="(item,index) in queryInfo">
            <template v-if=" item.hidden==='1' ">
              <a-col v-if="item.view.indexOf('Date')>=0" v-show="toggleSearchStatus" :key=" 'query'+index " :md="12" :sm="16">
                <onl-cgreport-query-form-item :query-param="queryParam" :item="item" :dict-options="dictOptions" />
              </a-col>
              <a-col v-else v-show="toggleSearchStatus" :key=" 'query'+index " :md="6" :sm="8">
                <onl-cgreport-query-form-item :query-param="queryParam" :item="item" :dict-options="dictOptions" />
              </a-col>
            </template>
            <template v-else>
              <a-col v-if="item.view.indexOf('Date')>=0" :key=" 'query'+index " :md="12" :sm="16">
                <onl-cgreport-query-form-item :query-param="queryParam" :item="item" :dict-options="dictOptions" />
              </a-col>
              <a-col v-else :key=" 'query'+index " :md="6" :sm="8">
                <onl-cgreport-query-form-item :query-param="queryParam" :item="item" :dict-options="dictOptions" />
              </a-col>
            </template>
          </template>

          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" icon="search" @click="searchByQuery">查询</a-button>
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

    <div class="table-operator" style="margin-bottom: 10px">
      <a-button type="primary" icon="plus" @click="exportExcel">导出</a-button>
    </div>

    <a-table
      ref="table"
      size="middle"
      bordered
      row-key="id"
      :columns="table.columns"
      :data-source="table.dataSource"
      :pagination="table.pagination"
      :loading="table.loading"
      :scroll="table.scroll"
      :row-selection="{fixed:true, selectedRowKeys: table.selectedRowKeys, onChange: handleChangeInTableSelect}"
      style="min-height: 300px"
      @change="handleChangeInTable"
    />

  </a-card>
</template>

<script>
import { getAction, downFile } from '@/api/manage'
import { filterMultiDictText } from '@/components/dict/JDictSelectUtil'
import { filterObj } from '@/utils/util'

export default {
  name: 'OnlCgreportAutoList',
  components: {
  },
  data() {
    return {
      // 查询参数
      queryInfo: [],
      // 查询参数，多个页面的查询参数用 code 作为键来区分
      queryParamsMap: {},
      selfParam: {
      },
      sorter: {
        column: '',
        order: 'desc'
      },
      dictOptions: {},
      toggleSearchStatus: false, // 高级搜索 展开/关闭
      reportCode: '',
      description: '在线报表功能测试页面',
      url: {
        getColumns: '/online/cgreport/api/getColumns/',
        getData: '/online/cgreport/api/getData/',
        getQueryInfo: '/online/cgreport/api/getQueryInfo/',
        getParamsInfo: '/online/cgreport/api/getParamsInfo/'
      },
      table: {
        loading: true,
        // 表头
        columns: [],
        // 数据集
        dataSource: [],
        // 选择器
        selectedRowKeys: [],
        selectionRows: [],
        scroll: { x: false },
        // 分页参数
        pagination: {
          current: 1,
          pageSize: 10,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total, range) => {
            return range[0] + '-' + range[1] + ' 共' + total + '条'
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0
        }
      },
      cgreportHeadName: ''
    }
  },
  computed: {
    queryParam: {
      get() {
        return this.queryParamsMap[this.reportCode]
      },
      set(newVal) {
        this.$set(this.queryParamsMap, this.reportCode, newVal)
      }
    }
  },
  watch: {
    '$route'() {
      // 刷新参数放到这里去触发，就可以刷新相同界面了
      this.initParamsInfo()
      this.initQueryInfo()
    }
  },
  mounted() {
    this.initParamsInfo()
    this.initQueryInfo()
  },
  methods: {
    initParamsInfo() {
      if (!this.$route.params.code) {
        return false
      }
      // 获取报表ID
      this.reportCode = this.$route.params.code
      if (!this.queryParam) {
        this.queryParam = {}
      }

      this.selfParam = {}
      getAction(`${this.url.getParamsInfo}${this.$route.params.code}`).then((res) => {
        if (res.success) {
          if (res.result && res.result.length > 0) {
            for (const i of res.result) {
              this.selfParam['self_' + i.paramName] = (!this.$route.query[i.paramName]) ? '' : this.$route.query[i.paramName]
            }
          }
        } else {
          this.$message.warning(res.message)
        }
        this.loadData()
      })
    },
    initQueryInfo() {
      if (!this.$route.params.code) {
        return false
      }
      getAction(`${this.url.getQueryInfo}${this.$route.params.code}`).then((res) => {
        console.log('获取查询条件', res)
        if (res.success) {
          this.queryInfo = res.result
        } else {
          this.$message.warning(res.message)
        }
      })
    },
    loadData(arg) {
      if (!this.$route.params.code) {
        return false
      }
      if (arg == 1) {
        this.table.pagination.current = 1
      }
      const params = this.getQueryParams()// 查询条件
      console.log(params)

      console.log(' 动态报表 reportCode ： ' + this.reportCode)
      this.table.loading = true
      Promise.all([
        getAction(`${this.url.getColumns}${this.reportCode}`),
        getAction(`${this.url.getData}${this.reportCode}`, params)
      ]).then(results => {
        const [{ result: { columns, cgreportHeadName, dictOptions }}, { result: data }] = results
        const columnWidth = 230
        this.dictOptions = dictOptions
        for (let a = 0; a < columns.length; a++) {
          if (columns[a].customRender) {
            const field_name = columns[a].customRender
            columns[a].customRender = (text) => {
              if (!text) {
                return ''
              } else {
                return filterMultiDictText(this.dictOptions[field_name], text + '')
              }
            }
          }
          columns.width = columnWidth
        }
        this.table.scroll.x = columns.length * columnWidth
        this.table.columns = [...columns]
        this.cgreportHeadName = cgreportHeadName
        if (data) {
          this.table.pagination.total = Number(data.total)
          this.table.dataSource = data.records
        } else {
          this.table.pagination.total = 0
          this.table.dataSource = []
        }
      }).catch((e) => {
        console.error(e)
        this.$message.error('查询失败')
      }).then(() => {
        this.table.loading = false
      })
    },
    getQueryParams() {
      const param = Object.assign({}, this.queryParam, this.sorter, this.selfParam)
      param.pageNo = this.table.pagination.current
      param.pageSize = this.table.pagination.pageSize
      return filterObj(param)
    },
    searchByQuery() {
      this.loadData(1)
    },
    searchReset() {
      this.queryParam = {}
      this.loadData(1)
    },
    handleToggleSearch() {
      this.toggleSearchStatus = !this.toggleSearchStatus
    },
    exportExcel() {
      const fileName = this.cgreportHeadName
      downFile(`/online/cgreport/api/exportXls/${this.reportCode}`, this.queryParam).then((data) => {
        if (!data) {
          this.$message.warning('文件下载失败')
          return
        }
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          window.navigator.msSaveBlob(new Blob([data]), fileName + '.xls')
        } else {
          const url = window.URL.createObjectURL(new Blob([data]))
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.setAttribute('download', fileName + '.xls')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link) // 下载完成移除元素
          window.URL.revokeObjectURL(url) // 释放掉blob对象
        }
      })
    },
    handleChangeInTableSelect(selectedRowKeys, selectionRows) {
      this.table.selectedRowKeys = selectedRowKeys
      this.table.selectionRows = selectionRows
    },
    handleChangeInTable(pagination, filters, sorter) {
      // 分页、排序、筛选变化时触发
      if (Object.keys(sorter).length > 0) {
        this.sorter.column = sorter.field
        this.sorter.order = sorter.order == 'ascend' ? 'asc' : 'desc'
      }
      this.table.pagination = pagination
      this.loadData()
    }

  }
}
</script>
<style scoped>
  .div {
    display: flex;
    align-items: center;
    height: 500px
  }

</style>
