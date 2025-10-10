import axiosInstance from "../axios/axios";

export const loginAdmin = (data) => {
    return axiosInstance.post("/auth/login", data);
}

export const logoutAdmin = (id) => {
    return axiosInstance.post(`/auth/logout/${id}`);
};

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

export const fetchPayments = () => {
    return axiosInstance.get(`admin/payment`);
};

export const updatePaymentStatus = (data) => {
    console.log("API Data:", data); // Debugging line
    return axiosInstance.patch(`admin/payment`, data);
};

export const fetchPendingKYC = () => {
    return axiosInstance.get(`admin/kyc`);
}

export const updateKYCStatus = async (kyc_id, status, reason = null) => {
    return axiosInstance.patch(`admin/kyc`, { kyc_id, status, reason });
};

export const addCurrencyConfig = (data) => {
    return axiosInstance.post('admin/config', data);
}

export const getCurrency = () => {
    return axiosInstance.get('admin/aed-rate');
}

export const updateCurrency = (data) => {
    return axiosInstance.patch('admin/aed-rate', data);
}

export const fetchProducts= () => {
    return axiosInstance.get('admin/products');
}

export const addProduct= (data) => {
    return axiosInstance.post('admin/product', data);
}

export const updateProduct= (data) => {
    return axiosInstance.patch('admin/products', data);
}

export const deleteProduct= (id) => {
    return axiosInstance.delete(`admin/products/${id}`);
}

export const fetchCategory= () => {
    return axiosInstance.get('admin/category');
}

export const addCategory= (data) => {
    return axiosInstance.post('admin/category', data);
}

export const updateCategory= (data) => {
    return axiosInstance.patch('admin/category', data);
}

export const deleteCategory= (id) => {
    return axiosInstance.delete(`admin/category/${id}`);
}