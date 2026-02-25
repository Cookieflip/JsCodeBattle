// === CONFIGURACIÓN Y ESTADO GLOBAL ===
const GameState = {
    vidaEnemigo: 100,
    vidaJugador: 100,
    manaJugador: 50,
    nivelActual: 0,
    vidaMaximaEnemigo: 100,
    vidaMaximaJugador: 100,
    manaMaximoJugador: 50,
    turnoJugador: true,
    jugando: false, // Controla si el combate está activo
    bloqueado: false // Evita que el usuario ejecute código durante animaciones
};

// === DEFINICIÓN DE NIVELES ===
const niveles = [
    {nombre: "Bug Novato", vida: 80, danio: 8, sprite: "assets/Fase1-level1.png", escala: 3.5, fase:"PRINCIPIANTE"},
    {nombre: "Script Malicioso", vida: 120, danio: 12, sprite: "assets/Fase1-level2.png", escala: 4, fase:"PRINCIPIANTE"},
    {nombre: "Error de Memoria", vida: 180, danio: 18, sprite: "assets/Fase1-level3.png", escala: 4.5, fase:"PRINCIPIANTE"},
    {nombre: "Enemigo Penudo", vida: 100, danio: 10, sprite: "assets/Fase2-level1.png", escala: 3.5, fase:"INTERMEDIO"},
    {nombre: "Enemigo Mas Penudo", vida: 150, danio: 15, sprite: "assets/Fase2-level2.png", escala: 2.6, fase:"INTERMEDIO"},
    {nombre: "Enemigo Ultra Penudo", vida: 200, danio: 20, sprite: "assets/Fase2-level3.png", escala: 1.9, fase:"INTERMEDIO"},
    {nombre: "Enemigo Cabron", vida: 120, danio: 15, sprite: "assets/Fase3-level1.png", escala: 3.4, fase:"AVANZADO"},
    {nombre: "Enemigo Cabronazo", vida: 180, danio: 22, sprite: "assets/Fase3-level2.png", escala: 2, fase:"AVANZADO"},
    {nombre: "Enemigo Ultra Cabron", vida: 250, danio: 30, sprite: "assets/Fase3-level3.png", escala: 3.5, fase:"AVANZADO"},
];

// === NAVEGACIÓN ===
function irANombre() {
    document.getElementById('pantalla-bienvenida').style.display = 'none';
    document.getElementById('pantalla-nombre').style.display = 'block';
}

function irASeleccion() {
    const nombre = document.getElementById('input-nombre').value;
    if (!nombre.trim()) return alert("¡Introduce tu nombre de coder!");
    document.getElementById('pantalla-nombre').style.display = 'none';
    document.getElementById('pantalla-seleccion').style.display = 'block';
}

function seleccionarClase(clase) {
    document.getElementById('nombre-personaje-txt').innerText = `${document.getElementById('input-nombre').value} (${clase})`;
    const container = document.getElementById('contenedor-sprite-jugador');
    
    // Guardamos la escala en una variable
    const escala = (clase === "guerrero") ? 4 : 3;

    // 🎯 IMPORTANTE: Pasamos la escala normal Y la variable CSS --escala-actual
    container.innerHTML = `
        <div class="sprite-contenedor">
            <div class="sprite-animado ${clase}-sprite" 
                 style="transform: scale(${escala}); --escala-actual: ${escala};">
            </div>
        </div>`;

    document.getElementById('pantalla-seleccion').style.display = 'none';
    document.getElementById('contenedor-juego').style.display = 'block';
    
    GameState.jugando = true;
    cargarNivel();
}

// === MOTOR DE UI ===
function actualizarUI() {
    // Vida Enemigo
    const porcEnemigo = (GameState.vidaEnemigo / GameState.vidaMaximaEnemigo) * 100;
    document.getElementById('valor-vida-enemigo').innerText = Math.ceil(GameState.vidaEnemigo);
    document.getElementById('vida-enemigo-relleno').style.width = `${porcEnemigo}%`;
    
    // Vida Jugador
    const porcJugador = (GameState.vidaJugador / GameState.vidaMaximaJugador) * 100;
    document.getElementById('valor-vida-jugador').innerText = Math.ceil(GameState.vidaJugador);
    document.getElementById('vida-jugador-relleno').style.width = `${porcJugador}%`;
    
    // Maná
    const porcMana = (GameState.manaJugador / GameState.manaMaximoJugador) * 100;
    document.getElementById('valor-mana-jugador').innerText = Math.ceil(GameState.manaJugador);
    const mBarra = document.getElementById('mana-jugador-relleno');
    if(mBarra) mBarra.style.width = `${porcMana}%`;
}

function escribirLog(mensaje, tipo = "sistema") {
    const contenedor = document.getElementById('contenedor-mensajes');
    const p = document.createElement('p');
    p.className = `entrada-log ${tipo}`;
    p.innerText = mensaje;
    contenedor.appendChild(p);
    contenedor.scrollTop = contenedor.scrollHeight;
}

// === ACCIONES DEL JUGADOR ===
function atacar() {
    if (!GameState.turnoJugador || GameState.bloqueado || !GameState.jugando) return;
    
    GameState.bloqueado = true;
    const danio = 25;
    GameState.vidaEnemigo = Math.max(0, GameState.vidaEnemigo - danio);
    
    animarAccion(".enemigo-sprite", "recibir-daño");
    escribirLog(`⚔️ Comando 'atacar' ejecutado: -${danio} HP`, "jugador");
    
    procesarPostAccion();
}

function curar() {
    const coste = 20;
    if (!GameState.turnoJugador || GameState.bloqueado || !GameState.jugando) return;
    
    if (GameState.manaJugador < coste) {
        escribirLog("❌ Error: Insufficient Mana", "sistema");
        return;
    }
    
    GameState.bloqueado = true;
    GameState.manaJugador -= coste;
    GameState.vidaJugador = Math.min(GameState.vidaMaximaJugador, GameState.vidaJugador + 35);
    
    animarAccion("#contenedor-sprite-jugador .sprite-animado", "curar-animacion");
    escribirLog(`✨ Refactorización (Curar): +35 HP`, "jugador");
    
    procesarPostAccion();
}

function especial() {
    const coste = 40;
    if (!GameState.turnoJugador || GameState.bloqueado || !GameState.jugando) return;
    
    if (GameState.manaJugador < coste) {
        escribirLog("❌ Error: Insufficient Mana para Especial", "sistema");
        return;
    }

    GameState.bloqueado = true;
    GameState.manaJugador -= coste;
    GameState.vidaEnemigo = Math.max(0, GameState.vidaEnemigo - 60);

    animarAccion(".enemigo-sprite", "recibir-daño");
    escribirLog(`🔥 CRITICAL DEPLOY: -60 HP al enemigo.`, "jugador");

    procesarPostAccion();
}

// === LÓGICA DE FLUJO Y TURNO ENEMIGO ===
function procesarPostAccion() {
    actualizarUI();
    
    if (GameState.vidaEnemigo <= 0) {
        GameState.bloqueado = false;
        gestionarVictoria();
    } else {
        GameState.turnoJugador = false;
        setTimeout(turnoEnemigo, 1000);
    }
}

function turnoEnemigo() {
    if (!GameState.jugando || GameState.vidaEnemigo <= 0) return;
    
    const nivel = niveles[GameState.nivelActual];
    escribirLog(`👾 ${nivel.nombre} está compilando ataque...`, "sistema");

    setTimeout(() => {
        // 1. Lógica de stats
        GameState.vidaJugador = Math.max(0, GameState.vidaJugador - nivel.danio);
        GameState.manaJugador = Math.min(GameState.manaMaximoJugador, GameState.manaJugador + 12);
        
        // 2. Visuales
        actualizarUI();
        
        // Buscamos específicamente el sprite del jugador para animarlo
        const miSprite = document.querySelector("#contenedor-sprite-jugador .sprite-animado");
        if (miSprite) {
            animarAccion("#contenedor-sprite-jugador .sprite-animado", "recibir-daño");
        }

        escribirLog(`💔 Recibiste ${nivel.danio} de daño. (+12 Maná)`, "sistema");

        // 3. Comprobación de estado
        if (GameState.vidaJugador <= 0) {
            GameState.jugando = false;
            escribirLog("💀 STACK OVERFLOW: Game Over.", "sistema");
            alert("Has sido derrotado. Recarga la página para reintentar.");
        } else {
            GameState.turnoJugador = true;
            GameState.bloqueado = false;
            escribirLog("👉 Tu turno. ¡Escribe código!", "sistema");
        }
    }, 1200);
}

// === SISTEMA DE NIVELES Y ANIMACIONES ===
function cargarNivel() {
    const nivel = niveles[GameState.nivelActual];
    if (!nivel) return;

    GameState.vidaEnemigo = nivel.vida;
    GameState.vidaMaximaEnemigo = nivel.vida;
    GameState.bloqueado = false;
    GameState.turnoJugador = true;

    if (GameState.nivelActual === 0 || nivel.fase !== niveles[GameState.nivelActual - 1].fase) {
        mostrarCambioFase(nivel.fase);
    }

    document.querySelector("#area-enemigo .nombre").innerText = nivel.nombre;
    const enemigoSprite = document.querySelector(".enemigo-sprite");
    
    enemigoSprite.classList.remove("morir");
    enemigoSprite.style.backgroundImage = `url('${nivel.sprite}')`;
    
    // 🎯 AQUÍ ESTÁ EL TRUCO:
    // Seteamos la escala normal y la variable para la animación
    enemigoSprite.style.transform = `scale(${nivel.escala})`;
    enemigoSprite.style.setProperty("--escala-actual", nivel.escala); 
    
    actualizarUI();
    escribirLog(`🚩 NIVEL ${GameState.nivelActual + 1}: ${nivel.nombre}`, "sistema");
}

function gestionarVictoria() {
    document.querySelector(".enemigo-sprite").classList.add("morir");
    escribirLog("✅ Bug corregido con éxito.", "sistema");
    
    GameState.nivelActual++;
    if (GameState.nivelActual < niveles.length) {
        setTimeout(cargarNivel, 2000);
    } else {
        escribirLog("🏆 ¡FELICIDADES! Eres un Senior Developer.", "sistema");
        GameState.jugando = false;
    }
}

function animarAccion(selector, clase) {
    const el = document.querySelector(selector);
    if (!el) return;

    // 1. Limpiamos TODAS las posibles clases de animación antes de poner la nueva
    el.classList.remove("recibir-daño", "curar-animacion");
    
    // 2. El truco del "magic trick" para resetear el estado del DOM
    void el.offsetWidth; 
    
    // 3. Ponemos la animación que toca
    el.classList.add(clase);
}

function mostrarCambioFase(nombreFase) {
    const overlay = document.getElementById("fase-overlay");
    const texto = document.getElementById("fase-texto");
    if(!overlay || !texto) return;
    texto.innerText = "FASE: " + nombreFase;
    overlay.classList.remove("mostrar");
    void overlay.offsetWidth; 
    overlay.classList.add("mostrar");
}

// === EJECUTOR DE CÓDIGO (Sandbox) ===
document.getElementById('boton-ejecutar').addEventListener('click', () => {
    if (!GameState.turnoJugador || GameState.bloqueado || !GameState.jugando) return;

    const editor = document.getElementById('entrada-js');
    const codigo = editor.value;

    try {
        const context = {
            atacar: atacar,
            curar: curar,
            especial: especial,
            vida: GameState.vidaJugador,
            mana: GameState.manaJugador,
            enemigo: GameState.vidaEnemigo
        };

        const execute = new Function(...Object.keys(context), codigo);
        execute(...Object.values(context));
        
        editor.value = ""; 
    } catch (e) {
        escribirLog(`❌ Error: ${e.message}`, "sistema");
    }
});