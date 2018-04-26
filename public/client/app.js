import Vue from 'vue'
// import axios from 'axios'
// import VueAxios from 'vue-axios'
import NProgress from 'vue-nprogress'
import { sync } from 'vuex-router-sync'
import App from './App.vue'
import router from './router'
import store from './store'
import * as filters from './filters'
import { TOGGLE_SIDEBAR } from 'vuex-store/mutation-types'
import firebase from 'firebase'

// Initialize Firebase
var config = {
  apiKey: 'AIzaSyD1dMikwRs3r2zekf4NfYhGmVb-LOv5go4',
  authDomain: 'sweetpotatoserver.firebaseapp.com',
  databaseURL: 'https://sweetpotatoserver.firebaseio.com',
  projectId: 'sweetpotatoserver',
  storageBucket: 'sweetpotatoserver.appspot.com',
  messagingSenderId: '245564452578'
}
firebase.initializeApp(config)

Vue.router = router
Vue.use(NProgress)

// Enable devtools
Vue.config.devtools = true

sync(store, router)

const nprogress = new NProgress({ parent: '.nprogress-container' })

const { state } = store

router.beforeEach((route, redirect, next) => {
  if (state.app.device.isMobile && state.app.sidebar.opened) {
    store.commit(TOGGLE_SIDEBAR, false)
  }

  let requiresAuth = route.matched.some(record => record.meta.requiresAuth)
  let currentUser = firebase.auth().currentUser
  if (requiresAuth) {
    if (!currentUser) {
      next({
        path: '/signin',
        query: { redirect: route.fullPath }
      })
      return
    }
  }
  next()
})

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

const app = new Vue({
  router,
  store,
  nprogress,
  ...App
})

export { app, router, store }
