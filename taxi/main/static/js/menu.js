function checkMenuOpem() {
    if (document.getElementById('menu-favorite')) {
        document.getElementById('menu-favorite').remove()
    }
    if (document.getElementById('menu-coin')) {
        document.getElementById('menu-coin').remove()
    }
    if (document.getElementById('menu-discont')) {
        document.getElementById('menu-discont').remove()
    }
    if (document.getElementById('menu-profil')) {
        document.getElementById('menu-profil').remove()
    }
}

function profil() {
    checkMenuOpem()
    $.ajax({
        type: "GET",
        url: "/get_user_all_information/",
        success: function (response) {
            if (document.getElementById('menu-profil')) {
                document.getElementById('menu-profil').remove()
            }

            const emailValue = response.user_data.email ? response.user_data.email : "example.@gmail.com";

            const menuProfil = document.createElement("div");
            menuProfil.className = "menu-profil";
            menuProfil.id = "menu-profil";
            menuProfil.innerHTML = `
                <div class="menu-profil">
                    <div class="menu-profil-form">
                        <span class="menu-profil-form-span-r">Редактировать профиль</span>
                        <div class="file-input-container">
                            <img src="${response.user_data.avatar}" alt="Profile Picture" id="profile-pic">
                            <input type="file" id="file-input" accept="image/png, image/jpeg, image/jpg, image/gif, image/bmp, image/tiff, image/webp">
                        </div>
                        <span class="menu-profil-form-span-n">${response.user_data.username}</span>
                        <div class="menu-profil-form-input">
                            <input type="phone" name="phone" value="${response.user_data.phone}">
                            <input type="email" name="email" value="${emailValue}" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="Введите корректный адрес электронной почты">
                            <select id="sound-select">
                                <option value="" disabled selected>Звук таксисту</option>
                                <option value="media/taxi/order.mp3">Стандартный</option>
                                <option value="media/taxi/sound 2.mp3">Звук 2</option>
                                <option value="media/taxi/sound 3.mp3">Звук 3</option>
                                <option value="media/taxi/sound 4.mp3">Звук 4</option>
                                <option value="media/taxi/sound 5.mp3">Звук 5</option>
                                <option value="media/taxi/sound 6.mp3">Звук 6</option>
                                <option value="media/taxi/sound 7.mp3">Звук 7</option>
                            </select>
                            <select id="sound-select-user">
                                <option value="" disabled selected>Звук клиенту</option>
                                <option value="media/user_sound/sound 1.mp3">Звук 1</option>
                                <option value="media/user_sound/sound 2.mp3">Звук 2</option>
                                <option value="media/user_sound/sound 3.mp3">Звук 3</option>
                                <option value="media/user_sound/sound 4.mp3">Звук 4</option>
                                <option value="media/user_sound/sound 5.mp3">Звук 5</option>
                            </select>
                            <button id="menu-profil-form-input-button">Обновить</button>
                        </div>
                    </div>
                </div>
            `;
            
            
            document.body.appendChild(menuProfil);
            
            $('#sound-select').change(function() {
                const selectedSound = $(this).val();
                const audio = new Audio(selectedSound);
                audio.play();
            });

            $('#sound-select-user').change(function() {
                const selectedSound = $(this).val();
                const audio = new Audio(selectedSound);
                audio.play();
            });
            
            const fileInput = document.getElementById('file-input');
            const profilePic = document.getElementById('profile-pic');
            const container = document.querySelector('.file-input-container');
    
            container.addEventListener('click', function() {
                fileInput.click();
            });
    
            fileInput.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        profilePic.src = e.target.result;
                    }
                    reader.readAsDataURL(file);
                }
            });
            $('#menu-profil-form-input-button').click(function() {
                event.preventDefault(); // Отменяем стандартное действие кнопки

                const emailValue = $('input[type="email"]').val();
                const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            
                if (!emailPattern.test(emailValue)) {
                    alert("Введите правильно адрес электронной почты (example@gmail.com)");
                    return;
                }
            
                const phoneValue = $('input[name="phone"]').val();
                const phonePattern = /^\+\d{1,3}\d{9}$/; // Проверка на "+", код страны и номер
            
                if (!phonePattern.test(phoneValue)) {
                    alert("Введите правильно телефон (+79591234567)");
                    return;
                }
            
                const phone = $('input[name="phone"]').val();
                const email = $('input[type="email"]').val();
                const soundTaxi = $('#sound-select').val();
                const soundOrder = $('#sound-select-user').val();
                const avatarFile = document.getElementById('file-input').files[0];  // Получение файла
            
                const formData = new FormData();
                formData.append('phone', phone);
                formData.append('email', email);
                formData.append('soundTaxi', soundTaxi);
                formData.append('soundOrder', soundOrder);
                formData.append('avatar', avatarFile);  // Добавление файла в FormData
            
                // Получение CSRF токена
                const csrftoken = getCookie('csrftoken');
            
                $.ajax({
                    type: "POST",
                    url: "/updateInformationUser/",
                    headers: {
                        'X-CSRFToken': csrftoken
                    },
                    data: formData,
                    processData: false,  // Не обрабатывать данные FormData
                    contentType: false,  // Не устанавливать заголовок Content-Type
                    success: function(response) {
                        // Handle success response if needed
                        console.log("User information updated successfully!");
                    },
                    error: function(xhr, status, error) {
                        // Handle error response if needed
                        console.error("Error updating user information:", error);
                    }
                });
            });
            
            // Функция для получения CSRF токена из куки
            function getCookie(name) {
                let cookieValue = null;
                if (document.cookie && document.cookie !== '') {
                    const cookies = document.cookie.split(';');
                    for (let i = 0; i < cookies.length; i++) {
                        const cookie = cookies[i].trim();
                        // Ищем куки с указанным именем
                        if (cookie.substring(0, name.length + 1) === (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            }
            
            
            
        }
    });
}

function home() {
    checkMenuOpem()
}

function discont() {
    checkMenuOpem()
    $.ajax({
        type: "GET",
        url: "/get_discont/",
        success: function (response) {
            const menuProfil = document.createElement("div");
            menuProfil.className = "menu-discont";
            menuProfil.id = "menu-discont";
            menuProfil.innerHTML = `
                <span class="menu-discont-span">Спецальные предложения</span>
                <div class="menu-discont-banner"></div>
            `;
    
            const bannerContainer = menuProfil.querySelector(".menu-discont-banner");
    
            response.discont.forEach(item => {
                const bannerItem = document.createElement("div");
                bannerItem.className = "menu-discont-banner-s";
                bannerItem.innerHTML = `
                    <img src="static/img/discont.png" alt="">
                    <h4>${item.name}</h4>
                    <span>${item.about}</span>
                `;
                bannerContainer.appendChild(bannerItem);
            });
    
            document.body.appendChild(menuProfil);
        }
    });
    
}

function coin() {
    checkMenuOpem()
    $.ajax({
        type: "GET",
        url: "/get_transactions/",
        success: function (response) {
            const menuCoin = document.createElement("div");
            menuCoin.className = "menu-coin-banner";
            menuCoin.id = "menu-coin";
            
            // Create the initial structure
            menuCoin.innerHTML = `
                <div class="menu-coin-banner">
                    <div class="menu-coin-banner-balance">
                        <div class="menu-coin-banner-balance-s">
                            <h4>500₽</h4>
                            <span>Баланс</span>
                            <button>Пополнить</button>
                        </div>
                        <div class="menu-coin-banner-balance-s">
                            <h4>200₽</h4>
                            <span>Заработано</span>
                            <button>Снять</button>
                        </div>
                    </div>
                    <h5>Транзакции</h5>
                    <div class="menu-coin-banner-transactions"></div>
                </div>
            `;
    
            // Append transactions
            const transactionsContainer = menuCoin.querySelector(".menu-coin-banner-transactions");
            response.transactions.forEach(transaction => {
                const transactionDiv = document.createElement("div");
                transactionDiv.className = "menu-coin-banner-transactions-s";
    
                const imgSrc = transaction.types ? "static/img/Up.png" : "static/img/Down.png";
                const moneyValue = transaction.types ? `-${transaction.money}₽` : `${transaction.money}₽`;
    
                transactionDiv.innerHTML = `
                    <img src="${imgSrc}">
                    <div>
                        <h4>${transaction.name}</h4>
                        <h4>${transaction.date}</h4>
                    </div>
                    <span>${moneyValue}</span>
                `;
    
                transactionsContainer.appendChild(transactionDiv);
            });
    
            document.body.appendChild(menuCoin);
        }
    });
    
    
}