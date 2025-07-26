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

// ====== FUNCIONES PRINCIPALES ======

function ajustarEscala() {
    const scale = Math.min(
        window.innerWidth / 135,
        window.innerHeight / 240
    );
    MOCHILA.elementos.canvas.style.transform = `scale(${scale})`;
}

function manejarBotonCelular() {
    const { botonCelular } = MOCHILA.elementos;
    
    // Click normal
    botonCelular.addEventListener('click', () => {
        setTimeout(() => {
            window.location.href = 'celular.html';
        }, MOCHILA.animacion.duracion);
    });
    
    // Touch para móviles
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
}

document.addEventListener('DOMContentLoaded', init);