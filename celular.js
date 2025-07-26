// ====== CONFIGURACIÓN PRINCIPAL ======
const CELULAR = {
    elementos: {
        canvas: document.getElementById('celular-canvas'),
        botonBack: document.getElementById('boton-back'),
        apps: {
            app1: document.getElementById('app1'),
            app2: document.getElementById('app2'),
            app3: document.getElementById('app3'),
            app4: document.getElementById('app4'),
            app5: document.getElementById('app5')
        }
    },
    rutas: {
        app1: 'minijuegos.html'
        // app2: '', // Añadir cuando existan
        // app3: '',
        // app4: '',
        // app5: ''
    },
    animacion: {
        duracion: 120,       // Duración de la animación (ms)
        esperaRedireccion: 100, // Tiempo extra antes de redirigir (ms)
        escala: 0.88,
        brillo: 1.8
    }
};

// ====== FUNCIONES PRINCIPALES ======

/**
 * Ajusta la escala del canvas al tamaño de pantalla
 */
function ajustarEscala() {
    const escala = Math.min(
        window.innerWidth / 135,
        window.innerHeight / 240
    );
    CELULAR.elementos.canvas.style.transform = `scale(${escala})`;
}

/**
 * Aplica animación y maneja redirección
 * @param {HTMLElement} boton - Elemento a animar
 * @param {string|null} destino - URL para redirección (null si no aplica)
 */
function manejarClick(boton, destino) {
    // Configura transformación base para mantener posición
    const esBotonBack = boton.id === 'boton-back';
    const transformBase = esBotonBack ? 'translateX(-50%) ' : '';
    
    // 1. Aplicar animación
    boton.style.transform = `${transformBase}scale(${CELULAR.animacion.escala})`;
    boton.style.filter = `brightness(${CELULAR.animacion.brillo}) drop-shadow(0 0 6px rgba(255, 255, 255, 0.7))`;
    boton.style.opacity = '0.9';

    // 2. Manejar redirección (si existe destino)
    if (destino) {
        setTimeout(() => {
            // Restaurar estilos antes de redireccionar
            boton.style.transform = `${transformBase}scale(1)`;
            boton.style.filter = 'brightness(1)';
            boton.style.opacity = '1';
            
            window.location.href = destino;
        }, CELULAR.animacion.duracion + CELULAR.animacion.esperaRedireccion);
    } else {
        // Restaurar sin redirección
        setTimeout(() => {
            boton.style.transform = `${transformBase}scale(1)`;
            boton.style.filter = 'brightness(1)';
            boton.style.opacity = '1';
        }, CELULAR.animacion.duracion);
    }
}

/**
 * Configura eventos para todos los botones
 */
function configurarBotones() {
    // Botón de regreso
    CELULAR.elementos.botonBack.addEventListener('click', () => {
        manejarClick(CELULAR.elementos.botonBack, 'mochila.html');
    });

    // Configurar eventos para cada app
    Object.keys(CELULAR.elementos.apps).forEach(appId => {
        CELULAR.elementos.apps[appId].addEventListener('click', () => {
            manejarClick(CELULAR.elementos.apps[appId], CELULAR.rutas[appId] || null);
        });
    });

    // Eventos táctiles mejorados para móviles
    document.querySelectorAll('.app-icon, #boton-back').forEach(boton => {
        const esBotonBack = boton.id === 'boton-back';
        const transformBase = esBotonBack ? 'translateX(-50%) ' : '';

        boton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            boton.style.transform = `${transformBase}scale(${CELULAR.animacion.escala})`;
            boton.style.filter = `brightness(${CELULAR.animacion.brillo})`;
            boton.style.opacity = '0.9';
        }, { passive: false });

        boton.addEventListener('touchend', () => {
            boton.style.transform = `${transformBase}scale(1)`;
            boton.style.filter = 'brightness(1)';
            boton.style.opacity = '1';
        });
    });
}

// ====== INICIALIZACIÓN ======
function init() {
    // Ajuste inicial de escala
    ajustarEscala();

    // Configurar interacciones
    configurarBotones();

    // Eventos globales
    window.addEventListener('resize', ajustarEscala);

    // Prevenir zoom en móviles
    document.addEventListener('gesturestart', (e) => e.preventDefault());
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);