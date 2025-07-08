import api from "@/plugins/axiosinterceptor";

const userList = () => {
    let data = {};
    let url = '/user_list.json';

    api.get(url)
        .then((res) => {
            data = res.data;
        })
        .catch((error) => {
            data = error.data;
        })
    
    return data;
}

const userDetail = () => {

}

const userCreate = () => {

}

const userUpdate = () => {

}

const userDelete = () => {

}

export default { userList, userDetail }