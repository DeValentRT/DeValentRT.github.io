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
        // Pantalla más ancha (landscape)
        scale = window.innerHeight / 240;
    } else {
        // Pantalla más alta (portrait)
        scale = window.innerWidth / 135;
    }
    
    MOCHILA.elementos.canvas.style.transform = `scale(${scale})`;
}

// ====== FUNCIONES PRINCIPALES (SIN CAMBIOS) ======
function manejarBotonCelular() {
    const { botonCelular } = MOCHILA.elementos;
    
    botonCelular.addEventListener('click', () => {
        setTimeout(() => {
            window.location.href = 'celular.html';
        }, MOCHILA.animacion.duracion);
    });
    
    botonCelular.addEventListener('touchstart', (e) => {
        e.preventDefault();
    }, { passive: false });
}

function manejarBotonCerrar() {
    const { botonCerrar } = MOCHILA.elementos;
    
    botonCerrar.addEventListener('click', () => {
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
