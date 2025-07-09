import { defineStore } from "pinia";
import { reactive } from "vue";

const useUserStore = defineStore('count', () => {
    const userObj = reactive({
        nickname: '',
        email: ''
    });

    return { userObj }
}

);

export default useUserStore