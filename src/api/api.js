import axiosInstance from "../axios/axios";

export const fetchScheme = () => {
    return axiosInstance.get("/admin/scheme");
};

export const addScheme = (data) => {
    return axiosInstance.post("/admin/scheme", data);
};

export const editScheme = (id, data) => {
    return axiosInstance.patch(`/admin/scheme/${id}`, data);
};

export const deleteScheme = (id) => {
    return axiosInstance.delete(`/admin/scheme/${id}`);
};

export const fetchUsers = () => {
    return axiosInstance.get("/admin/user");
};

export const getUserById = (id) => {
    return axiosInstance.get(`/admin/user/${id}`);
};

export const addUser = (data) => {
    return axiosInstance.post("/auth/register", data);
};

export const updateUser = (data) => {
    return axiosInstance.patch("/admin/user/", data);
}; 

export const blockUser = (data) => {
    return axiosInstance.patch("/admin/user-block/", data);
}; 

export const deleteUser = (id) => {
    return axiosInstance.delete(`/admin/user/${id}`);
};