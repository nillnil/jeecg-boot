<template>

  <iframe :id="id" :src="url" frameborder="0" width="100%" height="800px" scrolling="auto" />

</template>

<script>

export default {
  name: 'IframePageContent',
  inject: ['closeCurrent'],
  data() {
    return {
      url: '',
      id: ''
    }
  },
  watch: {
    $route(to, from) {
      this.goUrl()
    }
  },
  created() {
    this.goUrl()
  },
  updated() {
    this.goUrl()
  },
  methods: {
    goUrl() {
      const url = this.$route.meta.url
      const id = this.$route.path
      this.id = id
      // url = "http://www.baidu.com"
      console.log('------url------' + url)
      if (url !== null && url !== undefined) {
        this.url = url
        /* update_begin author:wuxianquan date:20190908 for:判断打开方式，新窗口打开时this.$route.meta.internalOrExternal==true */
        if (this.$route.meta.internalOrExternal != undefined && this.$route.meta.internalOrExternal == true) {
          this.closeCurrent()
          window.open(this.url)
        }
        /* update_end author:wuxianquan date:20190908 for:判断打开方式，新窗口打开时this.$route.meta.internalOrExternal==true */
      }
    }
  }
}
</script>

<style>
</style>
