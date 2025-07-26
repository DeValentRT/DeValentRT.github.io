// ===== VARIABLES GLOBALES =====
const paredLayer = document.getElementById('pared-layer');
const sueloLayer = document.getElementById('suelo-layer');
const gatoContainer = document.getElementById('gato-container');
const gatoSprite = document.getElementById('gato-sprite');
const mochilaContainer = document.getElementById('mochila-container');

// Configuración de desplazamiento (MANTIENE LA LÓGICA ORIGINAL)
let startX = 0;
let currentX = -52.5;
const maxScroll = -(240 - 135);

// Animación (MANTIENE LA LÓGICA ORIGINAL)
let frameActual = 0;
const totalFrames = 8;
const fps = 4;
let animacionInterval;

// ===== ANIMACIÓN DEL GATO (MANTIENE LA LÓGICA ORIGINAL) =====
function iniciarAnimacion() {
    if (animacionInterval) clearInterval(animacionInterval);
    animacionInterval = setInterval(() => {
        frameActual = (frameActual + 1) % totalFrames;
        gatoSprite.src = `IdleSentado/animation_cat${frameActual + 1}.png`;
    }, 1000 / fps);
}

// ===== INTERACCIÓN MOCHILA (MANTIENE LA LÓGICA ORIGINAL) =====
function configurarMochila() {
    mochilaContainer.addEventListener('click', manejarClickMochila);
    mochilaContainer.addEventListener('touchstart', manejarClickMochila, { passive: true });
}

function manejarClickMochila(e) {
    e.stopPropagation();
    window.location.href = 'mochila.html';
}

// ===== DESPLAZAMIENTO (MANTIENE LA LÓGICA ORIGINAL) =====
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
    gatoContainer.style.transform = `translateX(${newX}px)`;
    e.preventDefault();
}

function manejarFin() {
    currentX = parseInt(paredLayer.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
    startX = 0;
}

// ===== INICIALIZACIÓN (MANTIENE LA LÓGICA ORIGINAL) =====
function init() {
    document.addEventListener('touchstart', manejarInicio, { passive: false });
    document.addEventListener('touchmove', manejarMovimiento, { passive: false });
    document.addEventListener('touchend', manejarFin);
    document.addEventListener('mousedown', manejarInicio);
    document.addEventListener('mousemove', manejarMovimiento);
    document.addEventListener('mouseup', manejarFin);

    iniciarAnimacion();
    configurarMochila();

    paredLayer.style.transform = `translateX(${currentX}px)`;
    sueloLayer.style.transform = `translateX(${currentX}px)`;
    gatoContainer.style.transform = `translateX(${currentX}px)`;
}

document.addEventListener('DOMContentLoaded', init);
