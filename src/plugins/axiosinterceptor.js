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

        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                localStorage.removeItem('@PhanesEditor:store');
                window.location.href = '/error?reason=unauthorized';
            } else if (status >= 500) {
                window.location.href = '/error?reason=server';
            } else if (status === 404) {
                window.location.href = '/error?reason=notfound';
            }
        } else {
            // 서버 자체에 연결이 안 된 경우 (네트워크 끊김, 서버 다운 등)
            window.location.href = '/error?reason=network';
        }

        return Promise.reject(error);
    }
);

export default api;