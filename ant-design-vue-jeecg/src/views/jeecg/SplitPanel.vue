<template>
  <a-card>
    <a-button type="primary" icon="desktop" @click="splitPane">点我分屏</a-button>

    <split-panel-modal ref="splitPanelModal" />
  </a-card>
</template>

<script>
import SplitPanelModal from './modules/SplitPanelModal'

export default {
  name: 'SplitPanel',
  components: {
    SplitPanelModal
  },
  data() {
    return {
      description: '分屏'
    }
  },
  methods: {
    splitPane() {
      this.$refs.splitPanelModal.show()
    }
  }
}
</script>

<style scoped>

</style>
