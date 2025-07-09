import "./assets/main.css"

import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/api/firebase/firebase_config'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const firebaseApp = initializeApp(firebaseConfig);
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
