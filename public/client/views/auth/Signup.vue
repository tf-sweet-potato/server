<template>
<div class="content has-text-centered">
  <h1 class="is-title is-bold">Sign Up</h1>

  <div class="columns is-vcentered">
    <div class="column is-6 is-offset-3">
      <div class="box">
        <div v-show="error" style="color:red; word-wrap:break-word;">{{ error }}</div>
        <form v-on:submit.prevent="signup">
          <label class="label">Email</label>
          <p class="control">
            <input v-model="data.body.username" class="input" type="text" placeholder="email@example.org">
          </p>
          <label class="label">Password</label>
          <p class="control">
            <input v-model="data.body.password" class="input" type="password" placeholder="password">
          </p>

          <p class="control">
            <label class="checkbox">
              <input type="checkbox" v-model="data.rememberMe">
              Remember me
            </label>
          </p>

          <hr>
          <p class="control">
            <button type="submit" class="button is-primary">Sign Up</button>
            <button class="button is-default">Cancel</button>
          </p>
        </form>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import firebase from 'firebase'
export default {

  data () {
    return {
      data: {
        body: {
          username: null,
          password: null
        },
        rememberMe: false
      },
      error: null
    }
  },
  mounted () {

  },
  methods: {
    signup () {
      firebase.auth().createUserWithEmailAndPassword(this.data.body.username, this.data.body.password)
      .then(user => {
        console.log('createUser Success')
        this.$router.push('/dashboard')
      })
      .catch(error => {
        this.error = error.message
      })
    }
  }

}
</script>

<style lang="scss" scoped>
.is-title {
    text-transform: capitalize;
}
</style>
