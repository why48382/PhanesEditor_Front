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
    let url = '/login';

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
    let url = '/user/logout';

    await api.post(url)
        .then((res) => {
            data = res.data;
        })
        .catch((error) => {
            data = error.data;
        });

    return data;
}

const userMypage = async () => {
    let data = {};
    let url = '/user/usr_mypage'

    await api.get(url)
        .then((res) => {
            data = res.data;
        })
        .catch((error) => {
            data = error.data;
        })
    return data;
}

const fetchUserById = async (userId) => {
    let data = {};

    // 백틱(`)을 사용하여 URL 문자열 안에 ${userId} 변수를 삽입합니다.
    let url = `/users/${userId}`;

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

const updateUser = async (userId, updateData) => {
    let data = {};
    // 1. 수정할 대상의 주소를 동적으로 만듭니다.
    let url = `/users/${userId}`;

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

const findUserNickname = async (nickname) => {
    let data = {};
    let url = `/users/search`;

    console.log("요청할 URL:", url);

    await api.get(url, {params: {nickname}})
      .then((res) => {
          data = res.data;
      })
      .catch((error) => {
          data = error.data;
      });

    return data;
}


export default { userSignUp, userSignIn, fetchUserById, updateUser, userMypage, logOut, findUserNickname}