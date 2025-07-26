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

// ====== FUNCIÓN DE ESCALADO MEJORADA ======
function ajustarEscala() {
    const windowRatio = window.innerWidth / window.innerHeight;
    const gameRatio = 135 / 240;
    let scale;
    
    if (windowRatio > gameRatio) {
        // Pantalla más ancha (landscape)
        scale = window.innerHeight / 240;
    } else {
        // Pantalla más alta (portrait)
        scale = window.innerWidth / 135;
    }
    
    CELULAR.elementos.canvas.style.transform = `scale(${scale})`;
}

// ====== FUNCIONES PRINCIPALES (SIN CAMBIOS) ======
function manejarClick(boton, destino) {
    const esBotonBack = boton.id === 'boton-back';
    const transformBase = esBotonBack ? 'translateX(-50%) ' : '';
    
    boton.style.transform = `${transformBase}scale(${CELULAR.animacion.escala})`;
    boton.style.filter = `brightness(${CELULAR.animacion.brillo}) drop-shadow(0 0 6px rgba(255, 255, 255, 0.7))`;
    boton.style.opacity = '0.9';

    if (destino) {
        setTimeout(() => {
            boton.style.transform = `${transformBase}scale(1)`;
            boton.style.filter = 'brightness(1)';
            boton.style.opacity = '1';
            window.location.href = destino;
        }, CELULAR.animacion.duracion + CELULAR.animacion.esperaRedireccion);
    } else {
        setTimeout(() => {
            boton.style.transform = `${transformBase}scale(1)`;
            boton.style.filter = 'brightness(1)';
            boton.style.opacity = '1';
        }, CELULAR.animacion.duracion);
    }
}

function configurarBotones() {
    CELULAR.elementos.botonBack.addEventListener('click', () => {
        manejarClick(CELULAR.elementos.botonBack, 'mochila.html');
    });

    Object.keys(CELULAR.elementos.apps).forEach(appId => {
        CELULAR.elementos.apps[appId].addEventListener('click', () => {
            manejarClick(CELULAR.elementos.apps[appId], CELULAR.rutas[appId] || null);
        });
    });

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
    ajustarEscala();
    configurarBotones();
    window.addEventListener('resize', ajustarEscala);
    window.addEventListener('orientationchange', ajustarEscala);
    document.addEventListener('gesturestart', (e) => e.preventDefault());
}

document.addEventListener('DOMContentLoaded', init);
