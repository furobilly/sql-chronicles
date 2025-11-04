// ============================================
// SCRIPTUM SQL v1.2 - GAME LOGIC
// ============================================

// Game State
window.gameState = {
  playerName: '',
  avatar: 0,
  xp: 0,
  coins: 0,
  streak: 0,
  lastVisit: null,
  currentChallenge: 1,
  currentSubExercise: 1,
  completedChallenges: [],
  completedSubExercises: {},
  unlockedBadges: [],
  reputation: { lorenzo: 0, sofia: 0 },
  favorites: [],
  diary: [],
  usedContinuitySpell: false,
  attempts: 0,
  exampleUnlocked: false,
  practiceMode: false,
  soundEnabled: true,
  theme: 'light',
  db: null,
  skills: { SELECT: 0, WHERE: 0, ORDER: 0, ADVANCED: 0 }
};

// All Badges
const allBadges = [
  { id: 'primera', name: 'Primera Consulta', icon: '🛡️', desc: 'Completar ejercicio 1.1' },
  { id: 'domador', name: 'Domador de WHERE', icon: '⚔️', desc: 'Completar reto 3' },
  { id: 'ordenador', name: 'Ordenador Maestro', icon: '📖', desc: 'Completar reto 5' },
  { id: 'cazador', name: 'Cazador de Datos', icon: '🔍', desc: 'Completar reto 7' },
  { id: 'conquistador', name: 'Conquistador del Mundo 1', icon: '👑', desc: 'Completar reto 10' },
  { id: 'racha', name: 'Racha de Fuego', icon: '🔥', desc: '7 días consecutivos' },
  { id: 'perfecto', name: 'Perfeccionista', icon: '💎', desc: 'Completar 5 retos sin pistas' },
  { id: 'profesor_select', name: 'Profesor de SELECT', icon: '🎓', desc: 'Dominar todos los ejercicios SELECT' },
  { id: 'detective', name: 'Detective SQL', icon: '🕵️', desc: '20 consultas con WHERE' },
  { id: 'velocista', name: 'Velocista', icon: '⚡', desc: 'Completar un ejercicio en <30s' },
  { id: 'millonario', name: 'Millonario', icon: '💰', desc: 'Acumular 1000 monedas' },
  { id: 'ahorrador', name: 'Ahorrador', icon: '🤑', desc: '5 retos sin usar pistas' },
  { id: 'historiador', name: 'Historiador', icon: '📜', desc: 'Leer todos los diarios' },
  { id: 'favorito_lorenzo', name: 'Favorito de Lorenzo', icon: '👨‍🏫', desc: 'Reputación máxima con Lorenzo' },
  { id: 'pupilo_sofia', name: 'Pupilo de Sofía', icon: '👩‍🏫', desc: 'Reputación máxima con Sofía' },
  { id: 'explorador', name: 'Explorador', icon: '🎪', desc: 'Clickear 100 veces' },
  { id: 'mundo1', name: 'Maestro del Mundo 1', icon: '🏆', desc: '100% del Mundo 1' }
];

// Database Seed
const dbSeed = `
  CREATE TABLE books (
    id INTEGER PRIMARY KEY,
    title TEXT,
    author TEXT,
    year INTEGER,
    pages INTEGER,
    genre TEXT
  );

  INSERT INTO books VALUES
  (1, 'El Arte de la Guerra', 'Sun Tzu (trad.)', 1512, 192, 'Historia'),
  (2, 'Diálogos de Platón', 'Platón (trad.)', 1489, 320, 'Filosofía'),
  (3, 'Atlas Marítimo del Nuevo Mundo', 'Marco Polo el Joven', 1518, 144, 'Mapas'),
  (4, 'Secretos de la Alquimia', 'Paracelso di Firenze', 1520, 88, 'Alquimia'),
  (5, 'Crónicas de Valoria', 'Sofía Castellana', 1505, 256, 'Historia'),
  (6, 'El Príncipe', 'Nicolás Maquiavelo', 1513, 160, 'Filosofía'),
  (7, 'Tratado de Arquitectura', 'Lorenzo de Médicis', 1495, 280, 'Arte'),
  (8, 'Navegación Celestial', 'Marco Polo el Joven', 1515, 176, 'Ciencia'),
  (9, 'Poemas del Alba', 'Isabella Cortés', 1522, 96, 'Poesía'),
  (10, 'Historia de Florencia', 'Leonardo Bruni', 1492, 384, 'Historia'),
  (11, 'Sobre la Naturaleza', 'Lucrecio (trad.)', 1498, 224, 'Filosofía'),
  (12, 'Herbario Medicinal', 'Paracelso di Firenze', 1517, 120, 'Alquimia'),
  (13, 'Crónicas de la Corte', 'Sofía Castellana', 1508, 312, 'Historia'),
  (14, 'El Jardín Secreto', 'Teresa de Ávila', 1519, 168, 'Poesía'),
  (15, 'Tratado de Navegación', 'Marco Polo el Joven', 1521, 200, 'Mapas'),
  (16, 'La República', 'Platón (trad.)', 1487, 368, 'Filosofía'),
  (17, 'Cartas a un Príncipe', 'Lorenzo de Médicis', 1493, 144, 'Historia'),
  (18, 'Geometría Sagrada', 'Euclides (trad.)', 1502, 256, 'Ciencia'),
  (19, 'Recetas del Monasterio', 'Fray Antonio', 1511, 104, 'Alquimia'),
  (20, 'Crónicas del Puerto', 'Juana Méndez', 1514, 288, 'Historia'),
  (21, 'Atlas de las Estrellas', 'Ptolomeo (trad.)', 1499, 192, 'Ciencia'),
  (22, 'Tratado de Pintura', 'Leonardo da Vinci', 1518, 176, 'Arte'),
  (23, 'Metafísica', 'Aristóteles (trad.)', 1491, 352, 'Filosofía'),
  (24, 'Fórmulas Secretas', 'Paracelso di Firenze', 1523, 80, 'Alquimia'),
  (25, 'Crónicas Prohibidas', 'Autor Desconocido', 1486, 240, 'Historia'),
  (26, 'Cantos Gregorianos', 'Coro de Toledo', 1507, 128, 'Poesía'),
  (27, 'Mapa del Mediterráneo', 'Marco Polo el Joven', 1516, 96, 'Mapas'),
  (28, 'Ética Nicomáquea', 'Aristóteles (trad.)', 1494, 304, 'Filosofía'),
  (29, 'Diario de un Alquimista', 'Paracelso di Firenze', 1519, 144, 'Alquimia'),
  (30, 'Historia de Roma', 'Tito Livio (trad.)', 1497, 416, 'Historia'),
  (31, 'De Natura Rerum', 'Plinio (trad.)', 1503, 272, 'Ciencia'),
  (32, 'Frescos Renacentistas', 'Rafael Sanzio', 1520, 112, 'Arte'),
  (33, 'Romances de Castilla', 'Fernando de Rojas', 1515, 184, 'Poesía'),
  (34, 'Atlas Universal', 'Gerardus Mercator', 1521, 208, 'Mapas'),
  (35, 'Confesiones', 'San Agustín (trad.)', 1488, 336, 'Filosofía'),
  (36, 'Elixir de la Vida', 'Paracelso di Firenze', 1524, 72, 'Alquimia'),
  (37, 'Anales de Valoria', 'Sofía Castellana', 1510, 296, 'Historia'),
  (38, 'Astronomía Práctica', 'Nicolás Copérnico', 1522, 224, 'Ciencia'),
  (39, 'Esculturas Clásicas', 'Miguel Ángel', 1517, 128, 'Arte'),
  (40, 'Églogas', 'Virgilio (trad.)', 1496, 152, 'Poesía'),
  (41, 'Rutas del Oriente', 'Marco Polo el Joven', 1519, 176, 'Mapas'),
  (42, 'Teeteto', 'Platón (trad.)', 1490, 248, 'Filosofía'),
  (43, 'Transmutación de Metales', 'Paracelso di Firenze', 1522, 96, 'Alquimia'),
  (44, 'Guerra de las Galias', 'Julio César (trad.)', 1501, 264, 'Historia'),
  (45, 'Física', 'Aristóteles (trad.)', 1495, 320, 'Ciencia'),
  (46, 'La Última Cena', 'Leonardo da Vinci', 1516, 88, 'Arte'),
  (47, 'Odas', 'Horacio (trad.)', 1509, 168, 'Poesía'),
  (48, 'Cartas Náuticas', 'Marco Polo el Joven', 1523, 144, 'Mapas'),
  (49, 'Timeo', 'Platón (trad.)', 1493, 280, 'Filosofía'),
  (50, 'La Piedra Filosofal', 'Paracelso di Firenze', 1525, 64, 'Alquimia');
`;

// Sound System
const sounds = {
  click: () => {
    if (!window.gameState.soundEnabled) return;
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gainNode = audio.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audio.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, audio.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1);
    oscillator.start(audio.currentTime);
    oscillator.stop(audio.currentTime + 0.1);
  },
  success: () => {
    if (!window.gameState.soundEnabled) return;
    const audio = new AudioContext();
    [523, 659, 784].forEach((freq, i) => {
      const oscillator = audio.createOscillator();
      const gainNode = audio.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audio.destination);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.2, audio.currentTime + i * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + i * 0.1 + 0.2);
      oscillator.start(audio.currentTime + i * 0.1);
      oscillator.stop(audio.currentTime + i * 0.1 + 0.2);
    });
  },
  error: () => {
    if (!window.gameState.soundEnabled) return;
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gainNode = audio.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audio.destination);
    oscillator.frequency.value = 200;
    oscillator.type = 'sawtooth';
    gainNode.gain.setValueAtTime(0.15, audio.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3);
    oscillator.start(audio.currentTime);
    oscillator.stop(audio.currentTime + 0.3);
  },
  fanfare: () => {
    if (!window.gameState.soundEnabled) return;
    const audio = new AudioContext();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const oscillator = audio.createOscillator();
      const gainNode = audio.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audio.destination);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audio.currentTime + i * 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + i * 0.15 + 0.3);
      oscillator.start(audio.currentTime + i * 0.15);
      oscillator.stop(audio.currentTime + i * 0.15 + 0.3);
    });
  }
};

// Toggle Theme
window.toggleTheme = function() {
  sounds.click();
  const current = window.gameState.theme;
  const newTheme = current === 'light' ? 'dark' : 'light';
  window.gameState.theme = newTheme;
  document.documentElement.setAttribute('data-theme', newTheme);
  document.getElementById('themeToggle').textContent = newTheme === 'light' ? '☀️' : '🌙';
  saveGameState();
};

// Toggle Sound
window.toggleSound = function() {
  window.gameState.soundEnabled = !window.gameState.soundEnabled;
  document.getElementById('soundToggle').textContent = window.gameState.soundEnabled ? '🔊' : '🔇';
  if (window.gameState.soundEnabled) sounds.click();
  saveGameState();
};

// Initialize
async function init() {
  const loadingTexts = [
    'Descifrando manuscritos antiguos...',
    'Restaurando el Gran Archivo...',
    'Invocando el poder del SQL...',
    'Preparando tu aventura...'
  ];
  
  let textIndex = 0;
  const textInterval = setInterval(() => {
    document.getElementById('loadingText').textContent = loadingTexts[textIndex];
    textIndex = (textIndex + 1) % loadingTexts.length;
  }, 800);

  try {
    await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    }).then(SQL => {
      window.gameState.db = new SQL.Database();
      window.gameState.db.run(dbSeed);
      
      clearInterval(textInterval);
      
      setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        loadGameState();
        
        if (!window.gameState.playerName) {
          startOnboarding();
        } else {
          checkStreak();
          document.getElementById('mainApp').classList.remove('hidden');
          renderGame();
          createParticles();
          updateAvatars();
          
          document.documentElement.setAttribute('data-theme', window.gameState.theme);
          document.getElementById('themeToggle').textContent = window.gameState.theme === 'light' ? '☀️' : '🌙';
          document.getElementById('soundToggle').textContent = window.gameState.soundEnabled ? '🔊' : '🔇';
        }
      }, 3000);
    });
  } catch (e) {
    clearInterval(textInterval);
    alert('Error cargando SQL: ' + e.message);
  }
}

// Start game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Save/Load Game State
function saveGameState() {
  localStorage.setItem('scriptumSQL_v1_2', JSON.stringify(window.gameState));
}

function loadGameState() {
  const saved = localStorage.getItem('scriptumSQL_v1_2');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      Object.assign(window.gameState, data);
      
      if (!window.gameState.completedSubExercises) {
        window.gameState.completedSubExercises = {};
        for (let i = 1; i <= 10; i++) {
          window.gameState.completedSubExercises[i] = [];
        }
      }
      if (!window.gameState.currentSubExercise) {
        window.gameState.currentSubExercise = 1;
      }
      if (!window.gameState.attempts) {
        window.gameState.attempts = 0;
      }
      if (!window.gameState.practiceMode) {
        window.gameState.practiceMode = false;
      }
      if (window.gameState.soundEnabled === undefined) {
        window.gameState.soundEnabled = true;
      }
      if (!window.gameState.theme) {
        window.gameState.theme = 'light';
      }
      if (!window.gameState.skills) {
        window.gameState.skills = { SELECT: 0, WHERE: 0, ORDER: 0, ADVANCED: 0 };
      }
    } catch (e) {
      console.error('Error loading save:', e);
    }
  }
}

// NOTE: Due to character limits, the game.js file will be split.
// This is PART 1. I'll provide PART 2 in the next message with the challenges data and remaining functions.
// ============================================
// CHALLENGES DATA WITH DETAILED NARRATIVES
// ============================================
const challenges = {
  1: {
    title: 'El Despertar del Aprendiz',
    mainDesc: 'Lorenzo te enseña los fundamentos: SELECT y FROM',
    npc: 'lorenzo',
    npcAvatar: '👨‍🏫',
    dialogue: `
      <div class="npc-dialogue">
        <span class="npc-avatar">👨‍🏫</span>
        <div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;">
          <div class="npc-name">Lorenzo de Médicis, Guardián del Gran Archivo</div>
          <div class="npc-text">
            <p style="margin-bottom: 12px;">
              <span class="icon-text">🏛️ <strong>ARCHIVO CENTRAL DE VALORIA</strong></span>
            </p>
            <p style="margin-bottom: 12px;">
              Bienvenido al corazón del conocimiento, joven aprendiz. Has dado el primer paso en tu camino como maestro del SQL.
            </p>
            <p style="margin-bottom: 12px;">
              <span class="icon-text">📚 <strong>LA TABLA BOOKS</strong></span><br>
              Observa estas estanterías milenarias. Cada una contiene nuestra colección de libros antiguos.
            </p>
            <p style="margin-bottom: 12px;">
              En el lenguaje SQL, organizamos esta información en algo llamado <strong>TABLA</strong>.
            </p>
            <p style="margin-bottom: 12px;">
              Nuestra tabla <code>books</code> contiene:<br>
              • <code>title</code> → El título del libro<br>
              • <code>author</code> → Quién lo escribió<br>
              • <code>year</code> → Cuándo fue publicado<br>
              • <code>pages</code> → Cuántas páginas tiene<br>
              • <code>genre</code> → Su categoría
            </p>
            <p style="margin-bottom: 12px;">
              <span class="icon-text">⚔️ <strong>TU PRIMERA MISIÓN</strong></span><br>
              Aprende SELECT y FROM, los comandos más poderosos.
            </p>
            <p>
              🔹 <strong>SELECT</strong> = ELIGE qué columnas ver<br>
              🔹 <strong>FROM</strong> = INDICA de qué tabla
            </p>
          </div>
        </div>
      </div>
    `,
    concept: `<strong>📜 SELECT y FROM</strong><br><br>SELECT elige columnas, FROM indica la tabla.<br><br><code>SELECT title, author FROM books;</code>`,
    subExercises: [
      { id: 1, desc: '📖 Muestra SOLO los títulos', expected: 'SELECT title FROM books', hint: 'SELECT title FROM books;', example: 'SELECT author FROM books;' },
      { id: 2, desc: '✍️ Ahora solo los autores', expected: 'SELECT author FROM books', hint: 'SELECT author FROM books;', example: 'SELECT year FROM books;' },
      { id: 3, desc: '📚 Títulos Y autores juntos', expected: 'SELECT title, author FROM books', hint: 'SELECT title, author FROM books;', example: 'SELECT title, year FROM books;' },
      { id: 4, desc: '🌟 Usa * para mostrar TODO', expected: 'SELECT * FROM books', hint: 'SELECT * FROM books;', example: 'SELECT title, author, year FROM books;' }
    ],
    xp: 20, coins: 15, difficulty: 1, badge: null, skill: 'SELECT'
  },
  2: {
    title: 'La Selección Precisa',
    mainDesc: 'Domina el arte de elegir columnas específicas',
    npc: 'lorenzo',
    npcAvatar: '👨‍🏫',
    dialogue: `<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo de Médicis</div><div class="npc-text"><p>Bien hecho. Ahora aprende: no siempre necesitas todas las columnas. La precisión es poder.</p></div></div></div>`,
    concept: `<strong>📜 Columnas Específicas</strong><br><br>Elige solo lo que necesitas.<br><code>SELECT title, year FROM books;</code>`,
    subExercises: [
      { id: 1, desc: '📅 Título y año', expected: 'SELECT title, year FROM books', hint: 'SELECT title, year FROM books;', example: 'SELECT author, pages FROM books;' },
      { id: 2, desc: '👤 Autor y género', expected: 'SELECT author, genre FROM books', hint: 'SELECT author, genre FROM books;', example: 'SELECT title, genre FROM books;' },
      { id: 3, desc: '📏 Título, autor y páginas', expected: 'SELECT title, author, pages FROM books', hint: 'SELECT title, author, pages FROM books;', example: 'SELECT title, year, genre FROM books;' },
      { id: 4, desc: '🎯 Año, género y páginas', expected: 'SELECT year, genre, pages FROM books', hint: 'SELECT year, genre, pages FROM books;', example: 'SELECT title, author, year FROM books;' }
    ],
    xp: 20, coins: 20, difficulty: 1, badge: null, skill: 'SELECT'
  },
  3: {
    title: 'El Filtro del Guardián',
    mainDesc: 'Aprende WHERE para filtrar datos',
    npc: 'lorenzo',
    npcAvatar: '👨‍🏫',
    dialogue: `<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo de Médicis</div><div class="npc-text"><p><strong>WHERE</strong> es tu filtro. Solo muestra datos que cumplan condiciones.</p><p>⚠️ Textos entre comillas simples: 'así'</p></div></div></div>`,
    concept: `<strong>📜 WHERE</strong><br><br>Filtra filas.<br><code>WHERE author = 'Lorenzo de Médicis'</code>`,
    subExercises: [
      { id: 1, desc: "📚 Libros de 'Lorenzo de Médicis'", expected: "SELECT title, author FROM books WHERE author = 'Lorenzo de Médicis'", hint: "WHERE author = 'Lorenzo de Médicis'", example: "SELECT title FROM books WHERE author = 'Platón (trad.)';" },
      { id: 2, desc: '🗓️ Libros del año 1500', expected: "SELECT title, year FROM books WHERE year = 1500", hint: 'WHERE year = 1500', example: 'SELECT title, year FROM books WHERE year = 1505;' },
      { id: 3, desc: "📖 Libros de 'Historia'", expected: "SELECT title, genre FROM books WHERE genre = 'Historia'", hint: "WHERE genre = 'Historia'", example: "SELECT title FROM books WHERE genre = 'Filosofía';" },
      { id: 4, desc: "✍️ Libros de 'Sofía Castellana'", expected: "SELECT title, year FROM books WHERE author = 'Sofía Castellana'", hint: "WHERE author = 'Sofía Castellana'", example: "SELECT title FROM books WHERE author = 'Marco Polo el Joven';" }
    ],
    xp: 25, coins: 25, difficulty: 2, badge: 'domador', skill: 'WHERE'
  },
  4: {
    title: 'Los Manuscritos Antiguos',
    mainDesc: 'Domina comparaciones numéricas',
    npc: 'lorenzo',
    npcAvatar: '👨‍🏫',
    dialogue: `<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo de Médicis</div><div class="npc-text"><p>Ahora operadores: > < >= <=</p><p>⚠️ Números SIN comillas</p></div></div></div>`,
    concept: `<strong>📜 Comparaciones</strong><br><br>WHERE year < 1500`,
    subExercises: [
      { id: 1, desc: '📜 Antes de 1500', expected: 'SELECT title, year FROM books WHERE year < 1500', hint: 'WHERE year < 1500', example: 'SELECT title, year FROM books WHERE year > 1520;' },
      { id: 2, desc: '📏 Más de 300 páginas', expected: 'SELECT title, pages FROM books WHERE pages > 300', hint: 'WHERE pages > 300', example: 'SELECT title, pages FROM books WHERE pages < 100;' },
      { id: 3, desc: '📅 Desde 1510', expected: 'SELECT title, year FROM books WHERE year >= 1510', hint: 'WHERE year >= 1510', example: 'SELECT title, year FROM books WHERE year <= 1490;' },
      { id: 4, desc: '📖 200 páginas o menos', expected: 'SELECT title, pages FROM books WHERE pages <= 200', hint: 'WHERE pages <= 200', example: 'SELECT title, pages FROM books WHERE pages >= 250;' }
    ],
    xp: 25, coins: 30, difficulty: 2, badge: null, skill: 'WHERE'
  },
  5: {
    title: 'La Orden de la Bibliotecaria',
    mainDesc: 'Sofía te enseña ORDER BY',
    npc: 'sofia',
    npcAvatar: '👩‍🏫',
    dialogue: `<div class="npc-dialogue"><span class="npc-avatar">👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Sofía Castellana</div><div class="npc-text"><p>Hola, aprendiz. Soy Sofía. Te enseñaré ORDER BY.</p><p>ASC = menor a mayor<br>DESC = mayor a menor</p></div></div></div>`,
    concept: `<strong>📜 ORDER BY</strong><br><br>ORDER BY year ASC`,
    subExercises: [
      { id: 1, desc: '📅 Ordenar por año ASC', expected: 'SELECT title, year FROM books ORDER BY year ASC', hint: 'ORDER BY year ASC', example: 'SELECT title, pages FROM books ORDER BY pages ASC;' },
      { id: 2, desc: '📖 Ordenar por páginas DESC', expected: 'SELECT title, pages FROM books ORDER BY pages DESC', hint: 'ORDER BY pages DESC', example: 'SELECT title, year FROM books ORDER BY year DESC;' },
      { id: 3, desc: '✍️ Ordenar por autor A-Z', expected: 'SELECT title, author FROM books ORDER BY author ASC', hint: 'ORDER BY author ASC', example: 'SELECT title, genre FROM books ORDER BY genre ASC;' },
      { id: 4, desc: '🔤 Ordenar título Z-A', expected: 'SELECT title FROM books ORDER BY title DESC', hint: 'ORDER BY title DESC', example: 'SELECT author FROM books ORDER BY author DESC;' }
    ],
    xp: 30, coins: 35, difficulty: 2, badge: 'ordenador', skill: 'ORDER'
  },
  6: {
    title: 'El Límite Preciso',
    mainDesc: 'Aprende LIMIT',
    npc: 'sofia',
    npcAvatar: '👩‍🏫',
    dialogue: `<div class="npc-dialogue"><span class="npc-avatar">👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Sofía Castellana</div><div class="npc-text"><p>LIMIT controla cuántas filas mostrar.</p></div></div></div>`,
    concept: `<strong>📜 LIMIT</strong><br><br>LIMIT 5`,
    subExercises: [
      { id: 1, desc: '📚 Primeros 5', expected: 'SELECT title FROM books LIMIT 5', hint: 'LIMIT 5', example: 'SELECT title FROM books LIMIT 3;' },
      { id: 2, desc: '🔟 Primeros 10', expected: 'SELECT title, author FROM books LIMIT 10', hint: 'LIMIT 10', example: 'SELECT title, year FROM books LIMIT 8;' },
      { id: 3, desc: '🏆 3 más antiguos', expected: 'SELECT title, year FROM books ORDER BY year ASC LIMIT 3', hint: 'ORDER BY + LIMIT', example: 'SELECT title, year FROM books ORDER BY year DESC LIMIT 5;' },
      { id: 4, desc: '📖 5 más largos', expected: 'SELECT title, pages FROM books ORDER BY pages DESC LIMIT 5', hint: 'ORDER BY pages DESC LIMIT 5', example: 'SELECT title, pages FROM books ORDER BY pages ASC LIMIT 3;' }
    ],
    xp: 30, coins: 40, difficulty: 2, badge: null, skill: 'ORDER'
  },
  7: {
    title: 'Los Valores Únicos',
    mainDesc: 'DISTINCT elimina duplicados',
    npc: 'sofia',
    npcAvatar: '👩‍🏫',
    dialogue: `<div class="npc-dialogue"><span class="npc-avatar">👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Sofía Castellana</div><div class="npc-text"><p>DISTINCT muestra valores únicos, sin repetir.</p></div></div></div>`,
    concept: `<strong>📜 DISTINCT</strong><br><br>SELECT DISTINCT genre FROM books`,
    subExercises: [
      { id: 1, desc: '📚 Géneros únicos', expected: 'SELECT DISTINCT genre FROM books', hint: 'SELECT DISTINCT genre', example: 'SELECT DISTINCT author FROM books;' },
      { id: 2, desc: '✍️ Autores únicos', expected: 'SELECT DISTINCT author FROM books', hint: 'SELECT DISTINCT author', example: 'SELECT DISTINCT genre FROM books;' },
      { id: 3, desc: '📅 Años únicos', expected: 'SELECT DISTINCT year FROM books', hint: 'SELECT DISTINCT year', example: 'SELECT DISTINCT pages FROM books;' },
      { id: 4, desc: '🎯 Géneros ordenados', expected: 'SELECT DISTINCT genre FROM books ORDER BY genre ASC', hint: 'DISTINCT + ORDER BY', example: 'SELECT DISTINCT author FROM books ORDER BY author DESC;' }
    ],
    xp: 35, coins: 45, difficulty: 3, badge: 'cazador', skill: 'ADVANCED'
  },
  8: {
    title: 'Las Condiciones Múltiples',
    mainDesc: 'Combina con AND',
    npc: 'lorenzo',
    npcAvatar: '👨‍🏫',
    dialogue: `<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo de Médicis</div><div class="npc-text"><p>AND combina condiciones. Ambas deben cumplirse.</p></div></div></div>`,
    concept: `<strong>📜 AND</strong><br><br>WHERE year > 1500 AND pages < 200`,
    subExercises: [
      { id: 1, desc: '📅 Después 1500 Y < 200 pág', expected: "SELECT title, year, pages FROM books WHERE year > 1500 AND pages < 200", hint: 'WHERE year > 1500 AND pages < 200', example: "SELECT title FROM books WHERE year > 1510 AND pages < 150;" },
      { id: 2, desc: "📚 Historia O Filosofía", expected: "SELECT title, genre FROM books WHERE genre = 'Historia' OR genre = 'Filosofía'", hint: "genre = 'Historia' OR genre = 'Filosofía'", example: "SELECT title FROM books WHERE genre = 'Poesía' OR genre = 'Arte';" },
      { id: 3, desc: '🎯 Antes 1500 Y Historia', expected: "SELECT title, year, genre FROM books WHERE year < 1500 AND genre = 'Historia'", hint: "year < 1500 AND genre = 'Historia'", example: "SELECT title FROM books WHERE year < 1490 AND genre = 'Filosofía';" },
      { id: 4, desc: '📖 >300 pág Y antes 1510', expected: "SELECT title, pages, year FROM books WHERE pages > 300 AND year < 1510", hint: 'pages > 300 AND year < 1510', example: "SELECT title FROM books WHERE pages > 250 AND year < 1500;" }
    ],
    xp: 40, coins: 50, difficulty: 3, badge: null, skill: 'WHERE'
  },
  9: {
    title: 'El Patrón Oculto',
    mainDesc: 'Busca patrones con LIKE',
    npc: 'lorenzo',
    npcAvatar: '👨‍🏫',
    dialogue: `<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo de Médicis</div><div class="npc-text"><p>LIKE busca patrones. % = cualquier cosa.</p></div></div></div>`,
    concept: `<strong>📜 LIKE</strong><br><br>WHERE title LIKE '%Crónicas%'`,
    subExercises: [
      { id: 1, desc: "🔍 Contiene 'Crónicas'", expected: "SELECT title, author FROM books WHERE title LIKE '%Crónicas%'", hint: "LIKE '%Crónicas%'", example: "SELECT title FROM books WHERE title LIKE '%Historia%';" },
      { id: 2, desc: "📖 Empieza con 'El'", expected: "SELECT title FROM books WHERE title LIKE 'El%'", hint: "LIKE 'El%'", example: "SELECT title FROM books WHERE title LIKE 'La%';" },
      { id: 3, desc: "✍️ Contiene 'Platón'", expected: "SELECT author, title FROM books WHERE author LIKE '%Platón%'", hint: "LIKE '%Platón%'", example: "SELECT author FROM books WHERE author LIKE '%Leonardo%';" },
      { id: 4, desc: "🎯 Termina 'Mundo'", expected: "SELECT title, genre FROM books WHERE title LIKE '%Mundo'", hint: "LIKE '%Mundo'", example: "SELECT title FROM books WHERE title LIKE '%Valoria';" }
    ],
    xp: 45, coins: 60, difficulty: 3, badge: null, skill: 'ADVANCED'
  },
  10: {
    title: 'El Manuscrito Crítico',
    mainDesc: 'MINI-JEFE: Combina todo',
    npc: 'lorenzo',
    npcAvatar: '👨‍🏫',
    dialogue: `<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo de Médicis</div><div class="npc-text"><p><strong>⚔️ DESAFÍO FINAL</strong></p><p>Combina SELECT, WHERE, AND, ORDER BY, LIMIT.</p></div></div></div>`,
    concept: `<strong>⚔️ DESAFÍO</strong><br><br>Combina todo lo aprendido`,
    subExercises: [
      { id: 1, desc: "📚 Historia después 1490", expected: "SELECT title, author, year FROM books WHERE genre = 'Historia' AND year > 1490", hint: "WHERE genre = 'Historia' AND year > 1490", example: "SELECT title FROM books WHERE genre = 'Filosofía' AND year > 1500;" },
      { id: 2, desc: '📊 Anterior + ordenado', expected: "SELECT title, author, year FROM books WHERE genre = 'Historia' AND year > 1490 ORDER BY year ASC", hint: '+ ORDER BY year ASC', example: "SELECT title, year FROM books WHERE genre = 'Historia' ORDER BY year DESC;" },
      { id: 3, desc: '🎯 Anterior + solo 3', expected: "SELECT title, author, year FROM books WHERE genre = 'Historia' AND year > 1490 ORDER BY year ASC LIMIT 3", hint: '+ LIMIT 3', example: "SELECT title, year FROM books WHERE genre = 'Historia' AND year > 1490 ORDER BY year ASC LIMIT 5;" },
      { id: 4, desc: '👑 ¡CONSULTA MAESTRA!', expected: "SELECT title, author, year FROM books WHERE genre = 'Historia' AND year > 1490 ORDER BY year ASC LIMIT 3", hint: 'La consulta completa', example: "SELECT title, year FROM books WHERE genre = 'Filosofía' ORDER BY year;" }
    ],
    xp: 100, coins: 150, difficulty: 4, badge: 'conquistador', skill: 'ADVANCED'
  }
};

// Continue in next message...
// ============================================
// ONBOARDING SYSTEM
// ============================================
function startOnboarding() {
  document.getElementById('onboarding').classList.remove('hidden');
  showOnboardingStep(1);
}

function showOnboardingStep(step) {
  const content = document.getElementById('onboardingContent');
  
  if (step === 1) {
    content.innerHTML = `
      <div class="logo-animation">
        <svg viewBox="0 0 200 200" style="width: 100%; height: 100%;">
          <rect x="20" y="40" width="160" height="120" rx="10" fill="#e9c46a" opacity="0.3"/>
          <rect x="30" y="50" width="140" height="100" rx="8" fill="#fff"/>
          <text x="100" y="100" text-anchor="middle" font-size="48" fill="#264653">📜</text>
          <text x="100" y="140" text-anchor="middle" font-size="14" fill="#264653" font-weight="bold">SCRIPTUM SQL</text>
        </svg>
      </div>
      <h1 style="font-size: 32px; color: var(--primary); margin-bottom: 20px;">El Manuscrito Perdido</h1>
      <p style="font-size: 18px; color: var(--muted); margin-bottom: 10px;">Una aventura épica para dominar SQL</p>
      <p style="font-size: 14px; color: var(--muted); margin-bottom: 30px;">v1.2 - Edición Mejorada</p>
      <button class="btn" onclick="showOnboardingStep(2)" style="font-size: 18px; padding: 16px 32px;">⚔️ Comenzar Aventura</button>
    `;
  } else if (step === 2) {
    content.innerHTML = `
      <h2 style="color: var(--primary); margin-bottom: 20px;">¿Cómo te llaman?</h2>
      <p style="color: var(--muted); margin-bottom: 20px;">En Scriptorium de Valoria, todos los aprendices tienen un nombre</p>
      <input type="text" id="nameInput" class="input-name" placeholder="Tu nombre (3-15 caracteres)" maxlength="15">
      <button class="btn" onclick="saveName()" style="width: 100%; margin-top: 20px;">Continuar</button>
    `;
    setTimeout(() => document.getElementById('nameInput').focus(), 100);
  } else if (step === 3) {
    content.innerHTML = `
      <h2 style="color: var(--primary); margin-bottom: 20px;">Elige tu avatar</h2>
      <p style="color: var(--muted); margin-bottom: 20px;">¿Quién serás en esta aventura?</p>
      <div class="avatar-selector">
        <div class="avatar-card ${window.gameState.avatar === 0 ? 'active' : ''}" onclick="selectAvatar(0)">
          <div class="avatar-icon">📚</div>
          <div style="font-size: 14px; font-weight: bold;">El Aprendiz</div>
        </div>
        <div class="avatar-card ${window.gameState.avatar === 1 ? 'active' : ''}" onclick="selectAvatar(1)">
          <div class="avatar-icon">🧙‍♂️</div>
          <div style="font-size: 14px; font-weight: bold;">El Erudito</div>
        </div>
        <div class="avatar-card ${window.gameState.avatar === 2 ? 'active' : ''}" onclick="selectAvatar(2)">
          <div class="avatar-icon">🔥</div>
          <div style="font-size: 14px; font-weight: bold;">Portador de Fuego</div>
        </div>
      </div>
      <button class="btn" onclick="showOnboardingStep(4)" style="width: 100%; margin-top: 20px;">Continuar</button>
    `;
  } else if (step === 4) {
    content.innerHTML = `
      <h2 style="color: var(--primary); margin-bottom: 20px;">Tutorial Rápido</h2>
      <div style="text-align: left; padding: 20px; background: #f9fafb; border-radius: 12px; margin-bottom: 20px;">
        <p style="margin-bottom: 15px;">✍️ <strong>Editor SQL:</strong> Aquí escribes tus consultas</p>
        <p style="margin-bottom: 15px;">▶️ <strong>Ejecutar:</strong> Prueba tu consulta</p>
        <p style="margin-bottom: 15px;">📋 <strong>Ver Esquema:</strong> Si te pierdes</p>
        <p>🎯 <strong>4 ejercicios por reto:</strong> Aprende paso a paso</p>
      </div>
      <button class="btn" onclick="showOnboardingStep(5)" style="width: 100%;">Continuar</button>
    `;
  } else if (step === 5) {
    content.innerHTML = `
      <div style="text-align: left;">
        <h2 style="color: var(--primary); margin-bottom: 20px;">🏛️ Scriptorium de Valoria</h2>
        <div style="background: #f0f9ff; border-left: 4px solid var(--secondary); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin-bottom: 15px; font-size: 16px;"><strong style="color: var(--primary);">Lorenzo de Médicis:</strong></p>
          <p style="font-size: 15px; line-height: 1.6;">"Saludos, aprendiz. Soy Lorenzo de Médicis, guardián de este gran archivo. Una extraña maldición cayó sobre Valoria. Solo el antiguo lenguaje SQL puede salvarnos. ¿Te atreves a aprenderlo?"</p>
        </div>
        <button class="btn" onclick="startAdventure()" style="width: 100%; font-size: 18px;">⚔️ ¡Acepto el desafío!</button>
      </div>
    `;
  }
}

window.saveName = function() {
  sounds.click();
  const name = document.getElementById('nameInput').value.trim();
  if (name.length < 3 || name.length > 15) {
    sounds.error();
    alert('El nombre debe tener entre 3 y 15 caracteres');
    return;
  }
  window.gameState.playerName = name;
  showOnboardingStep(3);
};

window.selectAvatar = function(index) {
  sounds.click();
  window.gameState.avatar = index;
  document.querySelectorAll('.avatar-card').forEach((card, i) => {
    card.classList.toggle('active', i === index);
  });
};

window.startAdventure = function() {
  sounds.success();
  window.gameState.lastVisit = new Date().toISOString();
  window.gameState.diary.push({
    day: 1,
    entry: `Conocí a Lorenzo de Médicis. El gran archivo está en peligro. Debo aprender SQL para salvarlo.`
  });
  
  for (let i = 1; i <= 10; i++) {
    window.gameState.completedSubExercises[i] = [];
  }
  
  saveGameState();
  document.getElementById('onboarding').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
  renderGame();
  createParticles();
  updateAvatars();
};

// ============================================
// PARTICLES & AVATARS
// ============================================
function createParticles() {
  const container = document.getElementById('particles');
  container.innerHTML = '';
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (15 + Math.random() * 10) + 's';
    container.appendChild(particle);
  }
}

function updateAvatars() {
  const avatars = ['📚', '🧙‍♂️', '🔥'];
  const selected = avatars[window.gameState.avatar];
  document.getElementById('headerAvatar').textContent = selected;
  document.getElementById('panelAvatar').textContent = selected;
}

// ============================================
// RENDER GAME
// ============================================
function renderGame() {
  updateStats();
  renderChallenges();
  loadChallenge(window.gameState.currentChallenge, window.gameState.currentSubExercise);
  updateProgressBar();
  updateSkillBars();
}

function updateStats() {
  document.getElementById('playerName').textContent = window.gameState.playerName || 'Aprendiz';
  document.getElementById('playerNamePanel').textContent = window.gameState.playerName || 'Aprendiz';
  document.getElementById('playerXP').textContent = window.gameState.xp;
  document.getElementById('playerCoins').textContent = window.gameState.coins;
  document.getElementById('playerStreak').textContent = window.gameState.streak;
}

function renderChallenges() {
  const list = document.getElementById('challengeList');
  list.innerHTML = '';
  
  for (let i = 1; i <= 10; i++) {
    const challenge = challenges[i];
    const completedSubs = window.gameState.completedSubExercises[i] || [];
    const totalSubs = challenge.subExercises.length;
    const isFullyCompleted = completedSubs.length === totalSubs;
    const isCurrent = window.gameState.currentChallenge === i;
    
    const div = document.createElement('div');
    div.className = `challenge-item ${isCurrent ? 'active' : ''} ${isFullyCompleted ? 'completed' : ''}`;
    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-weight: bold;">${i}. ${challenge.title}</div>
        <div style="font-size: 11px; opacity: 0.8;">[${completedSubs.length}/${totalSubs}]</div>
      </div>
      <div style="font-size: 12px; margin-top: 4px; opacity: 0.8;">
        ${'⭐'.repeat(challenge.difficulty)}
      </div>
      <div class="sub-exercises">
        ${challenge.subExercises.map((sub, idx) => {
          const subCompleted = completedSubs.includes(sub.id);
          const subCurrent = window.gameState.currentChallenge === i && window.gameState.currentSubExercise === sub.id;
          return `<div class="sub-exercise ${subCompleted ? 'completed' : ''} ${subCurrent ? 'active' : ''}">${i}.${sub.id} ${subCompleted ? '✓' : '○'}</div>`;
        }).join('')}
      </div>
    `;
    
    div.onclick = (e) => {
      sounds.click();
      const wasExpanded = div.classList.contains('expanded');
      document.querySelectorAll('.challenge-item').forEach(item => item.classList.remove('expanded'));
      
      if (!wasExpanded) {
        div.classList.add('expanded');
      }
      
      if (isFullyCompleted && !window.gameState.practiceMode) {
        window.gameState.practiceMode = true;
      } else {
        window.gameState.practiceMode = false;
      }
      
      window.gameState.currentChallenge = i;
      window.gameState.currentSubExercise = 1;
      
      const grid = document.getElementById('contentGrid');
      grid.classList.add('fade-out');
      setTimeout(() => {
        renderChallenges();
        loadChallenge(i, 1);
        grid.classList.remove('fade-out');
      }, 300);
    };
    
    list.appendChild(div);
  }
}

function loadChallenge(challengeId, subExerciseId) {
  const challenge = challenges[challengeId];
  const subExercise = challenge.subExercises.find(s => s.id === subExerciseId);
  
  const banner = document.getElementById('practiceBanner');
  if (window.gameState.practiceMode) {
    banner.innerHTML = `<div class="practice-mode-banner">🎯 MODO PRÁCTICA - Repitiendo ejercicios completados (sin recompensas)</div>`;
  } else {
    banner.innerHTML = '';
  }
  
  document.getElementById('challengeTitle').textContent = `${challengeId}. ${challenge.title}`;
  document.getElementById('challengeDesc').textContent = `Ejercicio ${challengeId}.${subExerciseId}: ${subExercise.desc}`;
  document.getElementById('npcDialogue').innerHTML = challenge.dialogue;
  document.getElementById('conceptBox').innerHTML = challenge.concept;
  document.getElementById('sqlEditor').value = '-- Escribe tu consulta aquí\n';
  document.getElementById('results').innerHTML = '<strong>📊 Resultados</strong><p style="color: var(--muted); margin-top: 10px;">Ejecuta tu consulta para ver resultados...</p>';
  
  window.gameState.attempts = 0;
  window.gameState.exampleUnlocked = false;
  updateAttemptCounter();
  updateLorenzoTips();
}

function updateProgressBar() {
  let totalCompleted = 0;
  for (let i = 1; i <= 10; i++) {
    const completed = window.gameState.completedSubExercises[i] || [];
    totalCompleted += completed.length;
  }
  
  const total = 40;
  const percentage = Math.round((totalCompleted / total) * 100);
  
  document.getElementById('worldProgress').textContent = `${totalCompleted}/${total}`;
  document.getElementById('worldProgressBar').style.width = percentage + '%';
  document.getElementById('worldProgressBar').textContent = percentage + '%';
  
  const lorenzoRep = window.gameState.reputation.lorenzo;
  const stars = document.getElementById('lorenzoRep');
  stars.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    stars.innerHTML += `<span class="star ${i < lorenzoRep ? '' : 'empty'}">★</span>`;
  }
}

function updateSkillBars() {
  const skills = window.gameState.skills;
  const skillElements = {
    SELECT: document.getElementById('skillSELECT'),
    WHERE: document.getElementById('skillWHERE'),
    ORDER: document.getElementById('skillORDER'),
    ADVANCED: document.getElementById('skillADVANCED')
  };
  
  Object.keys(skills).forEach(skill => {
    const percent = Math.min(100, skills[skill]);
    skillElements[skill].style.width = percent + '%';
    skillElements[skill].textContent = percent + '%';
  });
}

function updateLorenzoTips() {
  const id = window.gameState.currentChallenge;
  const tips = {
    1: 'SELECT elige columnas, FROM indica la tabla',
    2: 'Puedes elegir solo las columnas que necesitas',
    3: 'WHERE filtra filas con condiciones',
    4: 'Usa > < >= <= para comparar números',
    5: 'ORDER BY organiza ASC o DESC',
    6: 'LIMIT controla cuántas filas mostrar',
    7: 'DISTINCT elimina duplicados',
    8: 'AND combina condiciones',
    9: 'LIKE busca patrones con %',
    10: 'Combina todo: SELECT, WHERE, AND, ORDER BY, LIMIT'
  };
  
  document.getElementById('lorenzoTips').innerHTML = `
    <strong>Consejo de ${challenges[id].npc === 'lorenzo' ? 'Lorenzo' : 'Sofía'}:</strong>
    <p style="margin-top: 8px; font-size: 14px;">${tips[id] || 'Sigue practicando'}</p>
  `;
}

// Continue to PART 4 (final functions)...
// ============================================
// EXECUTE QUERY & CHECK SOLUTION
// ============================================
window.executeQuery = function() {
  sounds.click();
  
  const query = document.getElementById('sqlEditor').value.trim();
  if (!query || query === '-- Escribe tu consulta aquí') {
    sounds.error();
    alert('Escribe una consulta primero');
    return;
  }
  
  try {
    const results = window.gameState.db.exec(query);
    displayResults(results);
    checkSolution(query);
  } catch (e) {
    sounds.error();
    displayError(e.message);
    window.gameState.attempts++;
    updateAttemptCounter();
  }
};

function displayResults(results) {
  const container = document.getElementById('results');
  container.innerHTML = '<strong>📊 Resultados</strong>';
  
  if (!results || results.length === 0) {
    container.innerHTML += '<p style="color: var(--muted); margin-top: 10px;">Consulta ejecutada. Sin resultados para mostrar.</p>';
    return;
  }
  
  const result = results[0];
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  
  result.columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);
  
  const tbody = document.createElement('tbody');
  result.values.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(cell => {
      const td = document.createElement('td');
      td.textContent = cell === null ? 'NULL' : cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

function displayError(message) {
  const container = document.getElementById('results');
  container.innerHTML = `
    <strong style="color: var(--danger);">❌ Error</strong>
    <pre style="color: var(--danger); margin-top: 10px; font-size: 14px;">${message}</pre>
    <div class="hint-box" style="margin-top: 15px;">
      <strong>Consejo:</strong> Revisa la sintaxis. Usa "Ver Esquema" si dudas.
    </div>
  `;
}

function checkSolution(userQuery) {
  const challengeId = window.gameState.currentChallenge;
  const subExerciseId = window.gameState.currentSubExercise;
  const challenge = challenges[challengeId];
  const subExercise = challenge.subExercises.find(s => s.id === subExerciseId);
  
  const normalize = q => q.toLowerCase().replace(/\s+/g, ' ').replace(/;/g, '').trim();
  
  const userNorm = normalize(userQuery);
  const expectedNorm = normalize(subExercise.expected);
  
  if (userNorm === expectedNorm || userNorm.includes(expectedNorm)) {
    completeSubExercise(challengeId, subExerciseId);
  } else {
    sounds.error();
    window.gameState.attempts++;
    updateAttemptCounter();
  }
}

function completeSubExercise(challengeId, subExerciseId) {
  const challenge = challenges[challengeId];
  const completedSubs = window.gameState.completedSubExercises[challengeId] || [];
  
  if (completedSubs.includes(subExerciseId) && !window.gameState.practiceMode) {
    sounds.success();
    showAlreadyCompleted();
    return;
  }
  
  if (!window.gameState.practiceMode && !completedSubs.includes(subExerciseId)) {
    completedSubs.push(subExerciseId);
    window.gameState.completedSubExercises[challengeId] = completedSubs;
    
    const subXP = Math.ceil(challenge.xp / 4);
    const subCoins = Math.ceil(challenge.coins / 4);
    window.gameState.xp += subXP;
    window.gameState.coins += subCoins;
    
    window.gameState.skills[challenge.skill] = Math.min(100, window.gameState.skills[challenge.skill] + 5);
    
    if (challenge.npc === 'lorenzo') {
      window.gameState.reputation.lorenzo = Math.min(3, window.gameState.reputation.lorenzo + 0.25);
    } else if (challenge.npc === 'sofia') {
      window.gameState.reputation.sofia = Math.min(3, window.gameState.reputation.sofia + 0.25);
    }
    
    if (subExerciseId === 1 && challengeId === 1 && !window.gameState.unlockedBadges.includes('primera')) {
      window.gameState.unlockedBadges.push('primera');
    }
    
    if (completedSubs.length === challenge.subExercises.length) {
      if (challenge.badge && !window.gameState.unlockedBadges.includes(challenge.badge)) {
        window.gameState.unlockedBadges.push(challenge.badge);
      }
      
      if (!window.gameState.completedChallenges.includes(challengeId)) {
        window.gameState.completedChallenges.push(challengeId);
      }
      
      const entries = {
        1: 'Día 1: Dominé SELECT y FROM.',
        2: 'Día 2: Perfeccioné la selección de columnas.',
        3: 'Día 3: WHERE es mi nueva arma.',
        4: 'Día 4: Las comparaciones revelan secretos.',
        5: 'Día 5: Conocí a Sofía. ORDER BY es poder.',
        6: 'Día 6: LIMIT me da control total.',
        7: 'Día 7: DISTINCT elimina duplicados.',
        8: 'Día 8: AND combina mi poder.',
        9: 'Día 9: LIKE revela patrones.',
        10: 'Día 10: ¡MINI-JEFE VENCIDO!'
      };
      
      if (entries[challengeId] && !window.gameState.diary.find(d => d.day === challengeId)) {
        window.gameState.diary.push({ day: challengeId, entry: entries[challengeId] });
      }
      
      if (challengeId === 10) {
        setTimeout(() => showWorldCompleted(), 2000);
      }
    }
    
    saveGameState();
  }
  
  const headerAvatar = document.getElementById('headerAvatar');
  const panelAvatar = document.getElementById('panelAvatar');
  headerAvatar.classList.add('avatar-celebrate');
  panelAvatar.classList.add('avatar-celebrate');
  setTimeout(() => {
    headerAvatar.classList.remove('avatar-celebrate');
    panelAvatar.classList.remove('avatar-celebrate');
  }, 1000);
  
  sounds.success();
  if (typeof confetti !== 'undefined') {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  }
  
  const resultsDiv = document.getElementById('results');
  const successMsg = document.createElement('div');
  successMsg.style.cssText = 'margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; border: 2px solid #34d399;';
  
  if (window.gameState.practiceMode) {
    successMsg.innerHTML = `<div style="text-align: center;"><div style="font-size: 48px; margin-bottom: 10px;">✅</div><h3 style="color: var(--secondary);">¡Correcto!</h3><p>Modo práctica - Sin recompensas</p></div>`;
  } else {
    const subXP = Math.ceil(challenge.xp / 4);
    const subCoins = Math.ceil(challenge.coins / 4);
    successMsg.innerHTML = `<div style="text-align: center;"><div style="font-size: 48px; margin-bottom: 10px;">🎉</div><h3 style="color: var(--secondary);">¡Completado!</h3><p>+${subXP} XP y +${subCoins} monedas</p></div>`;
  }
  resultsDiv.appendChild(successMsg);
  
  renderGame();
  
  if (subExerciseId < challenge.subExercises.length) {
    setTimeout(() => {
      window.gameState.currentSubExercise = subExerciseId + 1;
      const grid = document.getElementById('contentGrid');
      grid.classList.add('fade-out');
      setTimeout(() => {
        loadChallenge(challengeId, subExerciseId + 1);
        renderChallenges();
        grid.classList.remove('fade-out');
      }, 300);
    }, 2000);
  } else if (challengeId < 10) {
    setTimeout(() => {
      window.gameState.currentChallenge = challengeId + 1;
      window.gameState.currentSubExercise = 1;
      const grid = document.getElementById('contentGrid');
      grid.classList.add('fade-out');
      setTimeout(() => {
        renderGame();
        grid.classList.remove('fade-out');
      }, 300);
    }, 3000);
  }
}

function showAlreadyCompleted() {
  const resultsDiv = document.getElementById('results');
  const msg = document.createElement('div');
  msg.style.cssText = 'margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 12px; border: 2px solid #3b82f6;';
  msg.innerHTML = '<strong>✅ ¡Correcto!</strong> Ya completaste este ejercicio.';
  resultsDiv.appendChild(msg);
}

function showWorldCompleted() {
  window.gameState.coins += 200;
  window.gameState.xp += 50;
  if (!window.gameState.unlockedBadges.includes('mundo1')) {
    window.gameState.unlockedBadges.push('mundo1');
  }
  saveGameState();
  
  sounds.fanfare();
  if (typeof confetti !== 'undefined') {
    confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } });
  }
  
  const modal = document.getElementById('modalGeneric');
  const content = document.getElementById('modalGenericContent');
  content.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 72px; margin-bottom: 20px;">🏆</div>
      <h2 style="color: var(--primary); margin-bottom: 20px;">¡MUNDO 1 COMPLETADO!</h2>
      <p style="font-size: 18px; margin-bottom: 20px;">Has dominado los fundamentos de SQL.<br><strong>40 ejercicios completados</strong></p>
      <div style="background: var(--accent); padding: 20px; border-radius: 12px; margin: 20px 0;">
        <strong style="font-size: 20px;">Recompensas:</strong><br>
        <div style="margin-top: 10px;">⭐ +50 XP<br>🪙 +200 monedas<br>🏆 Insignia Maestro</div>
      </div>
      <button class="btn" onclick="closeModal('modalGeneric')" style="font-size: 18px;">¡Continuar!</button>
    </div>
  `;
  modal.classList.add('active');
}

function updateAttemptCounter() {
  const counter = document.getElementById('attemptCounter');
  const exampleBtn = document.getElementById('exampleBtn');
  
  if (window.gameState.attempts === 0) {
    counter.style.display = 'none';
    exampleBtn.disabled = true;
    exampleBtn.innerHTML = '🔒 Ver Ejemplo Similar';
  } else if (window.gameState.attempts < 3) {
    counter.style.display = 'flex';
    document.getElementById('attemptText').textContent = `Intento ${window.gameState.attempts}/3`;
    exampleBtn.disabled = true;
    exampleBtn.innerHTML = `🔒 Ver Ejemplo (${3 - window.gameState.attempts} más)`;
  } else {
    counter.style.display = 'flex';
    document.getElementById('attemptText').textContent = `💡 Ejemplo desbloqueado`;
    exampleBtn.disabled = false;
    exampleBtn.innerHTML = '💡 Ver Ejemplo Similar';
    window.gameState.exampleUnlocked = true;
  }
}

window.showExample = function() {
  if (!window.gameState.exampleUnlocked) {
    sounds.error();
    alert('Necesitas 3 intentos fallidos');
    return;
  }
  
  sounds.click();
  const challengeId = window.gameState.currentChallenge;
  const subExerciseId = window.gameState.currentSubExercise;
  const challenge = challenges[challengeId];
  const subExercise = challenge.subExercises.find(s => s.id === subExerciseId);
  
  alert(`💡 EJEMPLO SIMILAR:\n\n${subExercise.example}\n\nAdáptalo a tu ejercicio.`);
};

window.clearEditor = function() {
  sounds.click();
  document.getElementById('sqlEditor').value = '-- Escribe tu consulta aquí\n';
};

window.showHints = function() {
  sounds.click();
  const challengeId = window.gameState.currentChallenge;
  const subExerciseId = window.gameState.currentSubExercise;
  const challenge = challenges[challengeId];
  const subExercise = challenge.subExercises.find(s => s.id === subExerciseId);
  
  const content = document.getElementById('modalGenericContent');
  content.innerHTML = `
    <h2 style="color: var(--primary); margin-bottom: 20px;">💡 Pista</h2>
    <div style="padding: 15px; background: #fffbeb; border-radius: 8px; border: 2px solid var(--warning);">
      <strong>💡 Pista:</strong><br>
      <div style="margin-top: 10px;">${subExercise.hint}</div>
    </div>
    <button class="btn" onclick="closeModal('modalGeneric')" style="margin-top: 20px; width: 100%;">Cerrar</button>
  `;
  document.getElementById('modalGeneric').classList.add('active');
};

window.showSchema = function() {
  sounds.click();
  const content = document.getElementById('modalGenericContent');
  content.innerHTML = `
    <h2 style="color: var(--primary); margin-bottom: 20px;">📋 Esquema</h2>
    <div style="margin-bottom: 20px;">
      <h3 style="color: var(--secondary);">Tabla: books</h3>
      <ul style="margin-left: 20px; margin-top: 10px;">
        <li><code>id</code> - INTEGER</li>
        <li><code>title</code> - TEXT (título)</li>
        <li><code>author</code> - TEXT (autor)</li>
        <li><code>year</code> - INTEGER (año)</li>
        <li><code>pages</code> - INTEGER (páginas)</li>
        <li><code>genre</code> - TEXT (género)</li>
      </ul>
    </div>
    <button class="btn" onclick="closeModal('modalGeneric')" style="margin-top: 20px; width: 100%;">Cerrar</button>
  `;
  document.getElementById('modalGeneric').classList.add('active');
};

window.showBadges = function() {
  sounds.click();
  const content = document.getElementById('modalGenericContent');
  content.innerHTML = '<h2 style="color: var(--primary); margin-bottom: 20px;">🏆 Mis Insignias</h2>';
  
  const grid = document.createElement('div');
  grid.className = 'badge-grid';
  
  allBadges.forEach(badge => {
    const unlocked = window.gameState.unlockedBadges.includes(badge.id);
    const div = document.createElement('div');
    div.className = `badge-item ${unlocked ? 'unlocked' : 'locked'}`;
    div.innerHTML = `
      <div class="badge-icon">${badge.icon}</div>
      <div style="font-weight: bold; font-size: 14px;">${badge.name}</div>
      <div style="font-size: 12px; color: var(--muted);">${badge.desc}</div>
    `;
    grid.appendChild(div);
  });
  
  content.appendChild(grid);
  
  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Cerrar';
  btn.style.cssText = 'margin-top: 20px; width: 100%;';
  btn.onclick = () => closeModal('modalGeneric');
  content.appendChild(btn);
  
  document.getElementById('modalGeneric').classList.add('active');
};

window.showShop = function() {
  sounds.click();
  const content = document.getElementById('modalGenericContent');
  content.innerHTML = `
    <h2 style="color: var(--primary); margin-bottom: 20px;">🛍️ Tienda</h2>
    <p style="color: var(--muted);">Próximamente: Skins épicas para tu avatar</p>
    <button class="btn" onclick="closeModal('modalGeneric')" style="margin-top: 20px; width: 100%;">Cerrar</button>
  `;
  document.getElementById('modalGeneric').classList.add('active');
};

window.showDiary = function() {
  sounds.click();
  const content = document.getElementById('modalGenericContent');
  content.innerHTML = '<h2 style="color: var(--primary); margin-bottom: 20px;">📖 Mi Diario</h2>';
  
  if (window.gameState.diary.length === 0) {
    content.innerHTML += '<p style="color: var(--muted);">Tu aventura acaba de comenzar.</p>';
  } else {
    window.gameState.diary.forEach(entry => {
      const div = document.createElement('div');
      div.style.cssText = 'padding: 15px; margin-bottom: 15px; background: #fffbeb; border-left: 4px solid var(--accent); border-radius: 8px;';
      div.innerHTML = `<strong>Día ${entry.day}:</strong><br><div style="margin-top: 8px;">${entry.entry}</div>`;
      content.appendChild(div);
    });
  }
  
  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Cerrar';
  btn.style.cssText = 'margin-top: 20px; width: 100%;';
  btn.onclick = () => closeModal('modalGeneric');
  content.appendChild(btn);
  
  document.getElementById('modalGeneric').classList.add('active');
};

window.saveFavorite = function() {
  sounds.click();
  const query = document.getElementById('sqlEditor').value.trim();
  if (!query || query === '-- Escribe tu consulta aquí') {
    sounds.error();
    alert('Escribe una consulta primero');
    return;
  }
  if (window.gameState.favorites.length >= 10) {
    sounds.error();
    alert('Ya tienes 10 consultas guardadas');
    return;
  }
  window.gameState.favorites.push(query);
  saveGameState();
  sounds.success();
  alert('¡Consulta guardada!');
};

window.closeModal = function(id) {
  sounds.click();
  document.getElementById(id).classList.remove('active');
};

function checkStreak() {
  const lastVisit = window.gameState.lastVisit ? new Date(window.gameState.lastVisit) : null;
  const now = new Date();
  
  if (!lastVisit) {
    window.gameState.streak = 1;
    window.gameState.lastVisit = now.toISOString();
    saveGameState();
    return;
  }
  
  const daysDiff = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    window.gameState.streak += 1;
    window.gameState.coins += 10;
    if (window.gameState.streak === 7 && !window.gameState.unlockedBadges.includes('racha')) {
      window.gameState.unlockedBadges.push('racha');
    }
  } else if (daysDiff > 1) {
    window.gameState.streak = 1;
  }
  
  window.gameState.lastVisit = now.toISOString();
  saveGameState();
  updateStats();
}

// ============================================
// END OF GAME.JS
// ============================================
```

---

## 🎉 ¡CÓDIGO COMPLETO!

### ✅ **AHORA HAZ COMMIT:**

1. Scroll hasta abajo del editor
2. Click **"Commit changes"**
3. Mensaje: `v1.2 - game.js completo`
4. Click **"Commit changes"**

---

## 🚀 **PASO FINAL: PROBAR LA PÁGINA**

1. Espera **2 minutos** para que GitHub Pages se actualice
2. Abre: https://furobilly.github.io/sql-chronicles/
3. Presiona `Ctrl + Shift + R` (recarga forzada)

---

## 📊 **ARCHIVOS FINALES EN TU REPOSITORIO:**
```
✅ index.html   (estructura)
✅ styles.css   (estilos)
✅ game.js      (lógica completa)
