document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el modal de servicios
    const serviceModal = new bootstrap.Modal(document.getElementById('serviceModal'));
    
    // Configurar los botones de solicitud de servicio
    document.querySelectorAll('[data-service]').forEach(button => {
        button.addEventListener('click', function() {
            // Verificar si el usuario está logueado
            const userData = sessionStorage.getItem('currentUser');
            if (!userData) {
                if (confirm('Debes iniciar sesión para solicitar servicios. ¿Deseas ir al login?')) {
                    window.location.href = 'login.html';
                }
                return;
            }
            
            // Configurar el modal con los datos del servicio
            const service = this.getAttribute('data-service');
            const price = this.getAttribute('data-price');
            
            document.getElementById('serviceModalTitle').textContent = `Solicitar ${service}`;
            document.getElementById('selectedService').value = service;
            document.getElementById('selectedPrice').value = price;
            
            // Mostrar el modal
            serviceModal.show();
        });
    });
    
    // Mostrar/ocultar campo de dirección según tipo de servicio
    document.getElementById('serviceType').addEventListener('change', function() {
        const addressField = document.getElementById('addressField');
        addressField.style.display = this.value === 'domicilio' ? 'block' : 'none';
    });
    
    // Confirmar servicio
    document.getElementById('confirmService').addEventListener('click', function() {
        const userData = sessionStorage.getItem('currentUser');
        if (!userData) {
            alert('La sesión ha expirado. Por favor inicia sesión nuevamente.');
            window.location.href = 'login.html';
            return;
        }
        
        const user = JSON.parse(userData);
        const serviceType = document.getElementById('serviceType').value;
        const problemDescription = document.getElementById('problemDescription').value;
        const preferredDate = document.getElementById('preferredDate').value;
        const service = document.getElementById('selectedService').value;
        const price = document.getElementById('selectedPrice').value;
        const address = serviceType === 'domicilio' ? document.getElementById('address').value : '';
        
        // Validaciones
        if (!serviceType || !problemDescription || !preferredDate) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }
        
        if (serviceType === 'domicilio' && !address) {
            alert('Por favor ingrese una dirección para el servicio a domicilio');
            return;
        }
        
        // Crear objeto de servicio
        const serviceRequest = {
            service,
            price,
            serviceType,
            problemDescription,
            preferredDate,
            address,
            userEmail: user.email,
            date: new Date().toISOString(),
            status: 'Pendiente'
        };
        
        // Guardar solicitud
        let serviceRequests = JSON.parse(localStorage.getItem('compufix_serviceRequests')) || [];
        serviceRequests.push(serviceRequest);
        localStorage.setItem('compufix_serviceRequests', JSON.stringify(serviceRequests));
        
        // Mostrar confirmación
        alert(`Servicio "${service}" solicitado exitosamente. Nos pondremos en contacto pronto.`);
        
        // Cerrar modal
        serviceModal.hide();
        
        // Redirigir al dashboard
        if (!window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'dashboard.html';
        }
    });
});