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
    
    MINIJUEGOS.elementos.canvas.style.transform = `scale(${scale})`;
}

// ====== FUNCIONES PRINCIPALES ======
function configurarBotones() {
    // Botón de salida (se mantiene igual)
    MINIJUEGOS.elementos.botonSalir.addEventListener('click', () => {
        window.location.href = 'celular.html';
    });

    // Botones de juegos (se mantiene igual)
    Object.keys(MINIJUEGOS.elementos.juegos).forEach(juegoId => {
        MINIJUEGOS.elementos.juegos[juegoId].addEventListener('click', () => {
            if (MINIJUEGOS.rutas[juegoId]) {
                window.location.href = MINIJUEGOS.rutas[juegoId];
            }
        });
    });

    // Eventos táctiles para móviles (corrección aplicada)
    document.querySelectorAll('.boton-presionable').forEach(boton => {
        const destino = boton.id === 'boton-salir' 
            ? 'celular.html' 
            : MINIJUEGOS.rutas[boton.id] || null;

        boton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            boton.style.transform = 'scale(0.85)';
        }, { passive: false });

        boton.addEventListener('touchend', (e) => {
            e.preventDefault();
            boton.style.transform = 'scale(1)';
            if (destino) {
                setTimeout(() => {
                    window.location.href = destino;
                }, 100); // Pequeño retraso para la animación
            }
        });
    });
}

// ====== INICIALIZACIÓN ======
function init() {
    // Añadir clase común a todos los botones (se mantiene igual)
    document.querySelectorAll('#boton-salir, .juego-btn').forEach(boton => {
        boton.classList.add('boton-presionable');
    });

    ajustarEscala();
    configurarBotones();
    window.addEventListener('resize', ajustarEscala);
    window.addEventListener('orientationchange', ajustarEscala);
}

document.addEventListener('DOMContentLoaded', init);
