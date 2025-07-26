// 📐 Escalado adaptativo
function ajustarEscala() {
    const scale = Math.min(
        window.innerWidth / 135,
        window.innerHeight / 240
    );
    document.getElementById('interfaz2-canvas').style.transform = `scale(${scale})`;
}

// 🔙 Botón cerrar interfaz
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

// 🎮 Botones de dificultad
function configurarBotonesDificultad() {
    const niveles = {
        dif1: 'facil',
        dif2: 'media',
        dif3: 'dificil'
    };

    for (const id in niveles) {
        const btn = document.getElementById(id);
        if (!btn) continue;

        btn.addEventListener('click', () => {
            window.location.href = `Tperiodica.html?nivel=${niveles[id]}`;
        });

        btn.addEventListener('touchstart', e => {
            e.stopPropagation();
            window.location.href = `Tperiodica.html?nivel=${niveles[id]}`;
        }, { passive: true });
    }
}

// 🚀 Inicializar interfaz
document.addEventListener('DOMContentLoaded', () => {
    ajustarEscala();
    configurarBotonCerrar();
    configurarBotonesDificultad();
    window.addEventListener('resize', ajustarEscala);
});