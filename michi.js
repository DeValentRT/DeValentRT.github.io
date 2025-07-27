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

// ====== FUNCIÓN DE ESCALADO ======
function ajustarEscala() {
    const windowRatio = window.innerWidth / window.innerHeight;
    const gameRatio = 135 / 240;
    let scale;
    
    if (windowRatio > gameRatio) {
        scale = window.innerHeight / 240;
    } else {
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
    const manejarClic = () => {
        window.location.href = MICHI.rutas.cerrar;
    };

    // Evento para click (computadora)
    MICHI.elementos.botonCerrar.addEventListener('click', manejarClic);
    
    // Eventos para touch (móvil)
    MICHI.elementos.botonCerrar.addEventListener('touchstart', (e) => {
        e.preventDefault();
        MICHI.elementos.botonCerrar.style.transform = 'scale(0.85)';
    }, { passive: false });
    
    MICHI.elementos.botonCerrar.addEventListener('touchend', (e) => {
        e.preventDefault();
        MICHI.elementos.botonCerrar.style.transform = 'scale(1)';
        setTimeout(manejarClic, 100); // Pequeño retraso para la animación
    });
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

function buscarJugadaGanadora(tableroActual, jugador) {
    const combinaciones = obtenerCombinacionesGanadoras();
    
    for (const combo of combinaciones) {
        const [a, b, c] = combo;
        if (tableroActual[a] === jugador && tableroActual[b] === jugador && tableroActual[c] === '') return c;
        if (tableroActual[a] === jugador && tableroActual[c] === jugador && tableroActual[b] === '') return b;
        if (tableroActual[b] === jugador && tableroActual[c] === jugador && tableroActual[a] === '') return a;
    }
    
    return null;
}

function colocarFicha(index, tipo) {
    const ficha = document.createElement('img');
    ficha.src = MICHI.rutas.fichas[tipo];
    ficha.alt = tipo;
    ficha.id = `ficha-${index}`;
    
    const posiciones = [
        {top: '55px', left: '8px'},   // casilla0
        {top: '55px', left: '51px'},  // casilla1
        {top: '55px', left: '94px'},  // casilla2
        {top: '102px', left: '8px'},  // casilla3
        {top: '102px', left: '51px'}, // casilla4
        {top: '102px', left: '94px'}, // casilla5
        {top: '149px', left: '8px'},  // casilla6
        {top: '149px', left: '51px'}, // casilla7
        {top: '149px', left: '94px'}  // casilla8
    ];
    
    Object.assign(ficha.style, {
        position: 'absolute',
        width: '32px',
        height: '32px',
        left: posiciones[index].left,
        top: posiciones[index].top,
        zIndex: '5',
        imageRendering: 'pixelated'
    });
    
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
    Object.assign(winImg.style, {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: '10',
        imageRendering: 'pixelated'
    });
    MICHI.elementos.canvas.appendChild(winImg);
}

function reiniciarJuego(modo) {
    ['win-img', 'indicador-ia', 'ia-reaccion'].forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.remove();
    });

    for (let i = 0; i < 9; i++) {
        const ficha = document.getElementById(`ficha-${i}`);
        if (ficha) ficha.remove();
    }

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
        const manejarJugada = () => {
            if (!juegoActivo || tablero[index] !== '') return;

            casilla.style.transform = 'scale(0.85)';
            setTimeout(() => {
                casilla.style.transform = 'scale(1)';
                
                tablero[index] = turno;
                colocarFicha(index, turno);

                const resultado = verificarGanador(tablero);
                if (resultado) {
                    juegoActivo = false;
                    mostrarGanador(resultado.combinacion);
                    setTimeout(() => reiniciarJuego('local'), 3000);
                } else if (!tablero.includes('')) {
                    juegoActivo = false;
                    setTimeout(() => reiniciarJuego('local'), 1000);
                } else {
                    turno = turno === 'X' ? 'O' : 'X';
                }
            }, 100);
        };

        casilla.onclick = manejarJugada;
        casilla.addEventListener('touchend', (e) => {
            e.preventDefault();
            manejarJugada();
        });
        
        casilla.addEventListener('touchstart', (e) => {
            e.preventDefault();
            casilla.style.transform = 'scale(0.85)';
        }, { passive: false });
    });
}

function iniciarModoIA() {
    let turno = 'X';
    let tablero = Array(9).fill('');
    let juegoActivo = true;

    function movimientoIA() {
        if (!juegoActivo || turno !== 'O') return;

        let movimiento = buscarJugadaGanadora(tablero, 'O');
        if (movimiento === null) movimiento = buscarJugadaGanadora(tablero, 'X');
        if (movimiento === null && tablero[4] === '') movimiento = 4;
        if (movimiento === null) {
            const esquinas = [0, 2, 6, 8];
            const esquinasLibres = esquinas.filter(index => tablero[index] === '');
            if (esquinasLibres.length > 0) {
                movimiento = esquinasLibres[Math.floor(Math.random() * esquinasLibres.length)];
            }
        }
        if (movimiento === null) {
            const movimientosDisponibles = tablero
                .map((valor, index) => valor === '' ? index : null)
                .filter(index => index !== null);
            if (movimientosDisponibles.length > 0) {
                movimiento = movimientosDisponibles[Math.floor(Math.random() * movimientosDisponibles.length)];
            }
        }

        if (movimiento !== null) {
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
        const manejarJugada = () => {
            if (!juegoActivo || turno !== 'X' || tablero[index] !== '') return;

            casilla.style.transform = 'scale(0.85)';
            setTimeout(() => {
                casilla.style.transform = 'scale(1)';
                
                tablero[index] = turno;
                colocarFicha(index, turno);

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

        casilla.onclick = manejarJugada;
        casilla.addEventListener('touchend', (e) => {
            e.preventDefault();
            manejarJugada();
        });
        
        casilla.addEventListener('touchstart', (e) => {
            e.preventDefault();
            casilla.style.transform = 'scale(0.85)';
        }, { passive: false });
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
