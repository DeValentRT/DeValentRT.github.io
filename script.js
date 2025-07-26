// ===== VARIABLES GLOBALES =====
const paredLayer = document.getElementById('pared-layer');
const sueloLayer = document.getElementById('suelo-layer');
const gatoContainer = document.getElementById('gato-container');
const gatoSprite = document.getElementById('gato-sprite');
const mochilaContainer = document.getElementById('mochila-container');

// Configuración de desplazamiento
let startX = 0;
let currentX = -52.5; // Desplazamiento inicial (240-135)/2
const maxScroll = -(240 - 135);

// Animación
let frameActual = 0;
const totalFrames = 8;
const fps = 4;
let animacionInterval;

// Compensación para centrar el gato (diferencia entre el fondo y el área visible)
const compensacionCentrado = 52.5; // (240 - 135) / 2

// ===== ANIMACIÓN DEL GATO =====
function iniciarAnimacion() {
    if (animacionInterval) clearInterval(animacionInterval);
    animacionInterval = setInterval(() => {
        frameActual = (frameActual + 1) % totalFrames;
        gatoSprite.src = `IdleSentado/animation_cat${frameActual + 1}.png`;
    }, 1000 / fps);
}

// ===== INTERACCIÓN MOCHILA =====
function configurarMochila() {
    mochilaContainer.addEventListener('click', manejarClickMochila);
    mochilaContainer.addEventListener('touchstart', manejarClickMochila, { passive: true });
}

function manejarClickMochila(e) {
    e.stopPropagation();
    window.location.href = 'mochila.html';
}

// ===== DESPLAZAMIENTO =====
function manejarInicio(e) {
    startX = e.clientX || e.touches[0].clientX;
    e.preventDefault();
}

function manejarMovimiento(e) {
    if (!startX) return;

    const x = e.clientX || e.touches[0].clientX;
    const deltaX = x - startX;
    const newX = Math.min(Math.max(currentX + deltaX, maxScroll), 0);

    paredLayer.style.transform = `translateX(${newX}px)`;
    sueloLayer.style.transform = `translateX(${newX}px)`;
    
    // Aplicamos la compensación para mantener el gato centrado
    gatoContainer.style.transform = `translateX(${newX + compensacionCentrado}px)`;
    
    e.preventDefault();
}

function manejarFin() {
    currentX = parseInt(paredLayer.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
    startX = 0;
}

// ===== INICIALIZACIÓN =====
function init() {
    document.addEventListener('touchstart', manejarInicio, { passive: false });
    document.addEventListener('touchmove', manejarMovimiento, { passive: false });
    document.addEventListener('touchend', manejarFin);
    document.addEventListener('mousedown', manejarInicio);
    document.addEventListener('mousemove', manejarMovimiento);
    document.addEventListener('mouseup', manejarFin);

    iniciarAnimacion();
    configurarMochila();

    // Posición inicial con compensación para el gato
    paredLayer.style.transform = `translateX(${currentX}px)`;
    sueloLayer.style.transform = `translateX(${currentX}px)`;
    gatoContainer.style.transform = `translateX(${currentX + compensacionCentrado}px)`;

    function ajustarEscala() {
        const scale = Math.min(
            window.innerWidth / 135,
            window.innerHeight / 240
        );
        document.getElementById('game-container').style.transform = `scale(${scale})`;
    }

    window.addEventListener('resize', ajustarEscala);
    ajustarEscala();
}

document.addEventListener('DOMContentLoaded', init);
