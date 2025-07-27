// ===== VARIABLES GLOBALES =====
const paredLayer = document.getElementById('pared-layer');
const sueloLayer = document.getElementById('suelo-layer');
const gatoContainer = document.getElementById('gato-container');
const gatoSprite = document.getElementById('gato-sprite');
const mochilaContainer = document.getElementById('mochila-container');

// Configuración de desplazamiento (ajustada la sensibilidad)
const config = {
    scroll: {
        startX: 0,
        currentX: -52.5,
        maxScroll: -(240 - 135),
        sensitivity: 0.6 // Reducida de 1.2 a 0.6 para menos sensibilidad
    },
    animation: {
        frameActual: 0,
        totalFrames: 8,
        fps: window.matchMedia("(hover: none)").matches ? 8 : 4
    }
};

// ===== ANIMACIÓN DEL GATO =====
function iniciarAnimacion() {
    let lastTime = 0;
    const frameDelay = 1000 / config.animation.fps;
    
    function animar(timestamp) {
        if (!lastTime || timestamp - lastTime >= frameDelay) {
            config.animation.frameActual = (config.animation.frameActual + 1) % config.animation.totalFrames;
            gatoSprite.src = `IdleSentado/animation_cat${config.animation.frameActual + 1}.png`;
            lastTime = timestamp;
        }
        requestAnimationFrame(animar);
    }
    requestAnimationFrame(animar);
}

// ===== INTERACCIÓN MOCHILA =====
function configurarMochila() {
    function handleInteraction(e) {
        e.stopPropagation();
        mochilaContainer.style.transform = 'scale(0.95)';
        setTimeout(() => {
            mochilaContainer.style.transform = '';
            window.location.href = 'mochila.html';
        }, 150);
    }

    mochilaContainer.addEventListener('click', handleInteraction);
    mochilaContainer.addEventListener('touchstart', handleInteraction, { passive: true });
}

// ===== DESPLAZAMIENTO HORIZONTAL =====
function manejarInicio(e) {
    config.scroll.startX = e.touches ? e.touches[0].clientX * config.scroll.sensitivity : e.clientX;
    if(e.cancelable) e.preventDefault();
}

function manejarMovimiento(e) {
    if (!config.scroll.startX) return;
    
    const x = e.touches ? e.touches[0].clientX * config.scroll.sensitivity : e.clientX;
    const deltaX = x - config.scroll.startX;
    config.scroll.currentX = Math.min(Math.max(config.scroll.currentX + deltaX, config.scroll.maxScroll), 0);
    
    paredLayer.style.transform = `translateX(${config.scroll.currentX}px)`;
    sueloLayer.style.transform = `translateX(${config.scroll.currentX}px)`;
    gatoContainer.style.transform = `translateX(${config.scroll.currentX}px)`;
    
    if(e.cancelable) e.preventDefault();
    config.scroll.startX = x;
}

function manejarFin() {
    config.scroll.startX = 0;
}

// ===== AJUSTE DE ESCALA AUTOMÁTICO =====
function ajustarEscala() {
    const container = document.getElementById('game-container');
    const windowRatio = window.innerWidth / window.innerHeight;
    const gameRatio = 135 / 240;
    
    // Calculamos la escala para llenar la pantalla
    let scale;
    if (windowRatio > gameRatio) {
        // Pantalla más ancha que el juego (landscape)
        scale = window.innerHeight / 240;
    } else {
        // Pantalla más alta que el juego (portrait)
        scale = window.innerWidth / 135;
    }
    
    // Aplicamos el escalado
    container.style.transform = `scale(${scale})`;
    
    // Pequeño margen superior en landscape
    if (windowRatio > gameRatio * 1.5) {
        container.style.marginTop = '15px';
    } else {
        container.style.marginTop = '0';
    }
}

// ===== INICIALIZACIÓN COMPLETA =====
function init() {
    // Configurar eventos
    const eventos = [
        { el: document, type: 'touchstart', fn: manejarInicio, options: { passive: false } },
        { el: document, type: 'touchmove', fn: manejarMovimiento, options: { passive: false } },
        { el: document, type: 'touchend', fn: manejarFin },
        { el: document, type: 'mousedown', fn: manejarInicio },
        { el: document, type: 'mousemove', fn: manejarMovimiento },
        { el: document, type: 'mouseup', fn: manejarFin },
        { el: window, type: 'resize', fn: ajustarEscala },
        { el: window, type: 'orientationchange', fn: ajustarEscala }
    ];
    
    eventos.forEach(({el, type, fn, options}) => el.addEventListener(type, fn, options));

    // Iniciar componentes
    iniciarAnimacion();
    configurarMochila();
    ajustarEscala();

    // Posición inicial
    paredLayer.style.transform = `translateX(${config.scroll.currentX}px)`;
    sueloLayer.style.transform = `translateX(${config.scroll.currentX}px)`;
    gatoContainer.style.transform = `translateX(${config.scroll.currentX}px)`;
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
