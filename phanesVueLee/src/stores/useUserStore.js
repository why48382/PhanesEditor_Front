import { defineStore } from "pinia";
import { reactive } from "vue";
import { EncryptStorage } from 'encrypt-storage'

const encryptStorage = new EncryptStorage("secret-key-production", { prefix: '@PhanesEditor' })


const useUserStore = defineStore('count', () => {
    const userObj = reactive({
        nickname: '',
        email: ''
    });

    const setWithExpiry = (mode, key, results, ttl) => {
        const now = new Date()

        let item = {}

        if (mode === 'LOGIN') {
            item = {
                userIdx: results.idx,
                userEmail: results.email,
                userName: results.nickname
            }
        } else if (mode === 'LXTS') {
            item = getWithExpiry('store')
        }

        item.expiry = now.getTime() + Number(ttl) + Number(60000)

        encryptStorage.setItem(key, JSON.stringify(item))
    }

    const getWithExpiry = (key) => {
        const itemStr = encryptStorage.getItem(key)

        if (!itemStr) {
            return null
        }

        const item = itemStr
        const now = new Date()

        if (now.getTime() > Number(item.expiry)) {
            encryptStorage.removeItem(key)
            return null
        }

        return item
    }

    const loginCheck = () => {
        return getWithExpiry('store') !== null
    }

    const login = (data) => {
        setWithExpiry('LOGIN', 'store', data, 86400000)
    }

    return { userObj, loginCheck, login }
}

);

export default useUserStore