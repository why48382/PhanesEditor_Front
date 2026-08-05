import api from "@/plugins/axiosinterceptor";

const inviteMember = async (projectId, userId, status = 'USER') => {
    let data = {};
    const url = '/project/member/addmember';

    await api.post(url, { projectId, userId, status })
        .then((res) => { data = res.data; })
        .catch((error) => { data = error.data; });

    return data;
}

const removeMember = async (projectId, userId) => {
    let data = {};
    const url = '/project/member/removemember';

    await api.delete(url, { data: { projectId, userId } })
        .then((res) => { data = res.data; })
        .catch((error) => { data = error.data; });

    return data;
}

export default { inviteMember, removeMember }