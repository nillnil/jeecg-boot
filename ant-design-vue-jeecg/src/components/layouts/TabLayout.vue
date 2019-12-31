<template>
  <global-layout @dynamicRouterShow="dynamicRouterShow">
    <!-- update-begin- author:sunjianlei --- date:20191009 --- for: 提升右键菜单的层级 -->
    <contextmenu :item-list="menuItemList" :visible.sync="menuVisible" style="z-index: 9999;" @select="onMenuSelect" />
    <!-- update-end- author:sunjianlei --- date:20191009 --- for: 提升右键菜单的层级 -->
    <a-tabs
      v-if="multipage"
      :active-key="activePage"
      class="tab-layout-tabs"
      style="height:52px"
      :hide-add="true"
      type="editable-card"
      @contextmenu.native="e => onContextmenu(e)"
      @change="changePage"
      @tabClick="tabCallBack"
      @edit="editPage"
    >
      <a-tab-pane v-for="page in pageList" :id="page.fullPath" :key="page.fullPath">
        <span slot="tab" :pagekey="page.fullPath">{{ page.meta.title }}</span>
      </a-tab-pane>
    </a-tabs>
    <div style="margin: 12px 12px 0;">
      <transition name="page-toggle">
        <keep-alive v-if="multipage">
          <router-view v-if="reloadFlag" />
        </keep-alive>
        <template v-else>
          <router-view v-if="reloadFlag" />
        </template>
      </transition>
    </div>
  </global-layout>
</template>

<script>
import GlobalLayout from '@/components/page/GlobalLayout'
import Contextmenu from '@/components/menu/Contextmenu'
import { mixin, mixinDevice } from '@/utils/mixin.js'
import { triggerWindowResizeEvent } from '@/utils/util'

const indexKey = '/dashboard/analysis'

export default {
  name: 'TabLayout',
  components: {
    GlobalLayout,
    Contextmenu
  },
  mixins: [mixin, mixinDevice],
  data() {
    return {
      pageList: [],
      linkList: [],
      activePage: '',
      menuVisible: false,
      menuItemList: [
        { key: '4', icon: 'reload', text: '刷 新' },
        { key: '1', icon: 'arrow-left', text: '关闭左侧' },
        { key: '2', icon: 'arrow-right', text: '关闭右侧' },
        { key: '3', icon: 'close', text: '关闭其它' }
      ],
      reloadFlag: true
    }
  },
  /* update_begin author:wuxianquan date:20190828 for: 关闭当前tab页，供子页面调用 ->望菜单能配置外链，直接弹出新页面而不是嵌入iframe #428 */
  provide() {
    return {
      closeCurrent: this.closeCurrent
    }
  },
  /* update_end author:wuxianquan date:20190828 for: 关闭当前tab页，供子页面调用->望菜单能配置外链，直接弹出新页面而不是嵌入iframe #428 */
  computed: {
    multipage() {
      // 判断如果是手机模式，自动切换为单页面模式
      if (this.isMobile()) {
        return false
      } else {
        return this.$store.state.app.multipage
      }
    }
  },
  watch: {
    '$route': function(newRoute) {
      this.activePage = newRoute.fullPath
      if (!this.multipage) {
        this.linkList = [newRoute.fullPath]
        this.pageList = [Object.assign({}, newRoute)]
      } else if (this.linkList.indexOf(newRoute.fullPath) < 0) {
        this.linkList.push(newRoute.fullPath)
        this.pageList.push(Object.assign({}, newRoute))
      } else if (this.linkList.indexOf(newRoute.fullPath) >= 0) {
        const oldIndex = this.linkList.indexOf(newRoute.fullPath)
        const oldPositionRoute = this.pageList[oldIndex]
        this.pageList.splice(oldIndex, 1, Object.assign({}, newRoute, { meta: oldPositionRoute.meta }))
      }
    },
    'activePage': function(key) {
      const index = this.linkList.lastIndexOf(key)
      const waitRouter = this.pageList[index]
      this.$router.push(Object.assign({}, waitRouter))
    },
    'multipage': function(newVal) {
      if (this.reloadFlag) {
        if (!newVal) {
          this.linkList = [this.$route.fullPath]
          this.pageList = [this.$route]
        }
      }
    }
  },
  created() {
    if (this.$route.path != indexKey) {
      this.pageList.push({
        name: 'dashboard-analysis',
        path: indexKey,
        fullPath: indexKey,
        meta: {
          icon: 'dashboard',
          title: '首页'
        }
      })
      this.linkList.push(indexKey)
    }
    this.pageList.push(this.$route)
    this.linkList.push(this.$route.fullPath)
    this.activePage = this.$route.fullPath
  },
  methods: {
    changePage(key) {
      this.activePage = key
    },
    tabCallBack() {
      this.$nextTick(() => {
        triggerWindowResizeEvent()
      })
    },
    editPage(key, action) {
      this[action](key)
    },
    remove(key) {
      if (key == indexKey) {
        this.$message.warning('首页不能关闭!')
        return
      }
      if (this.pageList.length === 1) {
        this.$message.warning('这是最后一页，不能再关闭了啦')
        return
      }
      this.pageList = this.pageList.filter(item => item.fullPath !== key)
      let index = this.linkList.indexOf(key)
      this.linkList = this.linkList.filter(item => item !== key)
      index = index >= this.linkList.length ? this.linkList.length - 1 : index
      this.activePage = this.linkList[index]
    },
    onContextmenu(e) {
      const pagekey = this.getPageKey(e.target)
      if (pagekey !== null) {
        e.preventDefault()
        this.menuVisible = true
      }
    },
    getPageKey(target, depth) {
      depth = depth || 0
      if (depth > 2) {
        return null
      }
      let pageKey = target.getAttribute('pagekey')
      pageKey = pageKey || (target.previousElementSibling ? target.previousElementSibling.getAttribute('pagekey') : null)
      return pageKey || (target.firstElementChild ? this.getPageKey(target.firstElementChild, ++depth) : null)
    },
    onMenuSelect(key, target) {
      const pageKey = this.getPageKey(target)
      switch (key) {
        case '1':
          this.closeLeft(pageKey)
          break
        case '2':
          this.closeRight(pageKey)
          break
        case '3':
          this.closeOthers(pageKey)
          break
        case '4':
          this.routeReload()
          break
        default:
          break
      }
    },
    /* update_begin author:wuxianquan date:20190828 for: 关闭当前tab页，供子页面调用->望菜单能配置外链，直接弹出新页面而不是嵌入iframe #428 */
    closeCurrent() {
      this.remove(this.activePage)
    },
    /* update_end author:wuxianquan date:20190828 for: 关闭当前tab页，供子页面调用->望菜单能配置外链，直接弹出新页面而不是嵌入iframe #428 */
    closeOthers(pageKey) {
      const index = this.linkList.indexOf(pageKey)
      if (pageKey == indexKey || pageKey.indexOf('?ticke=') >= 0) {
        this.linkList = this.linkList.slice(index, index + 1)
        this.pageList = this.pageList.slice(index, index + 1)
        this.activePage = this.linkList[0]
      } else {
        const indexContent = this.pageList.slice(0, 1)[0]
        this.linkList = this.linkList.slice(index, index + 1)
        this.pageList = this.pageList.slice(index, index + 1)
        this.linkList.unshift(indexContent.fullPath)
        this.pageList.unshift(indexContent)
        this.activePage = this.linkList[1]
      }
    },
    closeLeft(pageKey) {
      if (pageKey == indexKey) {
        return
      }
      const tempList = [...this.pageList]
      const indexContent = tempList.slice(0, 1)[0]
      const index = this.linkList.indexOf(pageKey)
      this.linkList = this.linkList.slice(index)
      this.pageList = this.pageList.slice(index)
      this.linkList.unshift(indexContent.fullPath)
      this.pageList.unshift(indexContent)
      if (this.linkList.indexOf(this.activePage) < 0) {
        this.activePage = this.linkList[0]
      }
    },
    closeRight(pageKey) {
      const index = this.linkList.indexOf(pageKey)
      this.linkList = this.linkList.slice(0, index + 1)
      this.pageList = this.pageList.slice(0, index + 1)
      if (this.linkList.indexOf(this.activePage < 0)) {
        this.activePage = this.linkList[this.linkList.length - 1]
      }
    },
    // update-begin-author:taoyan date:20190430 for:动态路由title显示配置的菜单title而不是其对应路由的title
    dynamicRouterShow(key, title) {
      const keyIndex = this.linkList.indexOf(key)
      if (keyIndex >= 0) {
        const currRouter = this.pageList[keyIndex]
        const meta = Object.assign({}, currRouter.meta, { title: title })
        this.pageList.splice(keyIndex, 1, Object.assign({}, currRouter, { meta: meta }))
      }
    },
    // update-end-author:taoyan date:20190430 for:动态路由title显示配置的菜单title而不是其对应路由的title

    // update-begin-author:taoyan date:20191008 for:路由刷新
    routeReload() {
      this.reloadFlag = false
      const ToggleMultipage = 'ToggleMultipage'
      this.$store.dispatch(ToggleMultipage, false)
      this.$nextTick(() => {
        this.$store.dispatch(ToggleMultipage, true)
        this.reloadFlag = true
      })
    }
    // update-end-author:taoyan date:20191008 for:路由刷新
  }
}
</script>

<style lang="less">

  /*
 * The following styles are auto-applied to elements with
 * transition="page-transition" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the page transition by editing
 * these styles.
 */

  .page-transition-enter {
    opacity: 0;
  }

  .page-transition-leave-active {
    opacity: 0;
  }

  .page-transition-enter .page-transition-container,
  .page-transition-leave-active .page-transition-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }

  /*美化弹出Tab样式*/
  .ant-tabs-nav-container {
    margin-top: 4px;
  }

  /* 修改 ant-tabs 样式 */
  .tab-layout-tabs.ant-tabs {
    border-bottom: 1px solid #ccc;
    border-left: 1px solid #ccc;
    background-color: white;
    padding: 0 20px;

    .ant-tabs-bar {
      margin: 4px 0 0;
      border: none;
    }

  }

  .ant-tabs {

    &.ant-tabs-card .ant-tabs-tab {

      padding: 0 24px !important;
      background-color: white !important;
      margin-right: 10px !important;

      .ant-tabs-close-x {
        width: 12px !important;
        height: 12px !important;
        opacity: 0 !important;
        cursor: pointer !important;
        font-size: 12px !important;
        margin: 0 !important;
        position: absolute;
        top: 36%;
        right: 6px;
      }

      &:hover .ant-tabs-close-x {
        opacity: 1 !important;
      }

    }

  }

  .ant-tabs.ant-tabs-card > .ant-tabs-bar {
    .ant-tabs-tab {
      border: none !important;
      border-bottom: 1px solid transparent !important;
    }
    .ant-tabs-tab-active {
      border-color: @primary-color!important;
    }
  }

</style>
