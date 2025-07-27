// ====== CONFIGURACIÓN ======
const MOCHILA = {
    elementos: {
        canvas: document.getElementById('mochila-canvas'),
        botonCerrar: document.getElementById('boton-superior'),
        botonCelular: document.getElementById('boton-lateral')
    },
    animacion: {
        duracion: 150 // ms
    }
};

// ====== FUNCIÓN DE ESCALADO MEJORADA ======
function ajustarEscala() {
    const windowRatio = window.innerWidth / window.innerHeight;
    const gameRatio = 135 / 240;
    let scale;
    
    if (windowRatio > gameRatio) {
        scale = window.innerHeight / 240;
    } else {
        scale = window.innerWidth / 135;
    }
    
    MOCHILA.elementos.canvas.style.transform = `scale(${scale})`;
}

// ====== FUNCIONES PRINCIPALES ======
function manejarBotonCelular() {
    const { botonCelular } = MOCHILA.elementos;
    
    const accionCelular = () => {
        setTimeout(() => {
            window.location.href = 'celular.html';
        }, MOCHILA.animacion.duracion);
    };
    
    // Click para desktop
    botonCelular.addEventListener('click', accionCelular);
    
    // Touch para móvil
    botonCelular.addEventListener('touchstart', (e) => {
        e.preventDefault();
        botonCelular.style.transform = 'translateY(-50%) scale(0.9)';
        botonCelular.style.opacity = '0.85';
    }, { passive: false });
    
    botonCelular.addEventListener('touchend', (e) => {
        e.preventDefault();
        accionCelular();
        botonCelular.style.transform = 'translateY(-50%)';
        botonCelular.style.opacity = '1';
    });
}

function manejarBotonCerrar() {
    const { botonCerrar } = MOCHILA.elementos;
    
    botonCerrar.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // También añadir touch para el botón de cerrar por consistencia
    botonCerrar.addEventListener('touchend', (e) => {
        e.preventDefault();
        window.location.href = 'index.html';
    });
}

// ====== INICIALIZACIÓN ======
function init() {
    ajustarEscala();
    manejarBotonCelular();
    manejarBotonCerrar();
    window.addEventListener('resize', ajustarEscala);
    window.addEventListener('orientationchange', ajustarEscala);
}

document.addEventListener('DOMContentLoaded', init);
