import api from "@/plugins/axiosinterceptor";

const userSignUp = async (req) => {
    let data = {};
    let url = '/user/signup';

    await api.post(url, req)
        .then((res) => {
            data = res.data;
        })
        .catch((error) => {
            data = error.data;
        });

    return data;
}


const userSignIn = async (req) => {
    let data = {};
    let url = '/api/v1/login';

    await api.post(url, req)
        .then((res) => {
            data = res.data;
        })
        .catch((error) => {
            data = error.data;
        });

    return data;
}

const logOut = async () => {
    let data = {};
    let url = '/api/v1/user/usr_logout.json';

    await api.get(url)
        .then((res) => {
            data = res.data;
        })
        .catch((error) => {
            data = error.data;
        });

    return data;
}

// 벡엔드 호출 후 받은 데이터를 반환

const userMypage = async () => {
    let data = {};
    let url = 'api/v1/user/usr_mypage'

    await api.get(url)
        .then((res) => {
            data = res.data;
        })
        .catch((error) => {
            data = error.data;
        })
    return data;
}

/**
 * 특정 ID를 가진 유저 하나의 정보를 불러오는 함수
 * @param {number | string} userId - 조회하고 싶은 유저의 ID
 */
const fetchUserById = async (userId) => {
    let data = {};

    // 백틱(`)을 사용하여 URL 문자열 안에 ${userId} 변수를 삽입합니다.
    let url = `/api/v1/users/${userId}`;

    console.log("요청할 URL:", url);

    await api.get(url) // 동적으로 만들어진 URL로 요청을 보냅니다.
        .then((res) => {
            data = res.data;
        })
        .catch((error) => {
            data = error.data;
        });

    return data;
}

/**
 * 특정 유저의 정보를 부분적으로 수정하는 함수
 * @param {number | string} userId - 수정할 유저의 ID
 * @param {object} updateData - 수정할 내용이 담긴 객체
 */
const updateUser = async (userId, updateData) => {
    let data = {};

    // 1. 수정할 대상의 주소를 동적으로 만듭니다.
    let url = `/api/v1/users/${userId}`;

    // 2. api.patch를 사용하여, 수정할 내용(updateData)만 서버로 보냅니다.
    await api.patch(url, updateData)
        .then((res) => {
            data = res.data;
        })
        .catch((error) => {
            data = error.data;
        });

    return data;
}


export default { userSignUp, userSignIn, fetchUserById, updateUser, userMypage, logOut }