// ====== CONFIGURACIÓN ======
const CONFIG = {
    dificultades: {
        facil: {
            vidas: 3,
            tiempo: 30000,
            ayudaFamilia: true,
            ayudaGrupo: true,
            fondoExtra: true
        },
        medio: {
            vidas: 3,
            tiempo: 18000,
            ayudaFamilia: true,
            ayudaGrupo: false,
            fondoExtra: false
        },
        dificil: {
            vidas: 1,
            tiempo: 12000,
            ayudaFamilia: false,
            ayudaGrupo: false,
            fondoExtra: false
        }
    },
    rutas: {
        elementos: 'elements/elemento',
        familias: 'familia/familia',
        grupos: 'grupo/grupo',
        mensajes: 'mensaje/',
        vidas: 'lives/',
        tiempo: 'time/time'
    }
};

// ====== VARIABLES GLOBALES ======
let dificultadActual = 'facil';
let vidas = 3;
let elementosPendientes = [];
let elementoActual = null;
let temporizador = null;
let juegoActivo = true;

// ====== FUNCIONES DE INICIO ======
function iniciarJuego() {
    ajustarEscala();
    configurarBotones();
    configurarDificultad();
    reiniciarEstadoJuego();
}

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
    
    document.getElementById('tabla-canvas').style.transform = `scale(${scale})`;
    
    window.addEventListener('resize', ajustarEscala);
    window.addEventListener('orientationchange', ajustarEscala);
}

function configurarBotones() {
    // Botón de cerrar
    document.getElementById('boton-cerrar').addEventListener('click', () => {
        window.location.href = 'minijuegos.html';
    });
    
    document.getElementById('boton-cerrar').addEventListener('touchstart', (e) => {
        e.preventDefault();
    }, { passive: false });

    // Configurar eventos para todas las casillas
    for (let i = 1; i <= 50; i++) {
        const casilla = document.getElementById(`elemento${i}`);
        if (casilla) {
            casilla.addEventListener('click', () => manejarClickCasilla(i));
            casilla.addEventListener('touchstart', (e) => {
                e.preventDefault();
                manejarClickCasilla(i);
            }, { passive: false });
        }
    }
}

function configurarDificultad() {
    const params = new URLSearchParams(window.location.search);
    let nivel = params.get('nivel');
    
    // Normalizar nombre de dificultad
    if (nivel === 'media') nivel = 'medio';
    
    dificultadActual = CONFIG.dificultades[nivel] ? nivel : 'facil';
    vidas = CONFIG.dificultades[dificultadActual].vidas;
    
    // Mostrar ayudas visuales según dificultad
    document.getElementById('indicador-facil').style.display = 
        CONFIG.dificultades[dificultadActual].fondoExtra ? 'block' : 'none';
    document.getElementById('vidas-facil').style.display = 'block';
    actualizarVidas();
}

// ====== LÓGICA DEL JUEGO ======
function reiniciarEstadoJuego() {
    clearInterval(temporizador);
    juegoActivo = true;
    elementosPendientes = Array.from({ length: 50 }, (_, i) => i + 1);
    vidas = CONFIG.dificultades[dificultadActual].vidas;
    
    // Limpiar elementos marcados
    document.querySelectorAll('[data-completado]').forEach(el => el.remove());
    
    document.getElementById('mensaje-final').style.display = 'none';
    actualizarVidas();
    iniciarRonda();
}

function iniciarRonda() {
    if (!juegoActivo) return;
    
    // Verificar si ganó
    if (elementosPendientes.length === 0) {
        mostrarMensajeFinal('mensaje3');
        return;
    }
    
    // Seleccionar elemento aleatorio
    const indiceAleatorio = Math.floor(Math.random() * elementosPendientes.length);
    elementoActual = elementosPendientes[indiceAleatorio];
    
    mostrarElemento(elementoActual);
    iniciarTemporizador();
}

function mostrarElemento(id) {
    const config = CONFIG.dificultades[dificultadActual];
    
    // Mostrar símbolo del elemento
    const elementoImg = document.getElementById('elemento-actual');
    elementoImg.src = `${CONFIG.rutas.elementos}${id}.png`;
    elementoImg.style.display = 'block';
    
    // Mostrar familia (si está habilitado)
    const familiaImg = document.getElementById('familia-actual');
    if (config.ayudaFamilia) {
        const familiaId = obtenerFamilia(id);
        familiaImg.src = `${CONFIG.rutas.familias}${familiaId}.png`;
        familiaImg.style.display = 'block';
    } else {
        familiaImg.style.display = 'none';
    }
    
    // Mostrar grupo (si está habilitado)
    const grupoImg = document.getElementById('grupo-actual');
    if (config.ayudaGrupo) {
        const grupoId = obtenerGrupo(id);
        grupoImg.src = `${CONFIG.rutas.grupos}${grupoId}.png`;
        grupoImg.style.display = 'block';
    } else {
        grupoImg.style.display = 'none';
    }
}

function iniciarTemporizador() {
    clearInterval(temporizador);
    const tiempoTotal = CONFIG.dificultades[dificultadActual].tiempo;
    const frames = 24;
    let frameActual = 1;
    
    document.getElementById('barra-tiempo').src = `${CONFIG.rutas.tiempo}1.png`;
    
    temporizador = setInterval(() => {
        frameActual++;
        if (frameActual > frames) {
            clearInterval(temporizador);
            if (juegoActivo) {
                mostrarMensajeFinal('mensaje2');
            }
            return;
        }
        document.getElementById('barra-tiempo').src = `${CONFIG.rutas.tiempo}${frameActual}.png`;
    }, tiempoTotal / frames);
}

function manejarClickCasilla(id) {
    if (!juegoActivo || !elementoActual) return;
    
    if (id === elementoActual) {
        // Respuesta correcta
        marcarElementoCompletado(id);
        elementosPendientes = elementosPendientes.filter(e => e !== id);
        
        // Reiniciar vidas solo en modo fácil
        if (dificultadActual === 'facil') {
            vidas = CONFIG.dificultades.facil.vidas;
            actualizarVidas();
        }
        
        iniciarRonda();
    } else {
        // Respuesta incorrecta
        vidas--;
        actualizarVidas();
        
        if (vidas <= 0) {
            mostrarMensajeFinal('mensaje1');
        }
    }
}

function marcarElementoCompletado(id) {
    const casilla = document.getElementById(`elemento${id}`);
    if (!casilla) return;
    
    const img = document.createElement('img');
    img.src = `${CONFIG.rutas.elementos}${id}.png`;
    img.style.position = 'absolute';
    img.style.width = '16px';
    img.style.height = '16px';
    img.style.top = casilla.style.top;
    img.style.right = casilla.style.right;
    img.style.zIndex = '6';
    img.setAttribute('data-completado', 'true');
    
    document.getElementById('tabla-canvas').appendChild(img);
}

function mostrarMensajeFinal(tipo) {
    juegoActivo = false;
    clearInterval(temporizador);
    
    const mensaje = document.getElementById('mensaje-final');
    const numeroMensaje = tipo.replace('mensaje', '');
    mensaje.src = `${CONFIG.rutas.mensajes}${numeroMensaje}.png`;
    mensaje.style.display = 'block';
    
    setTimeout(() => reiniciarEstadoJuego(), tipo === 'mensaje3' ? 3000 : 2000);
}

// ====== FUNCIONES AUXILIARES ======
function obtenerFamilia(id) {
    if (id === 1) return 9;  // Hidrógeno
    if (id <= 7) return 1;   // Alcalinos
    if (id <= 13) return 2;  // Alcalinotérreos
    if (id <= 19) return 3;  // Boroides
    if (id <= 25) return 4;  // Carbonoides
    if (id <= 31) return 5;  // Nitrogenoides
    if (id <= 37) return 6;  // Calcógenos
    if (id <= 43) return 7;  // Halógenos
    return 8;                // Gases nobles
}

function obtenerGrupo(id) {
    if (id === 1) return 1;  // Hidrógeno
    if (id <= 7) return 1;   // IA
    if (id <= 13) return 2;  // IIA
    if (id <= 19) return 3;  // IIIA
    if (id <= 25) return 4;  // IVA
    if (id <= 31) return 5;  // VA
    if (id <= 37) return 6;  // VIA
    if (id <= 43) return 7;  // VIIA
    return 8;                // VIIIA
}

function actualizarVidas() {
    document.getElementById('vidas-facil').src = `${CONFIG.rutas.vidas}${vidas}.png`;
}

// ====== INICIAR JUEGO ======
document.addEventListener('DOMContentLoaded', iniciarJuego);
