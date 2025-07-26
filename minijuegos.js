// ====== CONFIGURACIÓN ======
const MINIJUEGOS = {
    elementos: {
        canvas: document.getElementById('minijuegos-canvas'),
        botonSalir: document.getElementById('boton-salir'),
        juegos: {
            juego1: document.getElementById('juego1'),
            juego2: document.getElementById('juego2')
        }
    },
    rutas: {
        juego1: 'interfaz1.html',
        juego2: 'interfaz2.html'
    }
};

// ====== FUNCIONES PRINCIPALES ======

function ajustarEscala() {
    const scale = Math.min(
        window.innerWidth / 135,
        window.innerHeight / 240
    );
    MINIJUEGOS.elementos.canvas.style.transform = `scale(${scale})`;
}

function configurarBotones() {
    // Botón de salida
    MINIJUEGOS.elementos.botonSalir.addEventListener('click', () => {
        window.location.href = 'celular.html';
    });

    // Botones de juegos
    Object.keys(MINIJUEGOS.elementos.juegos).forEach(juegoId => {
        MINIJUEGOS.elementos.juegos[juegoId].addEventListener('click', () => {
            if (MINIJUEGOS.rutas[juegoId]) {
                window.location.href = MINIJUEGOS.rutas[juegoId];
            }
        });
    });

    // Eventos táctiles para móviles
    document.querySelectorAll('.boton-presionable').forEach(boton => {
        boton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            boton.style.transform = 'scale(0.85)';
        }, { passive: false });

        boton.addEventListener('touchend', () => {
            boton.style.transform = 'scale(1)';
        });
    });
}

// ====== INICIALIZACIÓN ======
function init() {
    // Añadir clase común a todos los botones
    document.querySelectorAll('#boton-salir, .juego-btn').forEach(boton => {
        boton.classList.add('boton-presionable');
    });

    ajustarEscala();
    configurarBotones();
    window.addEventListener('resize', ajustarEscala);
}

document.addEventListener('DOMContentLoaded', init);
