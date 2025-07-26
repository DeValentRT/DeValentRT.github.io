// ====== CONFIGURACIÓN ======
const MICHI = {
    elementos: {
        canvas: document.getElementById('michi-canvas'),
        botonCerrar: document.getElementById('boton-cerrar'),
        casillas: Array.from({ length: 9 }, (_, i) => document.getElementById(`casilla${i}`))
    },
    rutas: {
        cerrar: 'minijuegos.html',
        fichas: {
            X: 'button/x.png',
            O: 'button/o.png'
        },
        victorias: Array.from({ length: 8 }, (_, i) => `michi_win/win${i+1}.png`),
        reaccionesIA: Array.from({ length: 7 }, (_, i) => `stickers/reaction${i+1}.png`)
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
    
    MICHI.elementos.canvas.style.transform = `scale(${scale})`;
}

// ====== FUNCIONES DEL JUEGO ======
function obtenerModoJuego() {
    const params = new URLSearchParams(window.location.search);
    return params.get('modo') || 'local';
}

function configurarBotonCerrar() {
    MICHI.elementos.botonCerrar.addEventListener('click', () => {
        window.location.href = MICHI.rutas.cerrar;
    });
    
    MICHI.elementos.botonCerrar.addEventListener('touchstart', (e) => {
        e.preventDefault();
    }, { passive: false });
}

function mostrarIndicadorIA() {
    const indicador = document.createElement('img');
    indicador.src = 'button/ia.png';
    indicador.alt = 'Modo IA';
    indicador.id = 'indicador-ia';
    MICHI.elementos.canvas.appendChild(indicador);
}

function mostrarReaccionIA() {
    const randomIndex = Math.floor(Math.random() * MICHI.rutas.reaccionesIA.length);
    const reaccion = document.createElement('img');
    reaccion.src = MICHI.rutas.reaccionesIA[randomIndex];
    reaccion.alt = 'Reacción IA';
    reaccion.id = 'ia-reaccion';
    MICHI.elementos.canvas.appendChild(reaccion);

    setTimeout(() => {
        const elemento = document.getElementById('ia-reaccion');
        if (elemento) elemento.remove();
    }, 3000);
}

function obtenerCombinacionesGanadoras() {
    return [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontales
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticales
        [0, 4, 8], [2, 4, 6]             // Diagonales
    ];
}

function colocarFicha(index, tipo) {
    const ficha = document.createElement('img');
    ficha.src = MICHI.rutas.fichas[tipo];
    ficha.alt = tipo;
    ficha.id = `ficha-${index}`;
    ficha.style.position = 'absolute';
    ficha.style.width = '32px';
    ficha.style.height = '32px';
    ficha.style.left = MICHI.elementos.casillas[index].style.left;
    ficha.style.top = MICHI.elementos.casillas[index].style.top;
    ficha.style.zIndex = '5';
    ficha.style.imageRendering = 'pixelated';
    MICHI.elementos.canvas.appendChild(ficha);
}

function verificarGanador(tablero) {
    const combinaciones = obtenerCombinacionesGanadoras();
    for (let i = 0; i < combinaciones.length; i++) {
        const [a, b, c] = combinaciones[i];
        if (tablero[a] && tablero[a] === tablero[b] && tablero[a] === tablero[c]) {
            return { jugador: tablero[a], combinacion: i };
        }
    }
    return null;
}

function mostrarGanador(combinacionIndex) {
    const winImg = document.createElement('img');
    winImg.src = MICHI.rutas.victorias[combinacionIndex];
    winImg.id = 'win-img';
    winImg.style.position = 'absolute';
    winImg.style.width = '100%';
    winImg.style.height = '100%';
    winImg.style.zIndex = '10';
    winImg.style.imageRendering = 'pixelated';
    MICHI.elementos.canvas.appendChild(winImg);
}

function reiniciarJuego(modo) {
    // Limpiar elementos dinámicos
    ['win-img', 'indicador-ia', 'ia-reaccion'].forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.remove();
    });

    // Limpiar fichas
    for (let i = 0; i < 9; i++) {
        const ficha = document.getElementById(`ficha-${i}`);
        if (ficha) ficha.remove();
    }

    // Reiniciar según modo
    if (modo === 'ia') {
        mostrarIndicadorIA();
        iniciarModoIA();
    } else {
        iniciarModoLocal();
    }
}

function iniciarModoLocal() {
    let turno = 'X';
    let tablero = Array(9).fill('');
    let juegoActivo = true;

    MICHI.elementos.casillas.forEach((casilla, index) => {
        casilla.onclick = casilla.ontouchend = () => {
            if (!juegoActivo || tablero[index] !== '') return;

            // Animación
            casilla.style.transform = 'scale(0.85)';
            setTimeout(() => {
                casilla.style.transform = 'scale(1)';
                
                // Colocar ficha
                tablero[index] = turno;
                colocarFicha(index, turno);

                // Verificar ganador
                const resultado = verificarGanador(tablero);
                if (resultado) {
                    juegoActivo = false;
                    mostrarGanador(resultado.combinacion);
                    setTimeout(() => reiniciarJuego('local'), 3000);
                } else if (!tablero.includes('')) {
                    // Empate
                    juegoActivo = false;
                    setTimeout(() => reiniciarJuego('local'), 1000);
                } else {
                    // Cambiar turno
                    turno = turno === 'X' ? 'O' : 'X';
                }
            }, 100);
        };

        casilla.ontouchstart = (e) => {
            e.preventDefault();
            casilla.style.transform = 'scale(0.85)';
        };
    });
}

function iniciarModoIA() {
    let turno = 'X';
    let tablero = Array(9).fill('');
    let juegoActivo = true;

    function movimientoIA() {
        if (!juegoActivo || turno !== 'O') return;

        // IA simple: movimiento aleatorio
        const movimientosDisponibles = tablero
            .map((valor, index) => valor === '' ? index : null)
            .filter(index => index !== null);

        if (movimientosDisponibles.length > 0) {
            const movimiento = movimientosDisponibles[Math.floor(Math.random() * movimientosDisponibles.length)];
            
            setTimeout(() => {
                tablero[movimiento] = 'O';
                colocarFicha(movimiento, 'O');
                mostrarReaccionIA();

                const resultado = verificarGanador(tablero);
                if (resultado) {
                    juegoActivo = false;
                    mostrarGanador(resultado.combinacion);
                    setTimeout(() => reiniciarJuego('ia'), 3000);
                } else if (!tablero.includes('')) {
                    juegoActivo = false;
                    setTimeout(() => reiniciarJuego('ia'), 1000);
                } else {
                    turno = 'X';
                }
            }, 500);
        }
    }

    MICHI.elementos.casillas.forEach((casilla, index) => {
        casilla.onclick = casilla.ontouchend = () => {
            if (!juegoActivo || turno !== 'X' || tablero[index] !== '') return;

            // Animación
            casilla.style.transform = 'scale(0.85)';
            setTimeout(() => {
                casilla.style.transform = 'scale(1)';
                
                // Colocar ficha
                tablero[index] = turno;
                colocarFicha(index, turno);

                // Verificar ganador
                const resultado = verificarGanador(tablero);
                if (resultado) {
                    juegoActivo = false;
                    mostrarGanador(resultado.combinacion);
                    setTimeout(() => reiniciarJuego('ia'), 3000);
                } else if (!tablero.includes('')) {
                    juegoActivo = false;
                    setTimeout(() => reiniciarJuego('ia'), 1000);
                } else {
                    turno = 'O';
                    movimientoIA();
                }
            }, 100);
        };

        casilla.ontouchstart = (e) => {
            e.preventDefault();
            casilla.style.transform = 'scale(0.85)';
        };
    });
}

// ====== INICIALIZACIÓN ======
function init() {
    ajustarEscala();
    configurarBotonCerrar();
    
    const modo = obtenerModoJuego();
    if (modo === 'ia') {
        mostrarIndicadorIA();
        iniciarModoIA();
    } else {
        iniciarModoLocal();
    }

    window.addEventListener('resize', ajustarEscala);
    window.addEventListener('orientationchange', ajustarEscala);
}

document.addEventListener('DOMContentLoaded', init);
