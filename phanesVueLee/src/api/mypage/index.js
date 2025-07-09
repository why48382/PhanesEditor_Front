import api from "@/plugins/axiosinterceptor"

// 벡엔드 호출 후 받은 데이터를 반환

const userMypage = async () => {
    let data = {};
    let url = 'api/v1/user/usr_mypage.json'

    await api.get(url)
    .then((res)=>{
        data = res.data;
    })
    .catch((error) => {
        data = error.data;
    })
    return data;
}

export default {userMypage}