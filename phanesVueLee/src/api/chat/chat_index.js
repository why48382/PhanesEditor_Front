import api from "@/plugins/axiosinterceptor";

const chatCreate = async (req) => {
    let data = {};
    let url = '/api/v1/chat/register';

    await api.post(url, req)
        .then((res) => {
            data = res.data;
        })
        .catch((error) => {
            data = error.data;
        });

    return data;
}

export default { chatCreate }