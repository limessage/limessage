// ==========================================
//  LIMESSAGE v1.0 - С EMAIL ВЕРИФИКАЦИЕЙ
// ==========================================

// 🔥 FIREBASE CONFIG - ЗАМЕНИ НА СВОЙ!
const firebaseConfig = {
  apiKey: "service_j6yvvkv",
  authDomain: "ТВОЙ.firebaseapp.com",
  databaseURL: "https://ТВОЙ-default-rtdb.firebaseio.com",
  projectId: "ТВОЙ",
  storageBucket: "ТВОЙ.appspot.com",
  messagingSenderId: "ТВОЙ_ID",
  appId: "ТВОЙ_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 📧 EMAILJS - ЗАМЕНИ НА СВОЙ!
// Регистрация: https://www.emailjs.com (бесплатно 200 писем/мес)
const EMAILJS_PUBLIC_KEY = "EHEtdA5nbc5lb7sRm";
const EMAILJS_SERVICE_ID = "service_92ebgfx";
const EMAILJS_TEMPLATE_ID = "template_7bet76h";

// Инициализация EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let currentUser = null;
let currentChat = null;
let messagesListener = null;
let pendingRegistration = null;
let currentVerificationCode = null;

// ===== DOM =====
const authScreen = document.getElementById('auth-screen');
const mainScreen = document.getElementById('main-screen');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const chatList = document.getElementById('chat-list');
const messagesDiv = document.getElementById('messages');
const msgInput = document.getElementById('msg-input');
const currentChatSpan = document.getElementById('current-chat');
const userInfoDiv = document.getElementById('user-info');

const emailModal = document.getElementById('email-modal');
const emailDisplay = document.getElementById('email-display');
const verificationCodeInput = document.getElementById('verification-code');
const emailError = document.getElementById('email-error');
const emailSuccess = document.getElementById('email-success');

const termsModal = document.getElementById('terms-modal');
const termsContent = document.getElementById('terms-content');
const checkboxContainer = document.getElementById('checkbox-container');
const termsCheckbox = document.getElementById('terms-checkbox');
const btnAccept = document.getElementById('btn-accept');
const btnDecline = document.getElementById('btn-decline');
const scrollIndicator = document.getElementById('scroll-indicator');

// ===== УТИЛИТЫ =====
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmail(email, username, code) {
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: email,
      to_name: username,
      code: code,
      from_name: 'Limessage Administration'
    });
    console.log('✅ Email отправлен');
    return true;
  } catch (err) {
    console.error('❌ Ошибка отправки email:', err);
    return false;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== ПЕРЕКЛЮЧЕНИЕ ФОРМ =====
document.getElementById('btn-show-register').addEventListener('click', () => {
  loginForm.style.display = 'none';
  registerForm.style.display = 'block';
  loginError.textContent = '';
  registerError.textContent = '';
});

document.getElementById('btn-show-login').addEventListener('click', () => {
  registerForm.style.display = 'none';
  loginForm.style.display = 'block';
  loginError.textContent = '';
  registerError.textContent = '';
});

// ===== ВХОД =====
document.getElementById('btn-login').addEventListener('click', async () => {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const remember = document.getElementById('remember-me').checked;
  
  if (!username || !password) {
    loginError.textContent = 'Заполните все поля';
    return;
  }
  
  const snapshot = await db.ref('users').orderByChild('username').equalTo(username).once('value');
  
  if (!snapshot.exists()) {
    loginError.textContent = 'Пользователь не найден';
    return;
  }
  
  let userData = null;
  let userUid = null;
  snapshot.forEach((child) => {
    userData = child.val();
    userUid = child.key;
  });
  
  if (userData.password !== password) {
    loginError.textContent = 'Неверный пароль';
    return;
  }
  
  if (!userData.verified) {
    loginError.textContent = 'Email не подтверждён';
    return;
  }
  
  currentUser = { uid: userUid, ...userData };
  
  if (remember) {
    localStorage.setItem('limessage_user', JSON.stringify(currentUser));
  } else {
    sessionStorage.setItem('limessage_user', JSON.stringify(currentUser));
  }
  
  enterApp();
});

// ===== РЕГИСТРАЦИЯ =====
document.getElementById('btn-register').addEventListener('click', async () => {
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const passwordConfirm = document.getElementById('reg-password-confirm').value;
  
  registerError.textContent = '';
  
  // Валидация
  if (!username || !email || !password || !passwordConfirm) {
    registerError.textContent = 'Заполните все поля';
    return;
  }
  if (username.length < 3 || username.length > 20) {
    registerError.textContent = 'Имя: 3-20 символов';
    return;
  }
  if (!/^[a-zA-Z0-9_а-яА-ЯёЁ]+$/.test(username)) {
    registerError.textContent = 'Только буквы, цифры, _';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    registerError.textContent = 'Неверный email';
    return;
  }
  if (password.length < 8) {
    registerError.textContent = 'Пароль: минимум 8 символов';
    return;
  }
  if (password !== passwordConfirm) {
    registerError.textContent = 'Пароли не совпадают';
    return;
  }
  
  // Проверяем уникальность
  const snap = await db.ref('users').orderByChild('username').equalTo(username).once('value');
  if (snap.exists()) {
    registerError.textContent = 'Имя уже занято';
    return;
  }
  
  const snapEmail = await db.ref('users').orderByChild('email').equalTo(email).once('value');
  if (snapEmail.exists()) {
    registerError.textContent = 'Email уже используется';
    return;
  }
  
  // Сохраняем данные
  pendingRegistration = { username, email, password, createdAt: Date.now() };
  
  // Генерируем код
  currentVerificationCode = generateCode();
  
  // Сохраняем код в Firebase (для проверки)
  await db.ref('verification_codes/' + email).set({
    code: currentVerificationCode,
    username: username,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 часа
  });
  
  // Отправляем email
  const sent = await sendEmail(email, username, currentVerificationCode);
  
  // Показываем окно ввода кода
  emailDisplay.textContent = email;
  emailError.textContent = '';
  emailSuccess.textContent = '';
  verificationCodeInput.value = '';
  
  if (!sent) {
    emailSuccess.textContent = '⚠️ Email не отправлен. Код для тестирования: ' + currentVerificationCode;
  } else {
    emailSuccess.textContent = '✅ Код отправлен на ' + email;
  }
  
  emailModal.style.display = 'flex';
  verificationCodeInput.focus();
});

// ===== ПРОВЕРКА КОДА =====
document.getElementById('btn-verify-email').addEventListener('click', async () => {
  const code = verificationCodeInput.value.trim();
  emailError.textContent = '';
  emailSuccess.textContent = '';
  
  if (!code || code.length !== 6) {
    emailError.textContent = 'Введите 6-значный код';
    return;
  }
  
  // Получаем код из базы
  const snap = await db.ref('verification_codes/' + pendingRegistration.email).once('value');
  
  if (!snap.exists()) {
    emailError.textContent = 'Код не найден. Запросите новый.';
    return;
  }
  
  const data = snap.val();
  
  // Проверяем срок
  if (Date.now() > data.expiresAt) {
    emailError.textContent = 'Код истёк. Запросите новый.';
    return;
  }
  
  // Проверяем код
  if (data.code !== code) {
    emailError.textContent = 'Неверный код';
    return;
  }
  
  // ✅ КОД ВЕРНЫЙ!
  emailSuccess.textContent = '✅ Код подтверждён!';
  
  // Удаляем код из базы
  await db.ref('verification_codes/' + pendingRegistration.email).remove();
  
  // Показываем окно условий через секунду
  setTimeout(() => {
    emailModal.style.display = 'none';
    showTermsModal();
  }, 1000);
});

// ===== ОТПРАВИТЬ КОД ПОВТОРНО =====
document.getElementById('btn-resend-code').addEventListener('click', async () => {
  if (!pendingRegistration) return;
  
  currentVerificationCode = generateCode();
  
  await db.ref('verification_codes/' + pendingRegistration.email).set({
    code: currentVerificationCode,
    username: pendingRegistration.username,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  });
  
  const sent = await sendEmail(pendingRegistration.email, pendingRegistration.username, currentVerificationCode);
  
  if (sent) {
    emailSuccess.textContent = '✅ Новый код отправлен';
  } else {
    emailSuccess.textContent = '⚠️ Код: ' + currentVerificationCode;
  }
  
  emailError.textContent = '';
});

// ===== ОТМЕНА ВЕРИФИКАЦИИ =====
document.getElementById('btn-cancel-verify').addEventListener('click', () => {
  emailModal.style.display = 'none';
  pendingRegistration = null;
  currentVerificationCode = null;
  registerError.textContent = 'Регистрация отменена';
});

// ===== ЛОГИКА ОКНА УСЛОВИЙ =====
termsContent.addEventListener('scroll', () => {
  const scrollTop = termsContent.scrollTop;
  const scrollHeight = termsContent.scrollHeight;
  const clientHeight = termsContent.clientHeight;
  
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    checkboxContainer.classList.add('active');
    scrollIndicator.style.display = 'none';
  }
});

termsCheckbox.addEventListener('change', () => {
  btnAccept.disabled = !termsCheckbox.checked;
});

function showTermsModal() {
  termsModal.style.display = 'flex';
  checkboxContainer.classList.remove('active');
  termsCheckbox.checked = false;
  btnAccept.disabled = true;
  termsContent.scrollTop = 0;
  scrollIndicator.style.display = 'block';
}

// ===== ПРИНЯТЬ УСЛОВИЯ =====
btnAccept.addEventListener('click', async () => {
  if (!pendingRegistration) return;
  
  // Создаём пользователя в базе
  const userRef = db.ref('users').push();
  await userRef.set({
    username: pendingRegistration.username,
    email: pendingRegistration.email,
    password: pendingRegistration.password,
    verified: true,
    termsAccepted: true,
    registeredAt: Date.now(),
    lastSeen: Date.now()
  });
  
  // Создаём общий чат
  await db.ref('chats/general/participants/' + userRef.key).set(true);
  
  // Автоматический вход
  currentUser = { uid: userRef.key, ...pendingRegistration };
  localStorage.setItem('limessage_user', JSON.stringify(currentUser));
  
  termsModal.style.display = 'none';
  pendingRegistration = null;
  currentVerificationCode = null;
  
  enterApp();
});

// ===== ОТКЛОНИТЬ УСЛОВИЯ =====
btnDecline.addEventListener('click', () => {
  if (confirm('Вы уверены? Данные регистрации будут удалены.')) {
    termsModal.style.display = 'none';
    pendingRegistration = null;
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    registerError.textContent = 'Регистрация отменена';
  }
});

// ===== ВХОД В ПРИЛОЖЕНИЕ =====
function enterApp() {
  authScreen.style.display = 'none';
  mainScreen.style.display = 'flex';
  userInfoDiv.textContent = '◈ ' + currentUser.username;
  
  loadChats();
}

// ===== ВЫХОД =====
document.getElementById('btn-logout').addEventListener('click', () => {
  if (confirm('Выйти из аккаунта?')) {
    localStorage.removeItem('limessage_user');
    sessionStorage.removeItem('limessage_user');
    location.reload();
  }
});

// ===== ЗАГРУЗКА ЧАТОВ =====
function loadChats() {
  db.ref('chats').on('value', (snapshot) => {
    chatList.innerHTML = '';
    
    if (!snapshot.exists()) {
      // Создаём общий чат
      db.ref('chats/general').set({
        name: 'Общий чат',
        createdAt: Date.now(),
        participants: { [currentUser.uid]: true }
      });
      return;
    }
    
    snapshot.forEach((childSnapshot) => {
      const chat = childSnapshot.val();
      if (chat.participants && chat.participants[currentUser.uid]) {
        const chatDiv = document.createElement('div');
        chatDiv.className = 'chat-item' + (childSnapshot.key === currentChat ? ' active' : '');
        chatDiv.innerHTML = `
          <div class="chat-item-name">◈ ${escapeHtml(chat.name)}</div>
          <div class="chat-item-last">${chat.lastMessage || 'Нет сообщений'}</div>
        `;
        chatDiv.addEventListener('click', () => openChat(childSnapshot.key, chat.name));
        chatList.appendChild(chatDiv);
      }
    });
  });
}

// ===== ОТКРЫТИЕ ЧАТА =====
function openChat(chatId, chatName) {
  currentChat = chatId;
  currentChatSpan.textContent = '◈ ' + chatName;
  
  db.ref('chats/' + chatId + '/participants/' + currentUser.uid).set(true);
  
  loadMessages(chatId);
  
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.add('hidden');
  }
}

// ===== ЗАГРУЗКА СООБЩЕНИЙ =====
function loadMessages(chatId) {
  if (messagesListener) {
    db.ref('chats/' + currentChat + '/messages').off('child_added', messagesListener);
  }
  
  messagesDiv.innerHTML = '';
  
  messagesListener = db.ref('chats/' + chatId + '/messages')
    .orderByChild('timestamp')
    .limitToLast(100)
    .on('child_added', (snapshot) => {
      const msg = snapshot.val();
      renderMessage(msg, snapshot.key);
    });
}

function renderMessage(msg, key) {
  const isOwn = msg.senderId === currentUser.uid;
  const time = new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message' + (isOwn ? ' own' : '');
  msgDiv.dataset.key = key;
  
  msgDiv.innerHTML = `
    <div class="message-author">${escapeHtml(msg.senderName)}</div>
    <div class="message-text">${escapeHtml(msg.text)}</div>
    <div class="message-time">${time}</div>
  `;
  
  messagesDiv.appendChild(msgDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ===== ОТПРАВКА СООБЩЕНИЯ =====
document.getElementById('btn-send').addEventListener('click', sendMessage);
msgInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const text = msgInput.value.trim();
  if (!text || !currentChat) return;
  
  db.ref('chats/' + currentChat + '/messages').push({
    senderId: currentUser.uid,
    senderName: currentUser.username,
    text: text,
    timestamp: Date.now()
  });
  
  db.ref('chats/' + currentChat + '/lastMessage').set(
    currentUser.username + ': ' + text.substring(0, 50)
  );
  
  msgInput.value = '';
}

// ===== ПРОВЕРКА СЕССИИ =====
function checkSession() {
  const saved = localStorage.getItem('limessage_user') || 
                sessionStorage.getItem('limessage_user');
  
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      db.ref('users/' + currentUser.uid).once('value').then((snap) => {
        if (snap.exists() && snap.val().verified) {
          enterApp();
        } else {
          localStorage.removeItem('limessage_user');
          sessionStorage.removeItem('limessage_user');
        }
      });
    } catch (e) {
      localStorage.removeItem('limessage_user');
      sessionStorage.removeItem('limessage_user');
    }
  }
}

// ===== ENTER В ФОРМАХ =====
document.getElementById('login-password').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById('btn-login').click();
});
document.getElementById('login-username').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById('btn-login').click();
});
document.getElementById('reg-password-confirm').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById('btn-register').click();
});
verificationCodeInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById('btn-verify-email').click();
});

// ===== ЗАПУСК =====
checkSession();