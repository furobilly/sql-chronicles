// ============================================
// SCRIPTUM SQL v1.2 - NARRATIVA ÉPICA
// ============================================

window.gameState = {
  playerName: '',
  avatar: 0,
  xp: 0,
  coins: 0,
  streak: 0,
  lastVisit: null,
  currentChallenge: 1,
  currentSubExercise: 1,
  currentDay: 1,
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
  skills: { SELECT: 0, WHERE: 0, ORDER: 0, ADVANCED: 0 },
  expandedChallenges: [],
  sofiaConfessed: false,
  lorenzoTrustLevel: 0
};

const allBadges = [
  { id: 'primera', name: 'Primera Consulta', icon: '🛡️', desc: 'Completar ejercicio 1.1' },
  { id: 'domador', name: 'Domador de WHERE', icon: '⚔️', desc: 'Completar reto 3' },
  { id: 'ordenador', name: 'Ordenador Maestro', icon: '📖', desc: 'Completar reto 5' },
  { id: 'cazador', name: 'Cazador de Datos', icon: '🔍', desc: 'Completar reto 7' },
  { id: 'revelacion', name: 'Portador de Verdad', icon: '💎', desc: 'Completar reto 8' },
  { id: 'conquistador', name: 'Vencedor de Chronos', icon: '👑', desc: 'Completar reto 10' },
  { id: 'mundo1', name: 'Salvador de Valoria', icon: '🏆', desc: '100% Mundo 1' }
];

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
  (3, 'Atlas Marítimo', 'Marco Polo', 1518, 144, 'Mapas'),
  (4, 'Secretos Alquimia', 'Paracelso', 1520, 88, 'Alquimia'),
  (5, 'Crónicas de Valoria', 'Sofía Castellana', 1505, 256, 'Historia'),
  (6, 'El Príncipe', 'Nicolás Maquiavelo', 1513, 160, 'Filosofía'),
  (7, 'Tratado Arquitectura', 'Lorenzo de Médicis', 1495, 280, 'Arte'),
  (8, 'Navegación Celestial', 'Marco Polo', 1515, 176, 'Ciencia'),
  (9, 'Poemas del Alba', 'Isabella Cortés', 1522, 96, 'Poesía'),
  (10, 'Historia de Florencia', 'Leonardo Bruni', 1492, 384, 'Historia');
`;

const sounds = {
  click: () => {
    if (!window.gameState.soundEnabled) return;
    try {
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
    } catch(e) {}
  },
  success: () => {
    if (!window.gameState.soundEnabled) return;
    try {
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
    } catch(e) {}
  },
  error: () => {
    if (!window.gameState.soundEnabled) return;
    try {
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
    } catch(e) {}
  }
};

window.toggleTheme = function() {
  sounds.click();
  const current = window.gameState.theme;
  const newTheme = current === 'light' ? 'dark' : 'light';
  window.gameState.theme = newTheme;
  document.documentElement.setAttribute('data-theme', newTheme);
  document.getElementById('themeToggle').textContent = newTheme === 'light' ? '☀️' : '🌙';
  saveGameState();
};

window.toggleSound = function() {
  window.gameState.soundEnabled = !window.gameState.soundEnabled;
  document.getElementById('soundToggle').textContent = window.gameState.soundEnabled ? '🔊' : '🔇';
  if (window.gameState.soundEnabled) sounds.click();
  saveGameState();
};

async function init() {
  const loadingTexts = [
    'Descifrando manuscritos antiguos...',
    'Restaurando el Gran Archivo...',
    'Invocando el poder del SQL...',
    'Preparando tu aventura...'
  ];
  
  let textIndex = 0;
  const textInterval = setInterval(() => {
    const elem = document.getElementById('loadingText');
    if (elem) elem.textContent = loadingTexts[textIndex];
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function saveGameState() {
  const state = Object.assign({}, window.gameState);
  delete state.db;
  localStorage.setItem('scriptumSQL_v1_2', JSON.stringify(state));
}

function loadGameState() {
  const saved = localStorage.getItem('scriptumSQL_v1_2');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      Object.assign(window.gameState, data);
      
      if (!window.gameState.completedSubExercises) {
        window.gameState.completedSubExercises = {};
      }
      if (!window.gameState.expandedChallenges) {
        window.gameState.expandedChallenges = [];
      }
      if (!window.gameState.diary) {
        window.gameState.diary = [];
      }
      if (!window.gameState.currentDay) {
        window.gameState.currentDay = 1;
      }
    } catch (e) {
      console.error('Error loading save:', e);
    }
  }
}

const challenges = {
  1: {
    title: 'El Despertar del Aprendiz',
    dialogues: {
      1: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo de Médicis - Guardián del Archivo</div><div class="npc-text"><p><strong>DÍA 1 - LA MALDICIÓN</strong></p><p>Despierta, aprendiz. El Eclipse de Sangre... la maldición... todo se derrumba.</p><p>Eras el único en el Archivo esa noche. La luz dorada te protegió. ¿Por qué? No lo sé. Pero ahora eres nuestra última esperanza.</p><p>¿Recuerdas el SCRIPTUM SELECT? Muéstrame los <strong>títulos</strong> de lo que queda. Solo los títulos. Si fallas esto, no hay esperanza.</p></div></div></div>'
      },
      2: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p>Bien. Muy bien. Quizás la profecía no mentía.</p><p>Ahora muéstrame solo los <strong>autores</strong>. Necesito saber qué mentes aún permanecen en estas páginas.</p></div></div></div>'
      },
      3: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p>La esperanza crece. Combina ambos: <strong>títulos Y autores</strong>.</p><p>Cada consulta correcta fortalece el Códice. Cada error... lo debilita más.</p></div></div></div>'
      },
      4: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p>Sorprendente. Ahora usa el asterisco (*) para ver TODO.</p><p>Es el momento de ver la magnitud de lo que enfrentamos.</p><p><em>[Lorenzo sonríe por primera vez]</em> Quizás... quizás TÚ eres la esperanza que esperaba.</p></div></div></div>'
      }
    },
    concept: '<strong>📜 SELECT y FROM</strong><br><br>SELECT elige columnas, FROM indica tabla.<br><code>SELECT title FROM books;</code>',
    subExercises: [
      { id: 1, desc: '📖 Solo títulos', expected: 'SELECT title FROM books', hint: 'SELECT title FROM books;', example: 'SELECT author FROM books;' },
      { id: 2, desc: '✍️ Solo autores', expected: 'SELECT author FROM books', hint: 'SELECT author FROM books;', example: 'SELECT year FROM books;' },
      { id: 3, desc: '📚 Títulos Y autores', expected: 'SELECT title, author FROM books', hint: 'SELECT title, author FROM books;', example: 'SELECT title, year FROM books;' },
      { id: 4, desc: '🌟 Todo con *', expected: 'SELECT * FROM books', hint: 'SELECT * FROM books;', example: 'SELECT title, author FROM books;' }
    ],
    xp: 20, coins: 15, difficulty: 1, skill: 'SELECT',
    diaryEntry: 'Día 1: El Eclipse de Sangre golpeó. Lorenzo me encontró en los escombros. Soy la última esperanza del Archivo.'
  },
  2: {
    title: 'La Selección Precisa',
    dialogues: {
      1: {
        npc: 'sofia',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Sofía Castellana - Maestra Archivista</div><div class="npc-text"><p><strong>DÍA 2 - LA ARCHIVISTA</strong></p><p><em>[Una mujer de cabello negro y ojos verdes aparece]</em></p><p>Así que TÚ eres el "elegido". Lorenzo debe estar desesperado.</p><p>Soy Sofía Castellana, Maestra Archivista. He memorizado 10,000 libros. ¿Tú? Apenas sabes SELECT básico.</p><p>Demuéstrame que no eres un fraude. Selecciona <strong>título y año</strong>. Solo eso.</p></div></div></div>'
      },
      2: {
        npc: 'sofia',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Sofía</div><div class="npc-text"><p>Hmm. Competente. Pero no impresionante.</p><p>Ahora <strong>autor y género</strong>. La precisión es todo en el SCRIPTUM.</p></div></div></div>'
      },
      3: {
        npc: 'sofia',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Sofía</div><div class="npc-text"><p>Interesante. Tres columnas ahora: <strong>título, autor y páginas</strong>.</p><p>¿Puedes mantener el control con datos múltiples?</p></div></div></div>'
      },
      4: {
        npc: 'sofia',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Sofía</div><div class="npc-text"><p>Bien. Muy bien. Quizás Lorenzo no se equivocó contigo.</p><p>Última prueba: <strong>año, género y páginas</strong>.</p><p><em>[Por primera vez, Sofía muestra un atisbo de respeto]</em></p></div></div></div>'
      }
    },
    concept: '<strong>📜 Precisión</strong><br>SELECT title, year FROM books;',
    subExercises: [
      { id: 1, desc: '📅 Título y año', expected: 'SELECT title, year FROM books', hint: 'SELECT title, year FROM books;', example: 'SELECT author, pages FROM books;' },
      { id: 2, desc: '👤 Autor y género', expected: 'SELECT author, genre FROM books', hint: 'SELECT author, genre FROM books;', example: 'SELECT title, genre FROM books;' },
      { id: 3, desc: '📏 Título, autor, páginas', expected: 'SELECT title, author, pages FROM books', hint: 'SELECT title, author, pages FROM books;', example: 'SELECT title, year, genre FROM books;' },
      { id: 4, desc: '🎯 Año, género, páginas', expected: 'SELECT year, genre, pages FROM books', hint: 'SELECT year, genre, pages FROM books;', example: 'SELECT title, author, year FROM books;' }
    ],
    xp: 20, coins: 20, difficulty: 1, skill: 'SELECT',
    diaryEntry: 'Día 2: Conocí a Sofía Castellana. Fría y exigente, pero comenzó a respetarme.'
  },
  3: {
    title: 'El Filtro del Destino',
    dialogues: {
      1: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p><strong>DÍA 3 - PRIMERA REVELACIÓN</strong></p><p>Aprendiz, observa esto. <em>[Muestra páginas en blanco]</em></p><p>Los libros de <strong>Historia</strong> se borran primero. Alguien quiere que olvidemos nuestro pasado.</p><p>WHERE es tu nuevo poder. Filtra solo mis libros: <code>WHERE author = \'Lorenzo de Médicis\'</code></p><p>¡Encuentra lo que queda de mi obra!</p></div></div></div>'
      },
      2: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p>Bien. Ahora busca libros del año exacto 1500.</p><p>WHERE con números no usa comillas. <code>WHERE year = 1500</code></p></div></div></div>'
      },
      3: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p>Ahora filtra solo libros de Historia. <code>WHERE genre = \'Historia\'</code></p><p><em>[Las páginas brillan levemente]</em></p><p>¿Ves? El SCRIPTUM responde a la precisión.</p></div></div></div>'
      },
      4: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p>Busca los libros de Sofía Castellana.</p><p><em>[Al completar, un libro antiguo cae del estante]</em></p><p>¡Espera! Este libro... el autor dice "████████". El nombre está corrompido.</p><p><strong>REVELACIÓN:</strong> Hay un autor fantasma en el Archivo.</p></div></div></div>'
      }
    },
    concept: '<strong>📜 WHERE</strong><br>WHERE author = \'Lorenzo de Médicis\'',
    subExercises: [
      { id: 1, desc: "📚 De 'Lorenzo de Médicis'", expected: "SELECT title, author FROM books WHERE author = 'Lorenzo de Médicis'", hint: "WHERE author = 'Lorenzo de Médicis'", example: "SELECT title FROM books WHERE author = 'Platón (trad.)';" },
      { id: 2, desc: '🗓️ Año 1500', expected: "SELECT title, year FROM books WHERE year = 1500", hint: 'WHERE year = 1500', example: 'SELECT title FROM books WHERE year = 1505;' },
      { id: 3, desc: "📖 Género 'Historia'", expected: "SELECT title, genre FROM books WHERE genre = 'Historia'", hint: "WHERE genre = 'Historia'", example: "SELECT title FROM books WHERE genre = 'Filosofía';" },
      { id: 4, desc: "✍️ De 'Sofía Castellana'", expected: "SELECT title, year FROM books WHERE author = 'Sofía Castellana'", hint: "WHERE author = 'Sofía Castellana'", example: "SELECT title FROM books WHERE author = 'Marco Polo';" }
    ],
    xp: 25, coins: 25, difficulty: 2, badge: 'domador', skill: 'WHERE',
    diaryEntry: 'Día 3: Descubrí que los libros de Historia se borran primero. Encontré un nombre corrupto: un autor fantasma.',
    revelation: {
      title: '🔓 REVELACIÓN DESBLOQUEADA',
      text: 'Has descubierto que existe un AUTOR FANTASMA en el Archivo. Su nombre está corrompido por la maldición. ¿Quién es? ¿Por qué está oculto?'
    }
  }
};

// CONTINÚA EN PARTE 2...
// PARTE 2: Retos 4-10 con narrativa completa

  4: {
    title: 'Los Manuscritos del Tiempo',
    dialogues: {
      1: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p><strong>DÍA 4 - BUSCANDO RESPUESTAS</strong></p><p>Los manuscritos más antiguos podrían tener pistas sobre el autor fantasma.</p><p>Usa comparaciones: <code>WHERE year < 1500</code></p><p>Encuentra los libros anteriores a 1500.</p></div></div></div>'
      },
      2: {
        npc: 'sofia',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Sofía</div><div class="npc-text"><p>Los tomos más gruesos suelen contener secretos. Busca libros con más de 300 páginas.</p><p><code>WHERE pages > 300</code></p></div></div></div>'
      },
      3: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p>Ahora libros desde 1510 en adelante. <code>WHERE year >= 1510</code></p><p>La precisión es clave, aprendiz.</p></div></div></div>'
      },
      4: {
        npc: 'sofia',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Sofía</div><div class="npc-text"><p>Libros breves, 200 páginas o menos. <code>WHERE pages <= 200</code></p><p><em>[Sofía te mira con menos hostilidad]</em> Aprendes rápido.</p></div></div></div>'
      }
    },
    concept: '<strong>📜 Comparar</strong><br>WHERE year < 1500',
    subExercises: [
      { id: 1, desc: '📜 Antes 1500', expected: 'SELECT title, year FROM books WHERE year < 1500', hint: 'WHERE year < 1500', example: 'SELECT title FROM books WHERE year > 1520;' },
      { id: 2, desc: '📏 Más 300 pág', expected: 'SELECT title, pages FROM books WHERE pages > 300', hint: 'WHERE pages > 300', example: 'SELECT title FROM books WHERE pages < 100;' },
      { id: 3, desc: '📅 Desde 1510', expected: 'SELECT title, year FROM books WHERE year >= 1510', hint: 'WHERE year >= 1510', example: 'SELECT title FROM books WHERE year <= 1490;' },
      { id: 4, desc: '📖 200 pág o menos', expected: 'SELECT title, pages FROM books WHERE pages <= 200', hint: 'WHERE pages <= 200', example: 'SELECT title FROM books WHERE pages >= 250;' }
    ],
    xp: 25, coins: 30, difficulty: 2, skill: 'WHERE',
    diaryEntry: 'Día 4: Investigamos manuscritos antiguos. Sofía comienza a confiar en mí.'
  },
  5: {
    title: 'El Orden Perdido',
    dialogues: {
      1: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p><strong>DÍA 5 - EL CORAZÓN DEL SCRIPTUM</strong></p><p>ORDER BY es el corazón del SCRIPTUM. El orden no es solo organización... es el equilibrio del universo.</p><p>Ordena por año ascendente: <code>ORDER BY year ASC</code></p></div></div></div>'
      },
      2: {
        npc: 'sofia',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Sofía</div><div class="npc-text"><p>Ahora descendente por páginas. <code>ORDER BY pages DESC</code></p><p>Los más largos primero.</p></div></div></div>'
      },
      3: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p>Alfabéticamente por autor. <code>ORDER BY author ASC</code></p><p><em>[Los libros brillan intensamente]</em></p></div></div></div>'
      },
      4: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p>Títulos Z-A. <code>ORDER BY title DESC</code></p><p><em>[¡REVELACIÓN! Los primeros títulos forman un mensaje]</em></p><p><strong>"BUSCA AL AUTOR FANTASMA"</strong></p><p>¡El Códice nos habla!</p></div></div></div>'
      }
    },
    concept: '<strong>📜 ORDER BY</strong><br>ORDER BY year ASC',
    subExercises: [
      { id: 1, desc: '📅 Por año ASC', expected: 'SELECT title, year FROM books ORDER BY year ASC', hint: 'ORDER BY year ASC', example: 'SELECT title FROM books ORDER BY pages ASC;' },
      { id: 2, desc: '📖 Por páginas DESC', expected: 'SELECT title, pages FROM books ORDER BY pages DESC', hint: 'ORDER BY pages DESC', example: 'SELECT title FROM books ORDER BY year DESC;' },
      { id: 3, desc: '✍️ Por autor A-Z', expected: 'SELECT title, author FROM books ORDER BY author ASC', hint: 'ORDER BY author ASC', example: 'SELECT title FROM books ORDER BY genre ASC;' },
      { id: 4, desc: '🔤 Título Z-A', expected: 'SELECT title FROM books ORDER BY title DESC', hint: 'ORDER BY title DESC', example: 'SELECT author FROM books ORDER BY author DESC;' }
    ],
    xp: 30, coins: 35, difficulty: 2, badge: 'ordenador', skill: 'ORDER',
    diaryEntry: 'Día 5: ORDER BY reveló un mensaje oculto: "BUSCA AL AUTOR FANTASMA".',
    revelation: {
      title: '🔓 MENSAJE DEL CÓDICE',
      text: 'Al ordenar correctamente, el Códice reveló un mensaje: "BUSCA AL AUTOR FANTASMA". El conocimiento antiguo te guía.'
    }
  },
  6: {
    title: 'El Límite del Conocimiento',
    dialogues: {
      1: {
        npc: 'sofia',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Sofía</div><div class="npc-text"><p><strong>DÍA 6 - PROTECCIÓN MENTAL</strong></p><p>LIMIT te protege. Ver demasiado conocimiento de golpe... puede quebrar tu mente.</p><p>Otros aprendices intentaron ver todo. Enloquecieron.</p><p>Muestra solo los primeros 5. <code>LIMIT 5</code></p></div></div></div>'
      },
      2: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p>10 libros ahora. Control gradual.</p></div></div></div>'
      },
      3: {
        npc: 'sofia',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Sofía</div><div class="npc-text"><p>Los 3 más antiguos. Combina ORDER BY con LIMIT.</p><p><code>ORDER BY year ASC LIMIT 3</code></p></div></div></div>'
      },
      4: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p>Los 5 más largos. <code>ORDER BY pages DESC LIMIT 5</code></p><p>Dominas el límite, aprendiz.</p></div></div></div>'
      }
    },
    concept: '<strong>📜 LIMIT</strong><br>LIMIT 5',
    subExercises: [
      { id: 1, desc: '📚 Primeros 5', expected: 'SELECT title FROM books LIMIT 5', hint: 'LIMIT 5', example: 'SELECT title FROM books LIMIT 3;' },
      { id: 2, desc: '🔟 Primeros 10', expected: 'SELECT title, author FROM books LIMIT 10', hint: 'LIMIT 10', example: 'SELECT title FROM books LIMIT 8;' },
      { id: 3, desc: '🏆 3 más antiguos', expected: 'SELECT title, year FROM books ORDER BY year ASC LIMIT 3', hint: 'ORDER + LIMIT', example: 'SELECT title FROM books ORDER BY year DESC LIMIT 5;' },
      { id: 4, desc: '📖 5 más largos', expected: 'SELECT title, pages FROM books ORDER BY pages DESC LIMIT 5', hint: 'ORDER DESC LIMIT 5', example: 'SELECT title FROM books ORDER BY pages ASC LIMIT 3;' }
    ],
    xp: 30, coins: 40, difficulty: 2, skill: 'ORDER',
    diaryEntry: 'Día 6: Aprendí LIMIT. Sofía advirtió que ver demasiado puede quebrar la mente.'
  },
  7: {
    title: 'Los Valores Únicos',
    dialogues: {
      1: {
        npc: 'sofia',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Sofía</div><div class="npc-text"><p><strong>DÍA 7 - EL AUTOR OCULTO</strong></p><p>DISTINCT revela lo único. Encuentra los géneros que existen, sin repetir.</p><p><code>SELECT DISTINCT genre FROM books</code></p></div></div></div>'
      },
      2: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p>Ahora autores únicos. Busquemos al fantasma.</p></div></div></div>'
      },
      3: {
        npc: 'sofia',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Sofía</div><div class="npc-text"><p>Años únicos. Cada época cuenta una historia.</p></div></div></div>'
      },
      4: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p>Géneros ordenados alfabéticamente.</p><p><em>[Un nombre aparece distorsionado]</em></p><p><strong>¡ENCONTRADO! "CHRONOS EL ETERNO"</strong></p><p>Ese es el autor fantasma. Su nombre estaba oculto hace 500 años.</p></div></div></div>'
      }
    },
    concept: '<strong>📜 DISTINCT</strong><br>SELECT DISTINCT genre FROM books',
    subExercises: [
      { id: 1, desc: '📚 Géneros únicos', expected: 'SELECT DISTINCT genre FROM books', hint: 'SELECT DISTINCT genre', example: 'SELECT DISTINCT author FROM books;' },
      { id: 2, desc: '✍️ Autores únicos', expected: 'SELECT DISTINCT author FROM books', hint: 'SELECT DISTINCT author', example: 'SELECT DISTINCT genre FROM books;' },
      { id: 3, desc: '📅 Años únicos', expected: 'SELECT DISTINCT year FROM books', hint: 'SELECT DISTINCT year', example: 'SELECT DISTINCT pages FROM books;' },
      { id: 4, desc: '🎯 Géneros ordenados', expected: 'SELECT DISTINCT genre FROM books ORDER BY genre ASC', hint: 'DISTINCT + ORDER', example: 'SELECT DISTINCT author FROM books ORDER BY author DESC;' }
    ],
    xp: 35, coins: 45, difficulty: 3, badge: 'cazador', skill: 'ADVANCED',
    diaryEntry: 'Día 7: DISTINCT reveló al autor fantasma: CHRONOS EL ETERNO. Un nombre de hace 500 años.',
    revelation: {
      title: '🔓 AUTOR FANTASMA REVELADO',
      text: 'CHRONOS EL ETERNO. Un erudito exiliado hace 500 años. Maldijo el Códice antes de morir. Su venganza finalmente se cumple.'
    }
  },
  8: {
    title: 'La Confesión',
    dialogues: {
      1: {
        npc: 'sofia',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Sofía</div><div class="npc-text"><p><strong>DÍA 8 - LA VERDAD</strong></p><p><em>[Sofía tiembla]</em></p><p>Espera. Antes de continuar... debo confesarte algo.</p><p>Fui yo. El experimento con AND y OR... yo debilité las defensas del Códice. La maldición entró por MI culpa.</p><p>Si Lorenzo lo descubre, me exiliarán. Los libros son mi única familia.</p><p>Por favor... ayúdame a arreglarlo.</p><p>Ahora, usa AND: <code>WHERE year > 1500 AND pages < 200</code></p></div></div></div>'
      },
      2: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p>Ahora OR: Historia O Filosofía.</p><p><code>WHERE genre = \'Historia\' OR genre = \'Filosofía\'</code></p></div></div></div>'
      },
      3: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p><em>[Lorenzo entra súbitamente]</em></p><p>"Escuché todo, Sofía."</p><p><em>[Sofía llora]</em> "Lorenzo, yo—"</p><p>"Todos cometemos errores. Lo importante es enmendarlos. Ayúdanos."</p><p><em>[Sofía asiente, determinada]</em></p><p>Ahora juntos: <code>WHERE year < 1500 AND genre = \'Historia\'</code></p></div></div></div>'
      },
      4: {
        npc: 'sofia',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Sofía</div><div class="npc-text"><p>Gracias... ambos. Prometo no fallar de nuevo.</p><p>Última: <code>WHERE pages > 300 AND year < 1510</code></p><p>Juntos podemos detener a Chronos.</p></div></div></div>'
      }
    },
    concept: '<strong>📜 AND/OR</strong><br>WHERE year > 1500 AND pages < 200',
    subExercises: [
      { id: 1, desc: '📅 >1500 Y <200pág', expected: "SELECT title, year, pages FROM books WHERE year > 1500 AND pages < 200", hint: 'WHERE ... AND ...', example: "SELECT title FROM books WHERE year > 1510;" },
      { id: 2, desc: "📚 Historia O Filosofía", expected: "SELECT title, genre FROM books WHERE genre = 'Historia' OR genre = 'Filosofía'", hint: "genre = ... OR genre = ...", example: "SELECT title FROM books WHERE genre = 'Poesía';" },
      { id: 3, desc: '🎯 <1500 Y Historia', expected: "SELECT title, year, genre FROM books WHERE year < 1500 AND genre = 'Historia'", hint: "year < ... AND genre = ...", example: "SELECT title FROM books WHERE year < 1490;" },
      { id: 4, desc: '📖 >300pág Y <1510', expected: "SELECT title, pages, year FROM books WHERE pages > 300 AND year < 1510", hint: 'pages > ... AND year < ...', example: "SELECT title FROM books WHERE pages > 250;" }
    ],
    xp: 40, coins: 50, difficulty: 3, badge: 'revelacion', skill: 'WHERE',
    diaryEntry: 'Día 8: Sofía confesó que causó la maldición sin querer. Lorenzo la perdonó. Juntos venceremos.',
    revelation: {
      title: '💎 REDENCIÓN',
      text: 'Sofía confesó su error. Lorenzo mostró compasión. La unidad es más fuerte que la perfección. Ahora son un equipo.'
    }
  },
  9: {
    title: 'El Patrón Oculto',
    dialogues: {
      1: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p><strong>DÍA 9 - LA PREPARACIÓN</strong></p><p>LIKE busca patrones. El % es un comodín.</p><p>Busca títulos con "Crónicas": <code>WHERE title LIKE \'%Crónicas%\'</code></p><p>Estamos cerca de enfrentar a Chronos.</p></div></div></div>'
      },
      2: {
        npc: 'sofia',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Sofía</div><div class="npc-text"><p>Títulos que empiezan con "El": <code>LIKE \'El%\'</code></p></div></div></div>'
      },
      3: {
        npc: 'lorenzo',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo</div><div class="npc-text"><p>Autores con "Platón": <code>WHERE author LIKE \'%Platón%\'</code></p></div></div></div>'
      },
      4: {
        npc: 'sofia',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Sofía</div><div class="npc-text"><p>Títulos que terminan en "Florencia".</p><p><em>[Los tres se miran]</em></p><p><strong>LORENZO:</strong> "Mañana enfrentamos a Chronos. La Consulta Maestra nos espera."</p><p><strong>SOFÍA:</strong> "Estoy lista. Gracias por confiar en mí."</p><p><strong>TÚ:</strong> <em>[Asientes con determinación]</em></p></div></div></div>'
      }
    },
    concept: '<strong>📜 LIKE</strong><br>WHERE title LIKE \'%Crónicas%\'',
    subExercises: [
      { id: 1, desc: "🔍 Contiene 'Crónicas'", expected: "SELECT title, author FROM books WHERE title LIKE '%Crónicas%'", hint: "LIKE '%Crónicas%'", example: "SELECT title FROM books WHERE title LIKE '%Historia%';" },
      { id: 2, desc: "📖 Empieza 'El'", expected: "SELECT title FROM books WHERE title LIKE 'El%'", hint: "LIKE 'El%'", example: "SELECT title FROM books WHERE title LIKE 'La%';" },
      { id: 3, desc: "✍️ Contiene 'Platón'", expected: "SELECT author, title FROM books WHERE author LIKE '%Platón%'", hint: "LIKE '%Platón%'", example: "SELECT title FROM books WHERE author LIKE '%Leonardo%';" },
      { id: 4, desc: "🎯 Termina 'Florencia'", expected: "SELECT title, genre FROM books WHERE title LIKE '%Florencia'", hint: "LIKE '%Florencia'", example: "SELECT title FROM books WHERE title LIKE '%Valoria';" }
    ],
    xp: 45, coins: 60, difficulty: 3, skill: 'ADVANCED',
    diaryEntry: 'Día 9: Dominé LIKE. Mañana enfrentamos a Chronos. El equipo está unido.'
  },
  10: {
    title: 'El Manuscrito Crítico',
    dialogues: {
      1: {
        npc: 'both',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo y Sofía - BATALLA FINAL</div><div class="npc-text"><p><strong>DÍA 10 - LA CÁMARA DEL CÓDICE</strong></p><p><em>[Sala circular. El Códice flota, pulsando luz roja]</em></p><p><strong>LORENZO:</strong> "La Consulta Maestra tiene 4 llaves. Cada una más difícil."</p><p><strong>SOFÍA:</strong> "Si fallas... la maldición se vuelve permanente."</p><p><strong>CHRONOS (voz):</strong> "¿Un niño cree derrotarme? Yo era el MEJOR."</p><p><strong>PRIMERA LLAVE:</strong> Historia después de 1490.<br><code>WHERE genre = \'Historia\' AND year > 1490</code></p></div></div></div>'
      },
      2: {
        npc: 'both',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo y Sofía</div><div class="npc-text"><p><em>[Primera cerradura se abre. Luz dorada emerge]</em></p><p><strong>CHRONOS:</strong> "Suerte del principiante."</p><p><strong>SEGUNDA LLAVE:</strong> Ordenar por año ascendente.<br><code>+ ORDER BY year ASC</code></p><p><em>[El Códice vibra. Sombras atacan]</em></p><p><strong>LORENZO:</strong> <em>[Crea escudo de luz]</em> "¡Confío en ti!"</p></div></div></div>'
      },
      3: {
        npc: 'both',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo y Sofía</div><div class="npc-text"><p><em>[Segunda cerradura abierta]</em></p><p><strong>SOFÍA:</strong> "¡El escudo no aguantará mucho!"</p><p><strong>TERCERA LLAVE:</strong> Solo 3 resultados.<br><code>+ LIMIT 3</code></p><p><em>[Suelo tiembla]</em></p><p><strong>CHRONOS:</strong> "¡NO... NO PUEDE SER!"</p></div></div></div>'
      },
      4: {
        npc: 'both',
        text: '<div class="npc-dialogue"><span class="npc-avatar">👨‍🏫👩‍🏫</span><div style="display: inline-block; width: calc(100% - 80px); vertical-align: top;"><div class="npc-name">Lorenzo y Sofía - MOMENTO FINAL</div><div class="npc-text"><p><em>[Tres cerraduras abiertas. Una última queda]</em></p><p><strong>CUARTA LLAVE - LA CONSULTA MAESTRA:</strong></p><p>Combina TODO lo aprendido en una sola consulta perfecta.</p><p><code>SELECT title, author, year FROM books<br>WHERE genre = \'Historia\' AND year > 1490<br>ORDER BY year ASC<br>LIMIT 3</code></p><p><strong>LORENZO:</strong> "Este es el momento."</p><p><strong>SOFÍA:</strong> "Creemos en ti."</p><p><strong>CHRONOS:</strong> "¡IMPOSIBLE QUE LO LOGRES!"</p></div></div></div>'
      }
    },
    concept: '<strong>⚔️ BATALLA FINAL</strong><br>SELECT, WHERE, AND, ORDER, LIMIT',
    subExercises: [
      { id: 1, desc: "📚 Historia >1490 (LLAVE 1)", expected: "SELECT title, author, year FROM books WHERE genre = 'Historia' AND year > 1490", hint: "WHERE ... AND ...", example: "SELECT title FROM books WHERE genre = 'Filosofía';" },
      { id: 2, desc: '📊 + ordenado (LLAVE 2)', expected: "SELECT title, author, year FROM books WHERE genre = 'Historia' AND year > 1490 ORDER BY year ASC", hint: '+ ORDER BY', example: "SELECT title, year FROM books WHERE genre = 'Historia' ORDER BY year;" },
      { id: 3, desc: '🎯 + solo 3 (LLAVE 3)', expected: "SELECT title, author, year FROM books WHERE genre = 'Historia' AND year > 1490 ORDER BY year ASC LIMIT 3", hint: '+ LIMIT 3', example: "SELECT title FROM books WHERE genre = 'Historia' LIMIT 5;" },
      { id: 4, desc: '👑 CONSULTA MAESTRA (LLAVE 4)', expected: "SELECT title, author, year FROM books WHERE genre = 'Historia' AND year > 1490 ORDER BY year ASC LIMIT 3", hint: 'La consulta perfecta', example: "SELECT title FROM books WHERE genre = 'Filosofía';" }
    ],
    xp: 100, coins: 150, difficulty: 4, badge: 'conquistador', skill: 'ADVANCED',
    diaryEntry: 'Día 10: Vencí a Chronos. El Códice está restaurado. Valoria está a salvo. Soy un Maestro.',
    finalCinematic: true
  }
};

// Funciones narrativas

function addDiaryEntry(entry) {
  const day = window.gameState.currentDay;
  if (!window.gameState.diary.find(d => d.day === day)) {
    window.gameState.diary.push({ day, entry });
    saveGameState();
  }
}

function showRevelation(revelation) {
  if (!revelation) return;
  
  const modal = document.getElementById('modalGeneric');
  const content = document.getElementById('modalGenericContent');
  content.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <div style="font-size: 64px; margin-bottom: 20px;">🔓</div>
      <h2 style="color: var(--primary); margin-bottom: 15px;">${revelation.title}</h2>
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; border: 2px solid var(--warning); margin: 20px 0;">
        <p style="font-size: 16px; line-height: 1.8;">${revelation.text}</p>
      </div>
      <button class="btn" onclick="closeModal('modalGeneric')" style="margin-top: 15px;">Continuar</button>
    </div>
  `;
  modal.classList.add('active');
  sounds.success();
}

function showFinalCinematic() {
  const modal = document.getElementById('modalGeneric');
  const content = document.getElementById('modalGenericContent');
  content.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <div style="font-size: 72px; margin-bottom: 20px; animation: pulse 1s infinite;">🏆</div>
      <h1 style="color: var(--primary); margin-bottom: 20px; font-size: 32px;">¡CHRONOS VENCIDO!</h1>
      
      <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 25px; border-radius: 12px; margin: 20px 0; text-align: left;">
        <p style="margin-bottom: 15px; font-size: 16px; line-height: 1.8;">
          <strong style="color: var(--secondary);">[Explosión de luz dorada]</strong>
        </p>
        <p style="margin-bottom: 15px;">El Códice se restaura, brillando como el sol.</p>
        <p style="margin-bottom: 15px;">Las sombras de Chronos gritan y se desvanecen.</p>
        <p style="margin-bottom: 15px;">Los libros regresan volando a sus estantes.</p>
        <p style="margin-bottom: 20px;">Las palabras borradas reaparecen en las páginas.</p>
        
        <p style="margin-bottom: 10px;"><strong>LORENZO</strong> <em>(con lágrimas):</em></p>
        <p style="margin-bottom: 20px; font-style: italic;">"Lo lograste. Mi hermano estaría orgulloso. El Archivo es tuyo ahora, Maestro."</p>
        
        <p style="margin-bottom: 10px;"><strong>SOFÍA</strong> <em>(sonriendo):</em></p>
        <p style="font-style: italic;">"Nunca pensé que diría esto... pero me salvaste. Gracias, compañero."</p>
      </div>
      
      <div style="background: var(--accent); padding: 20px; border-radius: 12px; margin: 20px 0;">
        <p style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">🎉 MUNDO 1 COMPLETADO</p>
        <p style="margin-bottom: 10px;">40 ejercicios dominados</p>
        <p style="font-size: 14px; opacity: 0.9;">+50 XP | +200 monedas | Insignia Salvador de Valoria</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%); padding: 20px; border-radius: 12px; margin: 20px 0; color: white;">
        <p style="margin-bottom: 15px; font-size: 14px; opacity: 0.8;">Pero en las sombras...</p>
        <p style="margin-bottom: 15px; font-style: italic;">"Una figura encapuchada observa desde una torre."</p>
        <p style="font-size: 16px; font-weight: bold;">El Mundo 2 te espera, Maestro.</p>
      </div>
      
      <button class="btn" onclick="closeModal('modalGeneric')" style="font-size: 18px; padding: 16px 32px; margin-top: 20px;">¡Gloria a Valoria!</button>
    </div>
  `;
  modal.classList.add('active');
  
  if (typeof confetti !== 'undefined') {
    confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } });
    setTimeout(() => confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } }), 500);
    setTimeout(() => confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } }), 1000);
  }
}

// RESTO DEL CÓDIGO (funciones existentes)...

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
        </svg>
      </div>
      <h1 style="font-size: 32px; color: var(--primary); margin-bottom: 20px;">El Manuscrito Perdido</h1>
      <p style="font-size: 18px; color: var(--muted); margin-bottom: 10px;">Una aventura épica</p>
      <p style="font-size: 14px; color: var(--muted); margin-bottom: 30px;">v1.2 - Narrativa Completa</p>
      <button class="btn" onclick="showOnboardingStep(2)" style="font-size: 18px; padding: 16px 32px;">⚔️ Comenzar Aventura</button>
    `;
  } else if (step === 2) {
    content.innerHTML = `
      <h2 style="color: var(--primary); margin-bottom: 20px;">¿Cómo te llaman?</h2>
      <p style="color: var(--muted); margin-bottom: 20px;">En el Scriptorium de Valoria, todos tienen un nombre</p>
      <input type="text" id="nameInput" class="input-name" placeholder="Tu nombre (3-15 caracteres)" maxlength="15">
      <button class="btn" onclick="saveName()" style="width: 100%; margin-top: 20px;">Continuar</button>
    `;
    setTimeout(() => document.getElementById('nameInput').focus(), 100);
  } else if (step === 3) {
    content.innerHTML = `
      <h2 style="color: var(--primary); margin-bottom: 20px;">Elige tu avatar</h2>
      <div class="avatar-selector">
        <div class="avatar-card active" onclick="selectAvatar(0)">
          <div class="avatar-icon">📚</div>
          <div style="font-size: 14px; font-weight: bold;">El Aprendiz</div>
        </div>
        <div class="avatar-card" onclick="selectAvatar(1)">
          <div class="avatar-icon">🧙‍♂️</div>
          <div style="font-size: 14px; font-weight: bold;">El Erudito</div>
        </div>
        <div class="avatar-card" onclick="selectAvatar(2)">
          <div class="avatar-icon">🔥</div>
          <div style="font-size: 14px; font-weight: bold;">Portador de Fuego</div>
        </div>
      </div>
      <button class="btn" onclick="showOnboardingStep(4)" style="width: 100%; margin-top: 20px;">Continuar</button>
    `;
  } else if (step === 4) {
    content.innerHTML = `
      <div style="text-align: left;">
        <h2 style="color: var(--primary); margin-bottom: 20px; text-align: center;">🏛️ Scriptorium de Valoria</h2>
        <div style="background: #f0f9ff; border-left: 4px solid var(--secondary); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin-bottom: 15px; font-size: 16px;"><strong style="color: var(--primary);">Lorenzo de Médicis, Guardián del Archivo:</strong></p>
          <p style="font-size: 15px; line-height: 1.6; font-style: italic;">"El Eclipse de Sangre cayó sobre Valoria. El Códice Primordial está maldito. Los libros se desvanecen. El conocimiento muere. Solo el antiguo lenguaje SQL puede salvarnos. Tienes 40 días. ¿Te atreves?"</p>
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
  window.gameState.currentDay = 1;
  window.gameState.diary.push({
    day: 0,
    entry: 'Acepté el desafío de Lorenzo. Valoria depende de mí.'
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
  const headerAvatar = document.getElementById('headerAvatar');
  const panelAvatar = document.getElementById('panelAvatar');
  if (headerAvatar) headerAvatar.textContent = selected;
  if (panelAvatar) panelAvatar.textContent = selected;
}

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
    const totalSubs = 4;
    const isFullyCompleted = completedSubs.length === totalSubs;
    const isCurrent = window.gameState.currentChallenge === i;
    const isExpanded = window.gameState.expandedChallenges.includes(i);
    
    const div = document.createElement('div');
    div.className = `challenge-item ${isCurrent ? 'active' : ''} ${isFullyCompleted ? 'completed' : ''} ${isExpanded ? 'expanded' : ''}`;
    
    let subExercisesHTML = '';
    if (isExpanded) {
      subExercisesHTML = '<div class="sub-exercises">';
      challenge.subExercises.forEach((sub, idx) => {
        const subCompleted = completedSubs.includes(sub.id);
        const subCurrent = isCurrent && window.gameState.currentSubExercise === sub.id;
        subExercisesHTML += `<div class="sub-exercise ${subCompleted ? 'completed' : ''} ${subCurrent ? 'active' : ''}" onclick="loadSubExercise(${i}, ${sub.id}); event.stopPropagation();">${i}.${sub.id} ${sub.desc} ${subCompleted ? '✓' : ''}</div>`;
      });
      subExercisesHTML += '</div>';
    }
    
    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-weight: bold;">${isExpanded ? '▼' : '▶'} ${i}. ${challenge.title}</div>
        <div style="font-size: 11px;">[${completedSubs.length}/4]</div>
      </div>
      <div style="font-size: 12px; margin-top: 4px;">${'⭐'.repeat(challenge.difficulty)}</div>
      ${subExercisesHTML}
    `;
    
    div.onclick = function(e) {
      if (e.target.classList.contains('sub-exercise')) return;
      sounds.click();
      toggleChallengeExpansion(i);
    };
    
    list.appendChild(div);
  }
}

function toggleChallengeExpansion(challengeId) {
  const index = window.gameState.expandedChallenges.indexOf(challengeId);
  if (index > -1) {
    window.gameState.expandedChallenges.splice(index, 1);
  } else {
    window.gameState.expandedChallenges.push(challengeId);
  }
  saveGameState();
  renderChallenges();
}

window.loadSubExercise = function(challengeId, subExerciseId) {
  sounds.click();
  window.gameState.currentChallenge = challengeId;
  window.gameState.currentSubExercise = subExerciseId;
  
  const completedSubs = window.gameState.completedSubExercises[challengeId] || [];
  window.gameState.practiceMode = completedSubs.includes(subExerciseId);
  
  saveGameState();
  renderChallenges();
  loadChallenge(challengeId, subExerciseId);
};

function loadChallenge(challengeId, subExerciseId) {
  const challenge = challenges[challengeId];
  const subExercise = challenge.subExercises.find(s => s.id === subExerciseId);
  const dialogue = challenge.dialogues[subExerciseId];
  
  const banner = document.getElementById('practiceBanner');
  const dayCounter = `<div style="text-align: center; padding: 8px; background: linear-gradient(90deg, var(--secondary) 0%, var(--accent) 100%); color: white; font-weight: bold; border-radius: 8px; margin-bottom: 10px;">⏰ DÍA ${window.gameState.currentDay}/40</div>`;
  
  if (window.gameState.practiceMode) {
    banner.innerHTML = dayCounter + '<div class="practice-mode-banner">🎯 MODO PRÁCTICA</div>';
  } else {
    banner.innerHTML = dayCounter;
  }
  
  document.getElementById('challengeTitle').textContent = `${challengeId}. ${challenge.title}`;
  document.getElementById('challengeDesc').textContent = `Ejercicio ${challengeId}.${subExerciseId}: ${subExercise.desc}`;
  document.getElementById('npcDialogue').innerHTML = dialogue ? dialogue.text : '';
  document.getElementById('conceptBox').innerHTML = challenge.concept;
  document.getElementById('sqlEditor').value = '-- Escribe tu consulta aquí\n';
  document.getElementById('results').innerHTML = '<strong>📊 Resultados</strong><p style="color: var(--muted); margin-top: 10px;">Ejecuta...</p>';
  
  window.gameState.attempts = 0;
  window.gameState.exampleUnlocked = false;
  updateAttemptCounter();
}

function updateProgressBar() {
  let totalCompleted = 0;
  for (let i = 1; i <= 10; i++) {
    const completed = window.gameState.completedSubExercises[i] || [];
    totalCompleted += completed.length;
  }
  
  const percentage = Math.round((totalCompleted / 40) * 100);
  document.getElementById('worldProgress').textContent = `${totalCompleted}/40`;
  document.getElementById('worldProgressBar').style.width = percentage + '%';
  document.getElementById('worldProgressBar').textContent = percentage + '%';
  
  const stars = document.getElementById('lorenzoRep');
  const rep = Math.floor(window.gameState.reputation.lorenzo);
  stars.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    stars.innerHTML += `<span class="star ${i < rep ? '' : 'empty'}">★</span>`;
  }
}

function updateSkillBars() {
  const skills = window.gameState.skills;
  ['SELECT', 'WHERE', 'ORDER', 'ADVANCED'].forEach(skill => {
    const elem = document.getElementById(`skill${skill}`);
    if (elem) {
      const percent = Math.min(100, skills[skill]);
      elem.style.width = percent + '%';
      elem.textContent = percent + '%';
    }
  });
}

window.executeQuery = function() {
  sounds.click();
  const query = document.getElementById('sqlEditor').value.trim();
  if (!query || query === '-- Escribe tu consulta aquí') {
    sounds.error();
    alert('Escribe una consulta');
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
    container.innerHTML += '<p style="color: var(--muted); margin-top: 10px;">Sin resultados.</p>';
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
  container.innerHTML = `<strong style="color: var(--danger);">❌ Error</strong><pre style="color: var(--danger); margin-top: 10px; font-size: 14px;">${message}</pre>`;
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
  
  if (!window.gameState.practiceMode && !completedSubs.includes(subExerciseId)) {
    completedSubs.push(subExerciseId);
    window.gameState.completedSubExercises[challengeId] = completedSubs;
    
    const subXP = Math.ceil(challenge.xp / 4);
    const subCoins = Math.ceil(challenge.coins / 4);
    window.gameState.xp += subXP;
    window.gameState.coins += subCoins;
    
    window.gameState.skills[challenge.skill] = Math.min(100, window.gameState.skills[challenge.skill] + 5);
    window.gameState.reputation.lorenzo = Math.min(3, window.gameState.reputation.lorenzo + 0.25);
    
    if (completedSubs.length === 4) {
      window.gameState.currentDay++;
      if (challenge.diaryEntry) {
        addDiaryEntry(challenge.diaryEntry);
      }
      if (challenge.badge && !window.gameState.unlockedBadges.includes(challenge.badge)) {
        window.gameState.unlockedBadges.push(challenge.badge);
      }
      if (challenge.revelation) {
        setTimeout(() => showRevelation(challenge.revelation), 1500);
      }
    }
    
    if (challengeId === 10 && completedSubs.length === 4) {
      window.gameState.coins += 200;
      window.gameState.xp += 50;
      if (!window.gameState.unlockedBadges.includes('mundo1')) {
        window.gameState.unlockedBadges.push('mundo1');
      }
      if (challenge.finalCinematic) {
        setTimeout(() => showFinalCinematic(), 2000);
      }
    }
    
    saveGameState();
  }
  
  const headerAvatar = document.getElementById('headerAvatar');
  if (headerAvatar) {
    headerAvatar.classList.add('avatar-celebrate');
    setTimeout(() => headerAvatar.classList.remove('avatar-celebrate'), 1000);
  }
  
  sounds.success();
  if (typeof confetti !== 'undefined') {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  }
  
  const resultsDiv = document.getElementById('results');
  const successMsg = document.createElement('div');
  successMsg.style.cssText = 'margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px;';
  successMsg.innerHTML = window.gameState.practiceMode ? 
    '<div style="text-align: center;"><div style="font-size: 48px;">✅</div><h3>¡Correcto!</h3><p>Modo práctica</p></div>' :
    '<div style="text-align: center;"><div style="font-size: 48px;">🎉</div><h3>¡Completado!</h3></div>';
  resultsDiv.appendChild(successMsg);
  
  renderGame();
  
  if (subExerciseId < 4) {
    setTimeout(() => {
      window.gameState.currentSubExercise = subExerciseId + 1;
      loadChallenge(challengeId, subExerciseId + 1);
      renderChallenges();
    }, 2000);
  } else if (challengeId < 10) {
    setTimeout(() => {
      window.gameState.currentChallenge = challengeId + 1;
      window.gameState.currentSubExercise = 1;
      renderGame();
    }, 3000);
  }
}

function updateAttemptCounter() {
  const counter = document.getElementById('attemptCounter');
  const exampleBtn = document.getElementById('exampleBtn');
  
  if (window.gameState.attempts === 0) {
    counter.style.display = 'none';
    exampleBtn.disabled = true;
    exampleBtn.innerHTML = '🔒 Ver Ejemplo';
  } else if (window.gameState.attempts < 3) {
    counter.style.display = 'flex';
    document.getElementById('attemptText').textContent = `Intento ${window.gameState.attempts}/3`;
    exampleBtn.disabled = true;
    exampleBtn.innerHTML = `🔒 (${3 - window.gameState.attempts} más)`;
  } else {
    counter.style.display = 'flex';
    document.getElementById('attemptText').textContent = `💡 Desbloqueado`;
    exampleBtn.disabled = false;
    exampleBtn.innerHTML = '💡 Ver Ejemplo';
    window.gameState.exampleUnlocked = true;
  }
}

window.showExample = function() {
  if (!window.gameState.exampleUnlocked) {
    sounds.error();
    alert('Necesitas 3 intentos');
    return;
  }
  sounds.click();
  const challenge = challenges[window.gameState.currentChallenge];
  const subExercise = challenge.subExercises.find(s => s.id === window.gameState.currentSubExercise);
  alert(`💡 EJEMPLO:\n\n${subExercise.example}\n\nAdáptalo.`);
};

window.clearEditor = function() {
  sounds.click();
  document.getElementById('sqlEditor').value = '-- Escribe tu consulta aquí\n';
};

window.showHints = function() {
  sounds.click();
  const challenge = challenges[window.gameState.currentChallenge];
  const subExercise = challenge.subExercises.find(s => s.id === window.gameState.currentSubExercise);
  const content = document.getElementById('modalGenericContent');
  content.innerHTML = `
    <h2>💡 Pista</h2>
    <div style="padding: 15px; background: #fffbeb; border-radius: 8px; margin-top: 20px;">
      <strong>💡</strong><br><div style="margin-top: 10px;">${subExercise.hint}</div>
    </div>
    <button class="btn" onclick="closeModal('modalGeneric')" style="margin-top: 20px; width: 100%;">Cerrar</button>
  `;
  document.getElementById('modalGeneric').classList.add('active');
};

window.showTables = function() {
  sounds.click();
  const content = document.getElementById('modalGenericContent');
  content.innerHTML = `
    <h2>📊 Mis Tablas</h2>
    <div style="margin: 20px 0;">
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
    <button class="btn" onclick="closeModal('modalGeneric')" style="width: 100%;">Cerrar</button>
  `;
  document.getElementById('modalGeneric').classList.add('active');
};

window.toggleTables = function() {
  sounds.click();
  const panel = document.getElementById('tablesPanel');
  const toggle = document.getElementById('tablesToggle');
  
  if (panel && toggle) {
    if (panel.style.display === 'none' || panel.style.display === '') {
      panel.style.display = 'block';
      toggle.textContent = '▲';
    } else {
      panel.style.display = 'none';
      toggle.textContent = '▼';
    }
  }
};

window.showBadges = function() {
  sounds.click();
  const content = document.getElementById('modalGenericContent');
  content.innerHTML = '<h2>🏆 Mis Insignias</h2>';
  const grid = document.createElement('div');
  grid.className = 'badge-grid';
  allBadges.forEach(badge => {
    const unlocked = window.gameState.unlockedBadges.includes(badge.id);
    const div = document.createElement('div');
    div.className = `badge-item ${unlocked ? 'unlocked' : 'locked'}`;
    div.innerHTML = `<div class="badge-icon">${badge.icon}</div><div style="font-weight: bold; font-size: 14px;">${badge.name}</div><div style="font-size: 12px; color: var(--muted); margin-top: 5px;">${badge.desc}</div>`;
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
  content.innerHTML = `<h2>🛍️ Tienda</h2><p style="color: var(--muted); margin: 20px 0;">Próximamente: Skins épicas para tu avatar</p><button class="btn" onclick="closeModal('modalGeneric')" style="margin-top: 20px; width: 100%;">Cerrar</button>`;
  document.getElementById('modalGeneric').classList.add('active');
};

window.showDiary = function() {
  sounds.click();
  const content = document.getElementById('modalGenericContent');
  content.innerHTML = '<h2>📖 Mi Diario de Aventuras</h2>';
  
  if (window.gameState.diary.length === 0) {
    content.innerHTML += '<p style="color: var(--muted); margin: 20px 0;">Tu aventura está comenzando...</p>';
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

window.closeModal = function(id) {
  sounds.click();
  document.getElementById(id).classList.remove('active');
};
