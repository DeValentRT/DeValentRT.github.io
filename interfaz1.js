// ====== CONFIGURACIÓN ======
const INTERFAZ = {
    elementos: {
        canvas: document.getElementById('interfaz-canvas'),
        botonVolver: document.getElementById('boton-volver'),
        modos: {
            mod1: document.getElementById('mod1'),
            mod2: document.getElementById('mod2')
        }
    },
    rutas: {
        volver: 'minijuegos.html',
        mod1: 'michi.html?modo=local',
        mod2: 'michi.html?modo=ia'
    }
};

// ====== FUNCIONES PRINCIPALES ======

function ajustarEscala() {
    const scale = Math.min(
        window.innerWidth / 135,
        window.innerHeight / 240
    );
    INTERFAZ.elementos.canvas.style.transform = `scale(${scale})`;
}

function configurarBotones() {
    // Botón volver
    INTERFAZ.elementos.botonVolver.addEventListener('click', () => {
        window.location.href = INTERFAZ.rutas.volver;
    });

    // Botones de modo
    Object.keys(INTERFAZ.elementos.modos).forEach(modoId => {
        INTERFAZ.elementos.modos[modoId].addEventListener('click', () => {
            window.location.href = INTERFAZ.rutas[modoId];
        });
    });

    // Eventos táctiles
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
    // Añadir clase a todos los botones
    document.querySelectorAll('#boton-volver, .mod-btn').forEach(boton => {
        boton.classList.add('boton-presionable');
    });

    ajustarEscala();
    configurarBotones();
    window.addEventListener('resize', ajustarEscala);
}

document.addEventListener('DOMContentLoaded', init);