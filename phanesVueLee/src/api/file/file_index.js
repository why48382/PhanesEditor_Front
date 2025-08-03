import api from "@/plugins/axiosinterceptor";

const projectFile = async (req) => {
    let data = {};
    let url = '/web02/api/v1/file/upload';

    await api.post(url, req)
        .then((res) => {
            data = res.data;
        })
        .catch((error) => {
            data = error.data;
        });

    return data;
}

export default {projectFile};