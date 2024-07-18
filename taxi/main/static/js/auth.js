function bannerAuthCreate() {
  if (document.getElementById("banner-auth")) {
    document.getElementById("banner-auth").remove();
  }

  // Получение CSRF-токена из мета-тега
  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  const bannerAuthCreate = document.createElement("div");
  bannerAuthCreate.className = "banner-auth-button-create";
  bannerAuthCreate.id = "banner-auth-button-create";
  bannerAuthCreate.innerHTML = `
        <div class="banner-auth-button-create">
            <h4>Регистрация</h4>
            <div class="banner-auth-button-create-form">
                <form method="post" action="register/">
                    <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
                    <input
                      type="text"
                      id="username"
                      placeholder="Введите имя"
                      name="username"
                    />
                    <input
                      type="text"
                      id="phone"
                      placeholder="Введите телефон"
                      name="phone"
                    />
                    <input
                      type="password"
                      id="password"
                      placeholder="Введите пароль"
                      name="password"
                    />
                    <input
                      type="password"
                      id="confirm-password"
                      placeholder="Повторно пароль"
                      name="confirm-password"
                    />
                  <button type="submit">
                    Зарегистрироваться
                  </button>
                </form>
            </div>
            <div class="banner-auth-button-create-social-media">
              <div class="banner-auth-button-create-social-media-or">
                <div class="line"></div>
                <span>или</span>
                <div class="line"></div>
              </div>
              <div class="banner-auth-button-create-social-media-icon">
                  <button><img src="static/img/google.svg" alt="" width="24" height="24"></button>
                  <button><img src="static/img/vk.svg" alt="" width="24" height="24"></button>
              </div>
            </div>
            <div class="banner-auth-button-create-text">
                <span>Уже есть аккаунт? <a href="/">Войти</a></span>
            </div>
        </div>
    `;

  document.body.appendChild(bannerAuthCreate);
}

function bannerAuthLogin() {
  if (document.getElementById("banner-auth")) {
    document.getElementById("banner-auth").remove();
  }

  // Получение CSRF-токена из мета-тега
  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  const bannerAuthCreate = document.createElement("div");
  bannerAuthCreate.className = "banner-auth-button-create";
  bannerAuthCreate.id = "banner-auth-button-create";
  bannerAuthCreate.innerHTML = `
      <div class="banner-auth-button-create">
          <h4>Войти</h4>
          <div class="banner-auth-button-create-form">
              <form method="post" action="login/">
                  <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
                  <input
                    type="text"
                    id="phone"
                    placeholder="Введите телефон"
                    name="login-phone"
                  />
                  <input
                    type="password"
                    id="confirm-password"
                    placeholder="Введите пароль"
                    name="login-password"
                  />
                <button type="submit">
                  Войти
                </button>
              </form>
              <div id="login-error-message" style="color: red;"></div>
          </div>
          <div class="banner-auth-button-create-social-media">
              <div class="banner-auth-button-create-social-media-or">
                <div class="line"></div>
                <span>или</span>
                <div class="line"></div>
              </div>
              <div class="banner-auth-button-create-social-media-icon">
                  <button><img src="static/img/google.svg" alt="" width="24" height="24"></button>
                  <button><img src="static/img/vk.svg" alt="" width="24" height="24"></button>
              </div>
          </div>
          <div class="banner-auth-button-create-text">
            <span>Уже есть аккаунт? <a href="/">Зарегистрироваться</a></span>
          </div>
      </div>
  `;

  document.body.appendChild(bannerAuthCreate);

  const form = bannerAuthCreate.querySelector("form");
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(form);
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        if (response.status === 200) {
          // Redirect to homepage or another page on successful login
          window.location.href = "/";
        } else {
          // Display error message
          const errorMessageElement = bannerAuthCreate.querySelector(
            "#login-error-message"
          );
          errorMessageElement.textContent = result.error;
        }
      } else {
        console.error("Response is not JSON");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
}
