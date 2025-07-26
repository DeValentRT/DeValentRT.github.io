// ====== CONFIGURACIÓN ======
const INTERFAZ2 = {
    elementos: {
        canvas: document.getElementById('interfaz2-canvas'),
        botonCerrar: document.getElementById('boton-cerrar'),
        botonesDificultad: {
            dif1: document.getElementById('dif1'),
            dif2: document.getElementById('dif2'),
            dif3: document.getElementById('dif3')
        }
    },
    rutas: {
        cerrar: 'minijuegos.html',
        dificultad: {
            dif1: 'Tperiodica.html?nivel=facil',
            dif2: 'Tperiodica.html?nivel=media',
            dif3: 'Tperiodica.html?nivel=dificil'
        }
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
    
    INTERFAZ2.elementos.canvas.style.transform = `scale(${scale})`;
}

// ====== CONFIGURACIÓN DE BOTONES ======
function configurarBotones() {
    // Botón cerrar
    INTERFAZ2.elementos.botonCerrar.addEventListener('click', () => {
        window.location.href = INTERFAZ2.rutas.cerrar;
    });
    
    // Botones de dificultad
    Object.keys(INTERFAZ2.elementos.botonesDificultad).forEach(botonId => {
        INTERFAZ2.elementos.botonesDificultad[botonId].addEventListener('click', () => {
            window.location.href = INTERFAZ2.rutas.dificultad[botonId];
        });
    });

    // Eventos táctiles mejorados
    document.querySelectorAll('.boton-dificultad, #boton-cerrar').forEach(boton => {
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
    ajustarEscala();
    configurarBotones();
    window.addEventListener('resize', ajustarEscala);
    window.addEventListener('orientationchange', ajustarEscala);
}

document.addEventListener('DOMContentLoaded', init);
