import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    timeout: 5000,
    withCredentials: true
})

api.interceptors.request.use(
    (config) => {
        console.log("요청 URL:", config.baseURL + config.url);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log("응답을 받기 전 실행");
        return response;
    },
    (error) => {
        console.log("응답 받을 때 에러 처리");

        if (error.response && error.response.status === 401) {
            localStorage.removeItem('@PhanesEditor:store');
            window.location.reload();
        }

        return Promise.reject(error);
    }
);

export default api;