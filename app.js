// ==========================================
// 🔥 LIMESSAGE v1.0 - ИСПРАВЛЕНИЕ КНОПОК
// ==========================================

// Ждём полной загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
  
  // Firebase Config
  const firebaseConfig = {
    apiKey: "AIzaSyCFmZpqERRNvODqh3v-H9RJvf5F1Ln29s0",
    authDomain: "limessage-666.firebaseapp.com",
    databaseURL: "https://limessage-666-default-rtdb.firebaseio.com",
    projectId: "limessage-666",
    storageBucket: "limessage-666.firebasestorage.app",
    messagingSenderId: "775134945024",
    appId: "1:775134945024:web:31d108d5c02c8749391de5",
    measurementId: "G-VYFVMFYPKK"
  };

  // Инициализация Firebase
  if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.database();

  // EmailJS
  const EMAILJS_PUBLIC_KEY = "EHEtdA5nbc5lb7sRm";
  const EMAILJS_SERVICE_ID = "service_92ebgfx";
  const EMAILJS_TEMPLATE_ID = "template_7bet76h";

  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  // Глобальные переменные
  let currentUser = null;
  let currentChat = null;
  let messagesListener = null;
  let pendingRegistration = null;
  let currentVerificationCode = null;
  let selectedAvatar = null;

  // DOM элементы
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
  const userAvatarSmall = document.getElementById('user-avatar-small');

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

  // Аватарка
  const avatarPreview = document.getElementById('avatar-preview');
  const avatarInput = document.getElementById('avatar-input');
  const btnChangeAvatar = document.getElementById('btn-change-avatar');

  // Проверка что элементы существуют
  if (!loginForm || !registerForm) {
    console.error('❌ Не найдены формы входа/регистрации!');
    return;
  }

  console.log('✅ Все элементы найдены, инициализация...');

  // Обработчик аватарки
  if (btnChangeAvatar && avatarInput) {
    btnChangeAvatar.addEventListener('click', () => {
      avatarInput.click();
    });

    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          selectedAvatar = event.target.result;
          if (avatarPreview) {
            avatarPreview.textContent = '';
            avatarPreview.style.backgroundImage = `url(${selectedAvatar})`;
            avatarPreview.style.backgroundSize = 'cover';
            avatarPreview.style.backgroundPosition = 'center';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ===== ПЕРЕКЛЮЧЕНИЕ ФОРМ =====
  const btnShowRegister = document.getElementById('btn-show-register');
  const btnShowLogin = document.getElementById('btn-show-login');

  if (btnShowRegister) {
    btnShowRegister.addEventListener('click', () => {
      console.log('🔘 Нажата кнопка "Создать аккаунт"');
      if (loginForm) loginForm.style.display = 'none';
      if (registerForm) registerForm.style.display = 'block';
      if (loginError) loginError.textContent = '';
      if (registerError) registerError.textContent = '';
      selectedAvatar = null;
      if (avatarPreview) {
        avatarPreview.textContent = '👤';
        avatarPreview.style.backgroundImage = '';
      }
    });
  } else {
    console.error('❌ Не найдена кнопка btn-show-register!');
  }

  if (btnShowLogin) {
    btnShowLogin.addEventListener('click', () => {
      console.log('🔘 Нажата кнопка "Уже есть аккаунт"');
      if (registerForm) registerForm.style.display = 'none';
      if (loginForm) loginForm.style.display = 'block';
      if (loginError) loginError.textContent = '';
      if (registerError) registerError.textContent = '';
    });
  }

  // ===== ВХОД =====
  const btnLogin = document.getElementById('btn-login');
  if (btnLogin) {
    btnLogin.addEventListener('click', async () => {
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      const remember = document.getElementById('remember-me').checked;
      
      if (!username || !password) {
        if (loginError) loginError.textContent = 'Заполните все поля';
        return;
      }
      
      const snapshot = await db.ref('users').orderByChild('username').equalTo(username).once('value');
      
      if (!snapshot.exists()) {
        if (loginError) loginError.textContent = 'Пользователь не найден';
        return;
      }
      
      let userData = null;
      let userUid = null;
      snapshot.forEach((child) => {
        userData = child.val();
        userUid = child.key;
      });
      
      if (userData.password !== password) {
        if (loginError) loginError.textContent = 'Неверный пароль';
        return;
      }
      
      if (!userData.verified) {
        if (loginError) loginError.textContent = 'Email не подтверждён';
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
  }

  // ===== РЕГИСТРАЦИЯ =====
// ===== РЕГИСТРАЦИЯ =====
const btnRegister = document.getElementById('btn-register');
if (btnRegister) {
  btnRegister.addEventListener('click', async () => {
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const passwordConfirm = document.getElementById('reg-password-confirm').value;
    
    if (registerError) registerError.textContent = '';
    
    console.log('🔘 Нажата кнопка "Зарегистрироваться"');
    
    // ... вся валидация ...
    
    // 🔥 ИСПРАВЛЕНИЕ: заменяем точки в email
    const safeEmail = email.replace(/\./g, ',');
    
    pendingRegistration = { 
      username, 
      email, 
      password, 
      avatar: selectedAvatar || null,
      createdAt: Date.now() 
    };
    
    currentVerificationCode = generateCode();
    
    await db.ref('verification_codes/' + safeEmail).set({
      code: currentVerificationCode,
      username: username,
      email: email, // сохраняем оригинальный email
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });
    
    const sent = await sendEmail(email, username, currentVerificationCode);
    
    if (emailDisplay) emailDisplay.textContent = email;
    if (emailError) emailError.textContent = '';
    if (emailSuccess) emailSuccess.textContent = '';
    if (verificationCodeInput) verificationCodeInput.value = '';
    
    if (!sent) {
      if (emailSuccess) emailSuccess.textContent = '⚠️ Email не отправлен. Код: ' + currentVerificationCode;
    } else {
      if (emailSuccess) emailSuccess.textContent = '✅ Код отправлен на ' + email;
    }
    
    if (emailModal) {
      emailModal.style.display = 'flex';
      console.log('✅ Показано окно верификации');
    }
    if (verificationCodeInput) verificationCodeInput.focus();
  });
}

  // ===== ПРОВЕРКА КОДА =====
  const btnVerifyEmail = document.getElementById('btn-verify-email');
  if (btnVerifyEmail) {
    btnVerifyEmail.addEventListener('click', async () => {
      const code = verificationCodeInput.value.trim();
      if (emailError) emailError.textContent = '';
      if (emailSuccess) emailSuccess.textContent = '';
      
      if (!code || code.length !== 6) {
        if (emailError) emailError.textContent = 'Введите 6-значный код';
        return;
      }
      
      const snap = await db.ref('verification_codes/' + pendingRegistration.email).once('value');
      
      if (!snap.exists()) {
        if (emailError) emailError.textContent = 'Код не найден';
        return;
      }
      
      const data = snap.val();
      
      if (Date.now() > data.expiresAt) {
        if (emailError) emailError.textContent = 'Код истёк';
        return;
      }
      
      if (data.code !== code) {
        if (emailError) emailError.textContent = 'Неверный код';
        return;
      }
      
      if (emailSuccess) emailSuccess.textContent = '✅ Код подтверждён!';
      
      await db.ref('verification_codes/' + pendingRegistration.email).remove();
      
      setTimeout(() => {
        if (emailModal) emailModal.style.display = 'none';
        showTermsModal();
      }, 1000);
    });
  }

  // ===== ОСТАЛЬНЫЕ ФУНКЦИИ =====
  
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
      console.error('❌ Ошибка email:', err);
      return false;
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showTermsModal() {
    if (termsModal) {
      termsModal.style.display = 'flex';
      if (checkboxContainer) checkboxContainer.classList.remove('active');
      if (termsCheckbox) termsCheckbox.checked = false;
      if (btnAccept) btnAccept.disabled = true;
      if (termsContent) termsContent.scrollTop = 0;
      if (scrollIndicator) scrollIndicator.style.display = 'block';
    }
  }

  if (termsContent) {
    termsContent.addEventListener('scroll', () => {
      const scrollTop = termsContent.scrollTop;
      const scrollHeight = termsContent.scrollHeight;
      const clientHeight = termsContent.clientHeight;
      
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        if (checkboxContainer) checkboxContainer.classList.add('active');
        if (scrollIndicator) scrollIndicator.style.display = 'none';
      }
    });
  }

  if (termsCheckbox) {
    termsCheckbox.addEventListener('change', () => {
      if (btnAccept) btnAccept.disabled = !termsCheckbox.checked;
    });
  }

  if (btnAccept) {
    btnAccept.addEventListener('click', async () => {
      if (!pendingRegistration) return;
      
      const userRef = db.ref('users').push();
      await userRef.set({
        username: pendingRegistration.username,
        email: pendingRegistration.email,
        password: pendingRegistration.password,
        avatar: pendingRegistration.avatar,
        verified: true,
        termsAccepted: true,
        registeredAt: Date.now(),
        lastSeen: Date.now()
      });
      
      await db.ref('chats/general/participants/' + userRef.key).set(true);
      
      currentUser = { uid: userRef.key, ...pendingRegistration };
      localStorage.setItem('limessage_user', JSON.stringify(currentUser));
      
      if (termsModal) termsModal.style.display = 'none';
      pendingRegistration = null;
      currentVerificationCode = null;
      
      enterApp();
    });
  }

  if (btnDecline) {
    btnDecline.addEventListener('click', () => {
      if (confirm('Вы уверены?')) {
        if (termsModal) termsModal.style.display = 'none';
        pendingRegistration = null;
        if (registerForm) registerForm.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
        if (registerError) registerError.textContent = 'Регистрация отменена';
      }
    });
  }

  function enterApp() {
    if (authScreen) authScreen.style.display = 'none';
    if (mainScreen) mainScreen.style.display = 'flex';
    if (userInfoDiv) userInfoDiv.textContent = currentUser.username;
    
    if (currentUser.avatar && userAvatarSmall) {
      userAvatarSmall.textContent = '';
      userAvatarSmall.style.backgroundImage = `url(${currentUser.avatar})`;
      userAvatarSmall.style.backgroundSize = 'cover';
    }
    
    loadChats();
  }

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (confirm('Выйти?')) {
        localStorage.removeItem('limessage_user');
        sessionStorage.removeItem('limessage_user');
        location.reload();
      }
    });
  }

  function loadChats() {
    db.ref('chats').on('value', (snapshot) => {
      if (!chatList) return;
      chatList.innerHTML = '';
      
      if (!snapshot.exists()) {
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

  function openChat(chatId, chatName) {
    currentChat = chatId;
    if (currentChatSpan) currentChatSpan.textContent = '◈ ' + chatName;
    
    db.ref('chats/' + chatId + '/participants/' + currentUser.uid).set(true);
    
    loadMessages(chatId);
    
    if (window.innerWidth <= 768) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.add('hidden');
    }
  }

  function loadMessages(chatId) {
    if (messagesListener) {
      db.ref('chats/' + currentChat + '/messages').off('child_added', messagesListener);
    }
    
    if (messagesDiv) messagesDiv.innerHTML = '';
    
    messagesListener = db.ref('chats/' + chatId + '/messages')
      .orderByChild('timestamp')
      .limitToLast(100)
      .on('child_added', (snapshot) => {
        const msg = snapshot.val();
        renderMessage(msg, snapshot.key);
      });
  }

  function renderMessage(msg, key) {
    if (!messagesDiv) return;
    
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

  const btnSend = document.getElementById('btn-send');
  if (btnSend) {
    btnSend.addEventListener('click', sendMessage);
  }
  
  if (msgInput) {
    msgInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

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

  // Enter в формах
  const loginPassword = document.getElementById('login-password');
  const loginUsername = document.getElementById('login-username');
  const regPasswordConfirm = document.getElementById('reg-password-confirm');
  
  if (loginPassword) {
    loginPassword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && btnLogin) btnLogin.click();
    });
  }
  if (loginUsername) {
    loginUsername.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && btnLogin) btnLogin.click();
    });
  }
  if (regPasswordConfirm) {
    regPasswordConfirm.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && btnRegister) btnRegister.click();
    });
  }
  if (verificationCodeInput) {
    verificationCodeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && btnVerifyEmail) btnVerifyEmail.click();
    });
  }

  // Запуск
  checkSession();
  
  console.log('✅ Limessage инициализирован!');
  
}); // конец DOMContentLoaded
