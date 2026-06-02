document.addEventListener('DOMContentLoaded', () => {

  // Firebase Config
  const firebaseConfig = {
    apiKey: "AIzaSyCFmZpqERRNvODqh3v-H9RJvf5F1Ln29s0",
    authDomain: "limessage-666.firebaseapp.com",
    databaseURL: "https://limessage-666-default-rtdb.firebaseio.com",
    projectId: "limessage-666",
    storageBucket: "limessage-666.firebasestorage.app",
    messagingSenderId: "775134945024",
    appId: "1:775134945024:web:31d108d5c02c8749391de5"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

  // ⚠️ ВСТАВЬ СВОИ ДАННЫЕ EMAILJS СЮДА:
  const EMAILJS_PUBLIC_KEY = "EHEtdA5nbc5lb7sRm";        // ← ТВОЙ PUBLIC KEY
  const EMAILJS_SERVICE_ID = "service_j6yvvkv";     // ← ТВОЙ SERVICE ID  
  const EMAILJS_TEMPLATE_ID = "template_7bet76h";   // ← ТВОЙ TEMPLATE ID

  emailjs.init(EMAILJS_PUBLIC_KEY);

  let currentUser = null;
  let currentChat = null;
  let messagesListener = null;
  let pendingRegistration = null;
  let currentVerificationCode = null;
  let selectedAvatar = null;

  console.log('✅ Limessage запущен');
  console.log('📧 EmailJS:', EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID);

  function safeEmail(email) {
    return email.replace(/\./g, ',').replace(/#/g, '_').replace(/\$/g, '_');
  }

  function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async function sendEmail(email, username, code) {
    try {
      console.log('📤 Отправка email через EmailJS...');
      console.log('Service ID:', EMAILJS_SERVICE_ID);
      console.log('Template ID:', EMAILJS_TEMPLATE_ID);
      console.log('На email:', email);
      
      const result = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: email,
        to_name: username,
        code: code,
        from_name: 'Limessage'
      });
      
      console.log('✅ Email отправлен:', result);
      return true;
    } catch (err) {
      console.error('❌ Ошибка EmailJS:', err);
      console.error('Status:', err.status);
      console.error('Text:', err.text);
      return false;
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Аватарка
  document.getElementById('btn-change-avatar')?.addEventListener('click', () => {
    document.getElementById('avatar-input')?.click();
  });

  document.getElementById('avatar-input')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        selectedAvatar = event.target.result;
        const preview = document.getElementById('avatar-preview');
        if (preview) {
          preview.textContent = '';
          preview.style.backgroundImage = `url(${selectedAvatar})`;
          preview.style.backgroundSize = 'cover';
          preview.style.backgroundPosition = 'center';
        }
      };
      reader.readAsDataURL(file);
    }
  });

  // Переключение форм
  document.getElementById('btn-show-register')?.addEventListener('click', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
    if (loginError) loginError.textContent = '';
    if (registerError) registerError.textContent = '';
    selectedAvatar = null;
    const preview = document.getElementById('avatar-preview');
    if (preview) {
      preview.textContent = '';
      preview.style.backgroundImage = '';
    }
  });

  document.getElementById('btn-show-login')?.addEventListener('click', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    
    if (registerForm) registerForm.style.display = 'none';
    if (loginForm) loginForm.style.display = 'block';
    if (loginError) loginError.textContent = '';
    if (registerError) registerError.textContent = '';
  });

  // ВХОД
  document.getElementById('btn-login')?.addEventListener('click', async () => {
    const username = document.getElementById('login-username')?.value.trim();
    const password = document.getElementById('login-password')?.value;
    const remember = document.getElementById('remember-me')?.checked;
    const loginError = document.getElementById('login-error');

    if (!username || !password) {
      if (loginError) loginError.textContent = 'Заполните все поля';
      return;
    }

    try {
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
    } catch (error) {
      console.error('Ошибка входа:', error);
      if (loginError) loginError.textContent = 'Ошибка: ' + error.message;
    }
  });

  // РЕГИСТРАЦИЯ
  document.getElementById('btn-register')?.addEventListener('click', async () => {
    const username = document.getElementById('reg-username')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const password = document.getElementById('reg-password')?.value;
    const passwordConfirm = document.getElementById('reg-password-confirm')?.value;
    const registerError = document.getElementById('register-error');

    if (registerError) registerError.textContent = '';

    console.log('🔘 Регистрация:', { username, email });

    if (!username || !email || !password || !passwordConfirm) {
      if (registerError) registerError.textContent = 'Заполните все поля';
      return;
    }
    if (username.length < 3 || username.length > 20) {
      if (registerError) registerError.textContent = 'Имя: 3-20 символов';
      return;
    }
    if (!/^[a-zA-Z0-9_а-яА-ЯёЁ]+$/.test(username)) {
      if (registerError) registerError.textContent = 'Только буквы, цифры, _';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (registerError) registerError.textContent = 'Неверный email';
      return;
    }
    if (password.length < 8) {
      if (registerError) registerError.textContent = 'Пароль: минимум 8 символов';
      return;
    }
    if (password !== passwordConfirm) {
      if (registerError) registerError.textContent = 'Пароли не совпадают';
      return;
    }

    try {
      const snap = await db.ref('users').orderByChild('username').equalTo(username).once('value');
      if (snap.exists()) {
        if (registerError) registerError.textContent = 'Имя уже занято';
        return;
      }

      pendingRegistration = {
        username,
        email,
        password,
        avatar: selectedAvatar || null,
        createdAt: Date.now()
      };

      currentVerificationCode = generateCode();
      const sEmail = safeEmail(email);

      await db.ref('verification_codes/' + sEmail).set({
        code: currentVerificationCode,
        username: username,
        originalEmail: email,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      });

      console.log('✅ Код сохранён в базе:', sEmail);

      const sent = await sendEmail(email, username, currentVerificationCode);

      const emailDisplay = document.getElementById('email-display');
      const emailError = document.getElementById('email-error');
      const emailSuccess = document.getElementById('email-success');
      const verificationCodeInput = document.getElementById('verification-code');
      const emailModal = document.getElementById('email-modal');

      if (emailDisplay) emailDisplay.textContent = email;
      if (emailError) emailError.textContent = '';
      if (emailSuccess) emailSuccess.textContent = '';
      if (verificationCodeInput) verificationCodeInput.value = '';

      if (!sent) {
        if (emailError) emailError.textContent = '❌ Ошибка отправки. Проверьте консоль.';
        if (emailSuccess) emailSuccess.textContent = '';
      } else {
        if (emailError) emailError.textContent = '';
        if (emailSuccess) emailSuccess.textContent = '✅ Код отправлен на почту!';
      }

      if (emailModal) {
        emailModal.style.display = 'flex';
        console.log('✅ Показано окно верификации');
      }
      if (verificationCodeInput) verificationCodeInput.focus();
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      if (registerError) registerError.textContent = 'Ошибка: ' + error.message;
    }
  });

  // ПРОВЕРКА КОДА
  document.getElementById('btn-verify-email')?.addEventListener('click', async () => {
    const code = document.getElementById('verification-code')?.value.trim();
    const emailError = document.getElementById('email-error');
    const emailSuccess = document.getElementById('email-success');

    if (emailError) emailError.textContent = '';
    if (emailSuccess) emailSuccess.textContent = '';

    if (!code || code.length !== 6) {
      if (emailError) emailError.textContent = 'Введите 6 цифр';
      return;
    }

    if (!pendingRegistration) {
      if (emailError) emailError.textContent = 'Начните регистрацию заново';
      return;
    }

    try {
      const sEmail = safeEmail(pendingRegistration.email);
      const snap = await db.ref('verification_codes/' + sEmail).once('value');

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

      if (emailSuccess) emailSuccess.textContent = '✅ Подтверждено!';
      await db.ref('verification_codes/' + sEmail).remove();

      setTimeout(() => {
        const emailModal = document.getElementById('email-modal');
        if (emailModal) emailModal.style.display = 'none';
        showTermsModal();
      }, 1000);
    } catch (error) {
      console.error('Ошибка верификации:', error);
      if (emailError) emailError.textContent = 'Ошибка: ' + error.message;
    }
  });

  // ПОВТОРНЫЙ КОД
  document.getElementById('btn-resend-code')?.addEventListener('click', async () => {
    if (!pendingRegistration) return;

    try {
      currentVerificationCode = generateCode();
      const sEmail = safeEmail(pendingRegistration.email);

      await db.ref('verification_codes/' + sEmail).set({
        code: currentVerificationCode,
        username: pendingRegistration.username,
        originalEmail: pendingRegistration.email,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      });

      const sent = await sendEmail(pendingRegistration.email, pendingRegistration.username, currentVerificationCode);

      const emailSuccess = document.getElementById('email-success');
      const emailError = document.getElementById('email-error');

      if (sent) {
        if (emailSuccess) emailSuccess.textContent = '✅ Отправлен';
        if (emailError) emailError.textContent = '';
      } else {
        if (emailError) emailError.textContent = 'Ошибка отправки';
        if (emailSuccess) emailSuccess.textContent = '';
      }
    } catch (error) {
      console.error('Ошибка повторной отправки:', error);
    }
  });

  // ОТМЕНА
  document.getElementById('btn-cancel-verify')?.addEventListener('click', () => {
    const emailModal = document.getElementById('email-modal');
    const registerError = document.getElementById('register-error');
    
    if (emailModal) emailModal.style.display = 'none';
    pendingRegistration = null;
    currentVerificationCode = null;
    if (registerError) registerError.textContent = 'Отменено';
  });

  // МОДАЛКА УСЛОВИЙ
  function showTermsModal() {
    const termsModal = document.getElementById('terms-modal');
    const checkboxContainer = document.getElementById('checkbox-container');
    const termsCheckbox = document.getElementById('terms-checkbox');
    const btnAccept = document.getElementById('btn-accept');
    const termsContent = document.getElementById('terms-content');
    const scrollIndicator = document.getElementById('scroll-indicator');
    
    if (termsModal) termsModal.style.display = 'flex';
    if (checkboxContainer) checkboxContainer.classList.remove('active');
    if (termsCheckbox) termsCheckbox.checked = false;
    if (btnAccept) btnAccept.disabled = true;
    if (termsContent) termsContent.scrollTop = 0;
    if (scrollIndicator) scrollIndicator.style.display = 'block';
  }

  document.getElementById('terms-content')?.addEventListener('scroll', function() {
    const scrollTop = this.scrollTop;
    const scrollHeight = this.scrollHeight;
    const clientHeight = this.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 50) {
      const checkboxContainer = document.getElementById('checkbox-container');
      const scrollIndicator = document.getElementById('scroll-indicator');
      
      if (checkboxContainer) checkboxContainer.classList.add('active');
      if (scrollIndicator) scrollIndicator.style.display = 'none';
    }
  });

  document.getElementById('terms-checkbox')?.addEventListener('change', function() {
    const btnAccept = document.getElementById('btn-accept');
    if (btnAccept) btnAccept.disabled = !this.checked;
  });

  document.getElementById('btn-accept')?.addEventListener('click', async () => {
    if (!pendingRegistration) return;

    try {
      const userRef = db.ref('users').push();
      await userRef.set({
        username: pendingRegistration.username,
        email: pendingRegistration.email,
        password: pendingRegistration.password,
        avatar: pendingRegistration.avatar,
        verified: true,
        termsAccepted: true,
        registeredAt: Date.now()
      });

      await db.ref('chats/general/participants/' + userRef.key).set(true);

      currentUser = { uid: userRef.key, ...pendingRegistration };
      localStorage.setItem('limessage_user', JSON.stringify(currentUser));

      const termsModal = document.getElementById('terms-modal');
      if (termsModal) termsModal.style.display = 'none';
      pendingRegistration = null;
      currentVerificationCode = null;

      enterApp();
    } catch (error) {
      console.error('Ошибка принятия условий:', error);
    }
  });

  document.getElementById('btn-decline')?.addEventListener('click', () => {
    if (confirm('Отменить регистрацию?')) {
      const termsModal = document.getElementById('terms-modal');
      const registerForm = document.getElementById('register-form');
      const loginForm = document.getElementById('login-form');
      const registerError = document.getElementById('register-error');
      
      if (termsModal) termsModal.style.display = 'none';
      pendingRegistration = null;
      if (registerForm) registerForm.style.display = 'none';
      if (loginForm) loginForm.style.display = 'block';
      if (registerError) registerError.textContent = 'Отменено';
    }
  });

  // ВХОД В ПРИЛОЖЕНИЕ
  function enterApp() {
    const authScreen = document.getElementById('auth-screen');
    const mainScreen = document.getElementById('main-screen');
    const userInfoDiv = document.getElementById('user-info');
    const userAvatarSmall = document.getElementById('user-avatar-small');
    
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

  // ВЫХОД
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    if (confirm('Выйти?')) {
      localStorage.removeItem('limessage_user');
      sessionStorage.removeItem('limessage_user');
      location.reload();
    }
  });

  // ЧАТЫ
  function loadChats() {
    db.ref('chats').on('value', (snapshot) => {
      const chatList = document.getElementById('chat-list');
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
    const currentChatSpan = document.getElementById('current-chat');
    if (currentChatSpan) currentChatSpan.textContent = '◈ ' + chatName;
    
    db.ref('chats/' + chatId + '/participants/' + currentUser.uid).set(true);
    loadMessages(chatId);
  }

  function loadMessages(chatId) {
    if (messagesListener) {
      db.ref('chats/' + currentChat + '/messages').off('child_added', messagesListener);
    }

    const messagesDiv = document.getElementById('messages');
    if (messagesDiv) messagesDiv.innerHTML = '';

    messagesListener = db.ref('chats/' + chatId + '/messages')
      .orderByChild('timestamp')
      .limitToLast(100)
      .on('child_added', (snapshot) => {
        renderMessage(snapshot.val(), snapshot.key);
      });
  }

  function renderMessage(msg, key) {
    const messagesDiv = document.getElementById('messages');
    if (!messagesDiv) return;
    
    const isOwn = msg.senderId === currentUser.uid;
    const time = new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const msgDiv = document.createElement('div');
    msgDiv.className = 'message' + (isOwn ? ' own' : '');

    msgDiv.innerHTML = `
      <div class="message-author">${escapeHtml(msg.senderName)}</div>
      <div class="message-text">${escapeHtml(msg.text)}</div>
      <div class="message-time">${time}</div>
    `;

    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // ОТПРАВКА
  const btnSend = document.getElementById('btn-send');
  if (btnSend) {
    btnSend.addEventListener('click', sendMessage);
  }

  const msgInput = document.getElementById('msg-input');
  if (msgInput) {
    msgInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  function sendMessage() {
    const text = msgInput?.value.trim();
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

    if (msgInput) msgInput.value = '';
  }

  // СЕССИЯ
  function checkSession() {
    const saved = localStorage.getItem('limessage_user') || sessionStorage.getItem('limessage_user');

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

  // ENTER В ФОРМАХ
  document.getElementById('login-password')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-login')?.click();
  });
  document.getElementById('login-username')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-login')?.click();
  });
  document.getElementById('reg-password-confirm')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-register')?.click();
  });
  document.getElementById('verification-code')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-verify-email')?.click();
  });

  // ЗАПУСК
  checkSession();
});
