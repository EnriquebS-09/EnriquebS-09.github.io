document.addEventListener('DOMContentLoaded', function() {
    // Manejar registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validaciones
            if (!name || !email || !password || !confirmPassword) {
                alert('Por favor complete todos los campos');
                return;
            }

            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden');
                return;
            }

            if (!isValidPassword(password)) {
                alert('La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números');
                return;
            }

            if (!isValidEmail(email)) {
                alert('Por favor ingrese un correo electrónico válido');
                return;
            }

            const users = JSON.parse(localStorage.getItem('compufix_users')) || [];
            
            if (users.some(user => user.email === email)) {
                alert('Este correo electrónico ya está registrado');
                return;
            }

            // Generar código de verificación
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Guardar usuario como no verificado
            const newUser = { 
                name, 
                email, 
                password, 
                verified: false,
                verificationCode,
                verificationSentAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('compufix_users', JSON.stringify(users));
            
            // Simular envío de correo
            console.log(`Código de verificación para ${email}: ${verificationCode}`);
            sessionStorage.setItem('pendingVerificationEmail', email);
            
            // Redirigir a página de verificación
            window.location.href = 'verify-email.html';
        });
    }

    // Manejar login con verificación de correo
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            const users = JSON.parse(localStorage.getItem('compufix_users')) || [];
            const user = users.find(user => user.email === email && user.password === password);

            if (user) {
                if (!user.verified) {
                    alert('Por favor verifica tu correo electrónico antes de iniciar sesión.');
                    sessionStorage.setItem('pendingVerificationEmail', email);
                    window.location.href = 'verify-email.html';
                    return;
                }
                
                // Guardar sesión
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = 'dashboard.html';
            } else {
                alert('Correo electrónico o contraseña incorrectos');
            }
        });
    }

    // Manejar verificación de código
    const verificationForm = document.getElementById('verificationForm');
    if (verificationForm) {
        verificationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = sessionStorage.getItem('pendingVerificationEmail');
            const code = document.getElementById('verificationCode').value.trim();
            
            if (!email) {
                window.location.href = 'register.html';
                return;
            }

            if (verifyEmail(email, code)) {
                alert('¡Correo verificado exitosamente! Ahora puedes iniciar sesión.');
                sessionStorage.removeItem('pendingVerificationEmail');
                window.location.href = 'login.html';
            } else {
                alert('Código inválido o expirado. Por favor intenta nuevamente.');
            }
        });
    }

    // Manejar reenvío de código
    const resendLink = document.getElementById('resendCode');
    if (resendLink) {
        resendLink.addEventListener('click', function(e) {
            e.preventDefault();
            const email = sessionStorage.getItem('pendingVerificationEmail');
            
            if (!email) {
                window.location.href = 'register.html';
                return;
            }

            const users = JSON.parse(localStorage.getItem('compufix_users')) || [];
            const userIndex = users.findIndex(u => u.email === email);
            
            if (userIndex !== -1) {
                // Generar nuevo código
                const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                users[userIndex].verificationCode = newCode;
                users[userIndex].verificationSentAt = new Date().toISOString();
                localStorage.setItem('compufix_users', JSON.stringify(users));
                
                // Simular envío
                console.log(`Nuevo código de verificación para ${email}: ${newCode}`);
                alert('Se ha enviado un nuevo código a tu correo electrónico.');
            }
        });
    }
});

// Funciones de ayuda
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidPassword(password) {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(password);
}

function verifyEmail(email, code) {
    const users = JSON.parse(localStorage.getItem('compufix_users')) || [];
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) return false;
    
    const user = users[userIndex];
    
    // Verificar código y que no haya expirado (1 hora)
    const sentAt = new Date(user.verificationSentAt);
    const now = new Date();
    const diffInHours = (now - sentAt) / (1000 * 60 * 60);
    
    if (user.verificationCode === code && diffInHours < 1) {
        users[userIndex].verified = true;
        users[userIndex].verificationCode = null;
        localStorage.setItem('compufix_users', JSON.stringify(users));
        return true;
    }
    
    return false;
}

function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem('compufix_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        sessionStorage.setItem('compufix_loggedIn', 'true');
        sessionStorage.setItem('compufix_userEmail', user.email);
        sessionStorage.setItem('compufix_userName', user.name);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    }
    return false;
}

function registerUser(name, email, password) {
    const users = JSON.parse(localStorage.getItem('compufix_users') || '[]');
    
    if (users.some(u => u.email === email)) {
        return false;
    }
    
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('compufix_users', JSON.stringify(users));
    
    sessionStorage.setItem('compufix_loggedIn', 'true');
    sessionStorage.setItem('compufix_userEmail', email);
    sessionStorage.setItem('compufix_userName', name);
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return true;
}

function resetPassword(email, newPassword) {
    const users = JSON.parse(localStorage.getItem('compufix_users') || '[]');
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('compufix_users', JSON.stringify(users));
        return true;
    }
    return false;
}
// Agregar esto en auth.js, dentro del DOMContentLoaded

// Manejar olvidó contraseña
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        
        if (!isValidEmail(email)) {
            alert('Por favor ingrese un correo electrónico válido');
            return;
        }

        const users = JSON.parse(localStorage.getItem('compufix_users')) || [];
        const user = users.find(u => u.email === email);
        
        if (!user) {
            alert('No existe una cuenta con este correo electrónico');
            return;
        }

        // Generar código de recuperación
        const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Guardar código en el usuario
        const userIndex = users.findIndex(u => u.email === email);
        users[userIndex].recoveryCode = recoveryCode;
        users[userIndex].recoveryCodeSentAt = new Date().toISOString();
        localStorage.setItem('compufix_users', JSON.stringify(users));
        
        // Mostrar código en consola (para desarrollo)
        console.log(`Código de recuperación para ${email}: ${recoveryCode}`);
        
        // Guardar email en sesión para el siguiente paso
        sessionStorage.setItem('resetEmail', email);
        
        // Redirigir a página de verificación de código
        window.location.href = 'verify-recovery-code.html';
    });
}

// Agregar estas funciones en auth.js

function verifyRecoveryCode(email, code) {
    const users = JSON.parse(localStorage.getItem('compufix_users')) || [];
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) return false;
    
    const user = users[userIndex];
    
    // Verificar código y que no haya expirado (1 hora)
    const sentAt = new Date(user.recoveryCodeSentAt);
    const now = new Date();
    const diffInHours = (now - sentAt) / (1000 * 60 * 60);
    
    if (user.recoveryCode === code && diffInHours < 1) {
        users[userIndex].recoveryCode = null; // Limpiar código después de uso
        localStorage.setItem('compufix_users', JSON.stringify(users));
        return true;
    }
    
    return false;
}

// Manejar verificación de código de recuperación
const verifyRecoveryCodeForm = document.getElementById('verifyRecoveryCodeForm');
if (verifyRecoveryCodeForm) {
    verifyRecoveryCodeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = sessionStorage.getItem('resetEmail');
        const code = document.getElementById('recoveryCode').value.trim();
        
        if (!email) {
            window.location.href = 'forgot-password.html';
            return;
        }

        if (verifyRecoveryCode(email, code)) {
            alert('¡Código verificado correctamente! Ahora puedes establecer una nueva contraseña.');
            window.location.href = 'reset-password.html';
        } else {
            alert('Código inválido o expirado. Por favor intenta nuevamente.');
        }
    });
}

// Manejar reenvío de código de recuperación
const resendRecoveryLink = document.getElementById('resendRecoveryCode');
if (resendRecoveryLink) {
    resendRecoveryLink.addEventListener('click', function(e) {
        e.preventDefault();
        const email = sessionStorage.getItem('resetEmail');
        
        if (!email) {
            window.location.href = 'forgot-password.html';
            return;
        }

        const users = JSON.parse(localStorage.getItem('compufix_users')) || [];
        const userIndex = users.findIndex(u => u.email === email);
        
        if (userIndex !== -1) {
            // Generar nuevo código
            const newCode = Math.floor(100000 + Math.random() * 900000).toString();
            users[userIndex].recoveryCode = newCode;
            users[userIndex].recoveryCodeSentAt = new Date().toISOString();
            localStorage.setItem('compufix_users', JSON.stringify(users));
            
            // Mostrar en consola (para desarrollo)
            console.log(`Nuevo código de recuperación para ${email}: ${newCode}`);
            alert('Se ha enviado un nuevo código a tu correo electrónico.');
        }
    });
}
