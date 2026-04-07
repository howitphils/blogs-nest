export const emailTemplates = {
  getRegistrationTemplate(code: string) {
    return `<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f2f5; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Основная карточка -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Шапка с градиентом -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #6e8efb, #a777e3); padding: 50px 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Добро пожаловать!</h1>
            </td>
          </tr>

          <!-- Контент -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <p style="font-size: 18px; color: #1a1a1a; margin-bottom: 24px;">Рады видеть вас в <strong>Blogger Platform</strong>.</p>
              <p style="font-size: 15px; color: #666666; line-height: 1.6; margin-bottom: 32px;">
                Ваш аккаунт почти готов. Остался всего один шаг — подтвердите ваш адрес электронной почты, нажав на кнопку ниже.
              </p>
              
              <!-- Кнопка -->
              <a href="https://somesite.com/confirm-email?code=${code}" style="display: inline-block; background-color: #6e8efb; color: #ffffff; padding: 16px 40px; border-radius: 30px; font-size: 16px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 15px rgba(110, 142, 251, 0.4);">
                Подтвердить Email
              </a>
            </td>
          </tr>

          <!-- Подвал -->
          <tr>
            <td style="padding: 30px; background-color: #fafafa; border-top: 1px solid #eeeeee; text-align: center;">
              <p style="font-size: 12px; color: #999999; margin: 0;">
                Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.
              </p>
              <div style="margin-top: 15px;">
                <a href="#" style="color: #6e8efb; text-decoration: none; font-size: 12px; margin: 0 10px;">Поддержка</a>
                <a href="#" style="color: #6e8efb; text-decoration: none; font-size: 12px; margin: 0 10px;">Политика конфиденциальности</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
  },

  getPasswordRecoveryTemplate(code: string) {
    return `<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f2f5; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Основная карточка -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Шапка с акцентным градиентом (чуть более строгий тон) -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); padding: 50px 20px;">
              <div style="background-color: rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 50%; display: inline-block; line-height: 60px; margin-bottom: 15px;">
                <span style="font-size: 30px; color: #ffffff;">🔑</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">Сброс пароля</h1>
            </td>
          </tr>

          <!-- Контент -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <p style="font-size: 18px; color: #1a1a1a; margin-bottom: 20px;">Забыли пароль? Ничего страшного!</p>
              <p style="font-size: 15px; color: #666666; line-height: 1.6; margin-bottom: 32px;">
                Мы получили запрос на изменение пароля для вашего аккаунта. Нажмите на кнопку ниже, чтобы установить новый пароль. 
                <br><br>
                <strong style="color: #ff7675;">Ссылка активна в течение 2 часов.</strong>
              </p>
              
              <!-- Кнопка -->
              <a href="https://somesite.com/password-recovery?recoveryCode=${code}" style="display: inline-block; background-color: #ff7675; color: #ffffff; padding: 16px 40px; border-radius: 30px; font-size: 16px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 15px rgba(255, 118, 117, 0.4);">
                Обновить пароль
              </a>

              <p style="margin-top: 40px; font-size: 13px; color: #999999;">
                Если вы не запрашивали сброс пароля, просто удалите это письмо. Ваш пароль останется прежним.
              </p>
            </td>
          </tr>

          <!-- Подвал -->
          <tr>
            <td style="padding: 30px; background-color: #fafafa; border-top: 1px solid #eeeeee; text-align: center;">
              <p style="font-size: 12px; color: #999999; margin: 0;">
                Безопасность вашего аккаунта — наш приоритет.
              </p>
              <div style="margin-top: 15px;">
                <a href="#" style="color: #ff7675; text-decoration: none; font-size: 12px; margin: 0 10px;">Центр помощи</a>
                <a href="#" style="color: #ff7675; text-decoration: none; font-size: 12px; margin: 0 10px;">Настройки защиты</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
  },
};
