// fileStorage.js - Versión simplificada y garantizada
const fileStorage = {
    users: JSON.parse(localStorage.getItem('compufix_users')) || [],
    
    addUser: function(user) {
        if (this.users.some(u => u.email === user.email)) {
            return false;
        }
        this.users.push(user);
        localStorage.setItem('compufix_users', JSON.stringify(this.users));
        return true;
    },
    
    authenticate: function(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        return user || null;
    }
};