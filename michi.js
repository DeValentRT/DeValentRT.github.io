// 📐 Escalado automático del canvas
function ajustarEscala() {
    const scale = Math.min(window.innerWidth / 135, window.innerHeight / 240);
    document.getElementById('michi-canvas').style.transform = `scale(${scale})`;
}

// 🔗 Obtener modo de juego desde la URL
function obtenerModoJuego() {
    const params = new URLSearchParams(window.location.search);
    return params.get('modo'); // 'local' o 'ia'
}

// 🔙 Botón para regresar a minijuegos
function configurarBotonCerrar() {
    const cerrar = document.getElementById('boton-cerrar');
    cerrar.addEventListener('click', () => {
        window.location.href = 'minijuegos.html';
    });
    cerrar.addEventListener('touchstart', e => {
        e.stopPropagation();
        window.location.href = 'minijuegos.html';
    }, { passive: true });
}

// 👁️ Indicador visual del modo IA
function mostrarIndicadorIA() {
    const iaImg = document.createElement('img');
    iaImg.src = 'button/ia.png';
    iaImg.alt = 'Modo IA';
    Object.assign(iaImg.style, {
        position: 'absolute',
        top: '10px',
        left: '10px',
        width: '32px',
        height: '32px',
        zIndex: '9',
        imageRendering: 'pixelated'
    });
    iaImg.id = 'indicador-ia';
    document.getElementById('michi-canvas').appendChild(iaImg);
}

// 🎭 Reacción visual de la IA tras jugada del jugador
function mostrarReaccionIA() {
    const index = Math.floor(Math.random() * 7) + 1;
    const reaccion = document.createElement('img');
    reaccion.src = `stickers/reaction${index}.png`;
    reaccion.alt = 'Reacción IA';
    Object.assign(reaccion.style, {
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '32px',
        height: '32px',
        zIndex: '8',
        imageRendering: 'pixelated'
    });
    reaccion.id = 'ia-reaccion';
    document.getElementById('michi-canvas').appendChild(reaccion);

    setTimeout(() => {
        const r = document.getElementById('ia-reaccion');
        if (r) r.remove();
    }, 3000);
}

// 🧱 Combinaciones ganadoras
function obtenerCombinaciones() {
    return [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [2, 4, 6], [0, 4, 8]
    ];
}

// 🎮 Modo multijugador local
function activarMultijugadorLocal() {
    let turno = 'X';
    let tablero = Array(9).fill('');
    let bloqueado = false;
    const combinaciones = obtenerCombinaciones();

    for (let i = 0; i < 9; i++) {
        const casilla = document.getElementById(`casilla${i}`);
        const marcar = () => {
            if (bloqueado || tablero[i] !== '') return;
            
            // Aplicar animación
            casilla.style.transform = 'scale(0.85)';
            setTimeout(() => {
                casilla.style.transform = 'scale(1)';
                colocarFicha(i, turno, casilla);
                tablero[i] = turno;

                const resultado = verificarGanador(tablero, combinaciones);
                if (resultado) {
                    mostrarWin(resultado.index + 1);
                    bloqueado = true;
                    setTimeout(() => reiniciarJuego('local'), 4000);
                } else if (tablero.every(c => c !== '')) {
                    bloqueado = true;
                    setTimeout(() => reiniciarJuego('local'), 4000);
                } else {
                    turno = turno === 'X' ? 'O' : 'X';
                }
            }, 100);
        };
        
        casilla.addEventListener('click', marcar);
        casilla.addEventListener('touchstart', e => {
            e.preventDefault();
            casilla.style.transform = 'scale(0.85)';
        }, { passive: false });
        
        casilla.addEventListener('touchend', () => {
            casilla.style.transform = 'scale(1)';
            marcar();
        });
    }
}

// 🤖 Modo contra IA
function activarModoIA() {
    mostrarIndicadorIA();
    let turno = 'X';
    let tablero = Array(9).fill('');
    let bloqueado = false;
    const combinaciones = obtenerCombinaciones();

    for (let i = 0; i < 9; i++) {
        const casilla = document.getElementById(`casilla${i}`);
        const marcar = () => {
            if (bloqueado || turno !== 'X' || tablero[i] !== '') return;
            
            // Aplicar animación
            casilla.style.transform = 'scale(0.85)';
            setTimeout(() => {
                casilla.style.transform = 'scale(1)';
                colocarFicha(i, 'X', casilla);
                tablero[i] = 'X';
                mostrarReaccionIA();

                const resultado = verificarGanador(tablero, combinaciones);
                if (resultado) {
                    mostrarWin(resultado.index + 1);
                    bloqueado = true;
                    setTimeout(() => reiniciarJuego('ia'), 4000);
                } else if (tablero.every(c => c !== '')) {
                    bloqueado = true;
                    setTimeout(() => reiniciarJuego('ia'), 4000);
                } else {
                    turno = 'O';
                    setTimeout(() => iaResponder(), 500);
                }
            }, 100);
        };
        
        casilla.addEventListener('click', marcar);
        casilla.addEventListener('touchstart', e => {
            e.preventDefault();
            casilla.style.transform = 'scale(0.85)';
        }, { passive: false });
        
        casilla.addEventListener('touchend', () => {
            casilla.style.transform = 'scale(1)';
            marcar();
        });
    }

    function iaResponder() {
        if (bloqueado || turno !== 'O') return;
        const vacias = tablero.map((v, i) => v === '' ? i : null).filter(i => i !== null);
        const index = vacias[Math.floor(Math.random() * vacias.length)];
        const casilla = document.getElementById(`casilla${index}`);
        colocarFicha(index, 'O', casilla);
        tablero[index] = 'O';

        const resultado = verificarGanador(tablero, combinaciones);
        if (resultado) {
            mostrarWin(resultado.index + 1);
            bloqueado = true;
            setTimeout(() => reiniciarJuego('ia'), 4000);
        } else if (tablero.every(c => c !== '')) {
            bloqueado = true;
            setTimeout(() => reiniciarJuego('ia'), 4000);
        } else {
            turno = 'X';
        }
    }
}


// 🧩 Colocar ficha visual
function colocarFicha(i, tipo, casillaRef) {
    const ficha = document.createElement('img');
    ficha.src = tipo === 'X'
        ? 'button/x.png'
        : 'button/o.png';

    const estilo = window.getComputedStyle(casillaRef);
    Object.assign(ficha.style, {
        position: 'absolute',
        width: '32px',
        height: '32px',
        left: estilo.left,
        top: estilo.top,
        zIndex: '5',
        imageRendering: 'pixelated'
    });

    ficha.id = `ficha-${i}`;
    ficha.alt = tipo;
    document.getElementById('michi-canvas').appendChild(ficha);
}

// 🏆 Verificación de victoria
function verificarGanador(tablero, combinaciones) {
    for (let i = 0; i < combinaciones.length; i++) {
        const [a, b, c] = combinaciones[i];
        if (tablero[a] && tablero[a] === tablero[b] && tablero[a] === tablero[c]) {
            return { jugador: tablero[a], index: i };
        }
    }
    return null;
}

// 🖼️ Imagen de victoria
function mostrarWin(winIndex) {
    const winImg = document.createElement('img');
    winImg.src = `michi_win/win${winIndex}.png`;
    Object.assign(winImg.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '135px',
        height: '240px',
        zIndex: '10',
        imageRendering: 'pixelated'
    });
    winImg.id = 'win-img';
    document.getElementById('michi-canvas').appendChild(winImg);
}

// 🔁 Reinicio del juego respetando el modo
function reiniciarJuego(modo) {
    const canvas = document.getElementById('michi-canvas');

    // 🧹 Eliminar fichas
    for (let i = 0; i < 9; i++) {
        const ficha = document.getElementById(`ficha-${i}`);
        if (ficha) canvas.removeChild(ficha);
    }

    // 🧹 Eliminar imagen de victoria
    const winImg = document.getElementById('win-img');
    if (winImg) canvas.removeChild(winImg);

    // 🧹 Eliminar reacción IA si existe
    const reaccion = document.getElementById('ia-reaccion');
    if (reaccion) canvas.removeChild(reaccion);

    // ✅ Reiniciar según modo
    if (modo === 'local') {
        activarMultijugadorLocal();
    } else {
        const indicador = document.getElementById('indicador-ia');
        if (!indicador) mostrarIndicadorIA();
        activarModoIA();
    }
}
// 🚀 Inicialización principal al cargar
document.addEventListener('DOMContentLoaded', () => {
    ajustarEscala();
    configurarBotonCerrar();

    const modo = obtenerModoJuego();
    if (modo === 'local') {
        activarMultijugadorLocal();
    } else if (modo === 'ia') {
        activarModoIA();
    }

    window.addEventListener('resize', ajustarEscala);
});