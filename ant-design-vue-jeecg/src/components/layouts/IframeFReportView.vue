<template>

  <iframe :id="id" :src="url" frameborder="0" width="100%" height="800px" scrolling="auto" style="background-color: #fff;" />

</template>

<script>
import PageLayout from '../page/PageLayout'
import RouteView from './RouteView'

export default {
  name: 'IframePageContent',
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
        // window.open(this.url);
      }
    }
  }
}
</script>

<style>
</style>
