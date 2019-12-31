<template>
  <div>
    <a-form style="margin: 40px auto 0;">
      <result title="更改密码成功" :is-success="true">
        <div class="toLogin">
          <h3>将在<span>{{ time }}</span>秒后返回登录页面.</h3>
        </div>
      </result>

    </a-form>
  </div>
</template>

<script>
import Result from '@/views/result/Result'
export default {
  name: 'Step4',
  components: {
    Result
  },
  props: ['userList'],
  data() {
    return {
      loading: false,
      time: 0
    }
  },
  watch: {
    time: function(newVal, oldVal) {
      if (newVal === 0) {
        var params = {
          username: this.userList.username
        }
        this.$router.push({ name: 'login', params })
      }
    }
  },
  mounted() {
    const that = this
    that.time = 5
    setInterval(that.countDown, 1000)
  },
  methods: {
    countDown() {
      const that = this
      that.time--
    }
  }
}
</script>
<style scoped>
  .toLogin{
    text-align: center;
  }
</style>
