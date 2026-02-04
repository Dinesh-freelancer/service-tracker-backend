export const parseJwt = (token) => {
    try {
        if (!token) return null;
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

export const getUser = () => {
    const token = localStorage.getItem('token');
    return parseJwt(token);
};
