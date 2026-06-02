* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Courier New', Courier, monospace;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: #e0e0e0;
  height: 100vh;
  overflow: hidden;
}

/* AUTH SCREEN */
#auth-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.auth-box {
  background: rgba(22, 33, 62, 0.95);
  border: 2px solid #e94560;
  border-radius: 16px;
  padding: 40px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 0 40px rgba(233, 69, 96, 0.3);
  animation: slideIn 0.5s ease;
}

@keyframes slideIn {
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  font-size: 32px;
  font-weight: bold;
  color: #e94560;
  letter-spacing: 3px;
  margin-bottom: 10px;
}

.subtitle {
  color: #888;
  font-size: 12px;
}

.auth-box input[type="text"],
.auth-box input[type="password"],
.auth-box input[type="email"] {
  width: 100%;
  padding: 14px;
  margin: 10px 0;
  background: rgba(15, 52, 96, 0.6);
  border: 1px solid #0f3460;
  border-radius: 8px;
  color: #e0e0e0;
  font-family: inherit;
  font-size: 14px;
}

.auth-box input:focus {
  outline: none;
  border-color: #e94560;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 15px 0;
  color: #888;
  font-size: 12px;
}

.btn-primary, .btn-secondary {
  width: 100%;
  padding: 14px;
  margin: 8px 0;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
}

.btn-primary {
  background: linear-gradient(135deg, #e94560 0%, #c13651 100%);
  color: #fff;
}

.btn-secondary {
  background: rgba(15, 52, 96, 0.8);
  color: #e0e0e0;
  border: 1px solid #0f3460;
}

.error-msg, .success-msg {
  font-size: 12px;
  margin-top: 10px;
  text-align: center;
  min-height: 20px;
}

.error-msg { color: #ff6b6b; }
.success-msg { color: #28a745; }

/* AVATAR */
.avatar-section {
  text-align: center;
  margin-bottom: 20px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(15, 52, 96, 0.6);
  border: 3px solid #e94560;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  overflow: hidden;
}

.btn-avatar {
  background: rgba(15, 52, 96, 0.8);
  border: 1px solid #0f3460;
  color: #e0e0e0;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

/* EMAIL MODAL */
.email-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10001;
}

.email-container {
  background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
  border: 3px solid #007bff;
  border-radius: 16px;
  width: 90%;
  max-width: 450px;
  padding: 40px;
  box-shadow: 0 0 60px rgba(0, 123, 255, 0.5);
}

.email-header {
  text-align: center;
  margin-bottom: 30px;
}

.email-header h2 {
  color: #007bff;
  font-size: 24px;
  margin-bottom: 10px;
}

.code-input {
  width: 100%;
  padding: 18px;
  background: rgba(15, 52, 96, 0.8);
  border: 2px solid #0f3460;
  border-radius: 8px;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
  font-size: 28px;
  text-align: center;
  letter-spacing: 10px;
  margin-bottom: 15px;
}

.code-input:focus {
  outline: none;
  border-color: #007bff;
}

.email-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-link {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 12px;
  text-decoration: underline;
}

/* TERMS MODAL */
.terms-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.terms-container {
  background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
  border: 3px solid #e94560;
  border-radius: 16px;
  width: 90%;
  max-width: 750px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.terms-header {
  padding: 25px;
  background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
  border-bottom: 3px solid #e94560;
  text-align: center;
}

.terms-header h2 {
  color: #e94560;
  font-size: 26px;
  margin-bottom: 10px;
}

.terms-content {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  background: rgba(26, 26, 46, 0.8);
  font-size: 13px;
  line-height: 1.7;
}

.terms-content h3 {
  color: #e94560;
  font-size: 16px;
  margin: 20px 0 10px 0;
  border-bottom: 2px solid #0f3460;
  padding-bottom: 5px;
}

.terms-end-marker {
  text-align: center;
  color: #e94560;
  font-weight: bold;
  margin-top: 30px;
  padding: 15px;
}

.terms-footer {
  padding: 25px;
  background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
  border-top: 3px solid #e94560;
}

.scroll-indicator {
  text-align: center;
  color: #e94560;
  font-size: 12px;
  margin-bottom: 15px;
  animation: bounce 1.5s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.checkbox-container {
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(26, 26, 46, 0.8);
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0.4;
  pointer-events: none;
}

.checkbox-container.active {
  opacity: 1;
  pointer-events: all;
  border: 1px solid #e94560;
}

.checkbox-container input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-container label {
  cursor: pointer;
  font-size: 13px;
}

.terms-buttons {
  display: flex;
  gap: 15px;
}

.btn-accept, .btn-decline {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 6px;
  font-family: inherit;
  font-weight: bold;
  cursor: pointer;
}

.btn-accept {
  background: #28a745;
  color: white;
}

.btn-accept:disabled {
  background: #555;
  cursor: not-allowed;
}

.btn-decline {
  background: #dc3545;
  color: white;
}

/* MAIN INTERFACE */
#main-screen {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 320px;
  background: linear-gradient(180deg, #16213e 0%, #1a1a2e 100%);
  border-right: 2px solid #e94560;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
  border-bottom: 2px solid #e94560;
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-avatar-small {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(15, 52, 96, 0.6);
  border: 2px solid #e94560;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  overflow: hidden;
}

.user-info {
  flex: 1;
}

.username {
  font-weight: bold;
  color: #e94560;
  font-size: 14px;
}

.status {
  color: #28a745;
  font-size: 11px;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  background: rgba(26, 26, 46, 0.5);
}

.chat-item {
  padding: 18px 25px;
  border-bottom: 1px solid rgba(15, 52, 96, 0.5);
  cursor: pointer;
  transition: all 0.3s;
}

.chat-item:hover {
  background: rgba(233, 69, 96, 0.1);
}

.chat-item.active {
  background: linear-gradient(90deg, rgba(233, 69, 96, 0.3) 0%, transparent 100%);
}

.chat-item-name {
  font-weight: bold;
  margin-bottom: 5px;
  color: #e0e0e0;
}

.chat-item.active .chat-item-name {
  color: #e94560;
}

.chat-item-last {
  font-size: 11px;
  color: #666;
}

.btn-logout {
  padding: 18px;
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  border: none;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  font-weight: bold;
}

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 25px;
  background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
  border-bottom: 2px solid #e94560;
  font-size: 18px;
  font-weight: bold;
  color: #e94560;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 25px;
  background: rgba(10, 10, 10, 0.5);
}

.message {
  margin-bottom: 18px;
  padding: 14px 18px;
  background: rgba(22, 33, 62, 0.8);
  border-left: 4px solid #e94560;
  max-width: 75%;
  border-radius: 8px;
  animation: messageSlide 0.3s ease;
}

@keyframes messageSlide {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.message.own {
  margin-left: auto;
  border-left: none;
  border-right: 4px solid #007bff;
  background: rgba(15, 52, 96, 0.8);
}

.message-author {
  font-size: 11px;
  color: #e94560;
  margin-bottom: 6px;
  font-weight: bold;
}

.message.own .message-author {
  color: #007bff;
  text-align: right;
}

.message-text {
  font-size: 13px;
  line-height: 1.5;
}

.message-time {
  font-size: 10px;
  color: #555;
  margin-top: 6px;
  text-align: right;
}

.input-area {
  padding: 25px;
  background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
  border-top: 2px solid #e94560;
  display: flex;
  gap: 12px;
}

.input-area input {
  flex: 1;
  padding: 14px 18px;
  background: rgba(10, 10, 10, 0.8);
  border: 2px solid #0f3460;
  border-radius: 8px;
  color: #e0e0e0;
  font-family: inherit;
  font-size: 14px;
}

.input-area input:focus {
  outline: none;
  border-color: #e94560;
}

.input-area button {
  padding: 14px 30px;
  background: linear-gradient(135deg, #e94560 0%, #c13651 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  font-weight: bold;
}

@media (max-width: 768px) {
  .sidebar { width: 100%; position: absolute; z-index: 10; }
  .sidebar.hidden { display: none; }
  .chat-window { width: 100%; }
}
