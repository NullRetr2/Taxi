import { showTaxiAlert, showTaxiAlertError } from "./alert.js";
import { bannerStarClient } from "./banner.js";

function init() {
  navigator.geolocation.getCurrentPosition(
    onPositionSuccess,
    onPositionError,
    geolocationOptions
  );

  let map;
  let startMarker, endMarker;
  let userAvatarUrl = "";
  let routeControl;

  function onPositionSuccess(position) {
    const { latitude, longitude } = position.coords;

    map = new ymaps.Map("map", {
      center: [latitude, longitude],
      zoom: 17,
      controls: [],
    });

    const objectManager = new ymaps.ObjectManager({
      clusterize: true,
      gridSize: 32,
      clusterDisableClickZoom: true,
    });

    setupMap(map, objectManager);
    updateTaxiData(objectManager);
    checkTaxiUser(map);

    setInterval(() => updateTaxiData(objectManager), 500);
    setInterval(updateCoordinate, 2000);
    let route;
    let ched = true;
    let idUserTaxi;

    function checkOrderProgress() {
      $.ajax({
        type: "GET",
        url: "/getOrderProgress/",
        success: function (response) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude: userLatitude, longitude: userLongitude } =
                position.coords;

              const serverLatitude = parseFloat(response.latitude);
              const serverLongitude = parseFloat(response.longitude);
              const TaxiLatitude = parseFloat(response.latitude_taxi);
              const TaxiLongitude = parseFloat(response.longitude_taxi);

              if (!isNaN(serverLatitude) && !isNaN(serverLongitude)) {
                const userCoordinates = [userLatitude, userLongitude];
                const serverCoordinates = [TaxiLatitude, TaxiLongitude];

                if (!route) {
                  route = new ymaps.multiRouter.MultiRoute(
                    {
                      referencePoints: [userCoordinates, serverCoordinates],
                      params: {
                        routingMode: "auto",
                      },
                    },
                    {}
                  );
                  map.geoObjects.add(route);
                } else {
                  route.model.setReferencePoints([
                    userCoordinates,
                    serverCoordinates,
                  ]);
                }

                const userMarker = new ymaps.Placemark(userCoordinates, {
                  balloonContent: "Ваше местоположение",
                });
                const serverMarker = new ymaps.Placemark(serverCoordinates, {
                  balloonContent: "Координаты от сервера",
                });

                map.geoObjects.removeAll();

                map.geoObjects.add(userMarker);
                map.geoObjects.add(serverMarker);
                map.geoObjects.add(route);
              } else {
                console.error(
                  "Неверные координаты от сервера:",
                  serverLatitude,
                  serverLongitude
                );
              }
            },
            onPositionError,
            geolocationOptions
          );

          let bottomBanner = document.getElementById("bottomBanner-user");

          if (!bottomBanner) {
            bottomBanner = document.createElement("div");
            bottomBanner.id = "bottomBanner-user";
            bottomBanner.className = "bottom-banner";
            document.body.appendChild(bottomBanner);
          }

          if (document.getElementById("menu")) {
            document.getElementById("menu").remove();
          }

          const paymentMethodHTML =
            response.payment === "Карта"
              ? `
          <div class="bottom-banner-information-payment">
            <span class="bottom-banner-information-payment-span">Карта</span>
            <img class="bottom-banner-information-payment-img" src="static/img/mir.png" alt="" width="53" height="15">
            <h4 class="bottom-banner-information-payment-h4">${response.price}₽</h4>
          </div>
        `
              : `
          <div class="bottom-banner-information-payment">
            <span class="bottom-banner-information-payment-span">Наличные</span>
            <img class="bottom-banner-information-payment-img" src="static/img/money.png" alt="" width="39" height="39">
            <h4 class="bottom-banner-information-payment-h4">${response.price}₽</h4>
          </div>
        `;

          idUserTaxi = response.id;
          bottomBanner.innerHTML = `
            <button class="banner-Order-Taxi-action-button banner-Order-Taxi-action-button-cancel"  id="bannerOrderTaxiActionButtonHidden" onclick="bannerOrderTaxiActionButtonHidden()">Скрыть</button>
            <span class="bottom-banner-information-span">Заказчик</span>
            <img src="${response.avatar}" class="avatar" alt="Avatar">
            <div class="order-info">
              <p class="banner-text customer-name">${response.username}</p>
              <div class="customer-rating">
                <div class="rating-stars">
                  <svg class="star filled" width="36" height="36" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.0979 1.8541C11.6966 0.0114832 14.3034 0.0114818 14.9021 1.8541L16.5922 7.05573C16.86 7.87977 17.6279 8.43769 18.4943 8.43769H23.9636C25.9011 8.43769 26.7066 10.9169 25.1392 12.0557L20.7145 15.2705C20.0135 15.7798 19.7202 16.6825 19.9879 17.5066L21.678 22.7082C22.2767 24.5508 20.1678 26.0831 18.6003 24.9443L14.1756 21.7295C13.4746 21.2202 12.5254 21.2202 11.8244 21.7295L7.39966 24.9443C5.83224 26.0831 3.72327 24.5508 4.32198 22.7082L6.01209 17.5066C6.27984 16.6825 5.98652 15.7798 5.28555 15.2705L0.860783 12.0557C-0.706645 10.9169 0.0989046 8.43769 2.03635 8.43769H7.50566C8.37212 8.43769 9.14003 7.87977 9.40778 7.05573L11.0979 1.8541Z"/>
                  </svg>
                  <span>5 (30000 отзывов)</span>
                </div>
              </div>
              <span class="order-info-span">6000 поездок</span>
              <div class="order-info-all-info">
                <div class="order-info-all-info-img">
                  <img src="static/img/black car.png" alt="">
                </div>
                <div class="order-info-all-info-span">
                  <div class="order-info-all-info-span-li">
                    <span>Номер: </span>
                    <h4>22lox312</h4>
                  </div>
                  <div class="order-info-all-info-span-li">
                    <span>Модель: </span>
                    <h4>BMW I8</h4>
                  </div>
                </div>
              </div>
            </div>
            <span class="bottom-banner-information-span-payment">Оплата</span>
            
            ${paymentMethodHTML}

            <div class="bottom-banner-information-button">
              <div class="bottom-banner-information-button-svg">
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="25" cy="25" r="24.5" fill="white" stroke="#151513"/>
                <path d="M30.4922 27.9876C30.2966 27.8964 30.1029 27.8018 29.9112 27.7039C29.1206 27.3003 28.1249 27.5929 27.7576 28.401C27.252 29.5133 25.791 29.7783 24.927 28.9143L21.0736 25.0609C20.2096 24.1969 20.4746 22.7359 21.5869 22.2303C22.3528 21.8822 22.6226 20.9328 22.2226 20.1927C22.0537 19.88 21.8936 19.5617 21.7427 19.2381C21.4415 18.5923 21.1801 17.9321 20.9588 17.2612C20.5938 16.1551 19.338 15.5383 18.3002 16.0671L15.5651 17.4606C15.1149 17.69 14.8355 18.1613 14.8795 18.6647C15.2502 22.9013 17.1017 26.8718 20.1089 29.879C23.1161 32.8862 27.0866 34.7377 31.3232 35.1083C31.827 35.1524 32.2985 34.8728 32.5281 34.4223L33.9973 31.5388C34.5327 30.4879 33.8935 29.2172 32.7672 28.8671C31.9937 28.6266 31.2335 28.3333 30.4922 27.9876Z" fill="#151513" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="25" cy="25" r="24.5" fill="white" stroke="#151513"/>
                <path d="M29.3696 16.0001H19.7898C17.1458 16.0001 14.9999 18.1364 14.9999 20.7709V26.4996V27.4576C14.9999 30.092 17.1458 32.2283 19.7898 32.2283H21.2267C21.4854 32.2283 21.8303 32.4007 21.9931 32.6115L23.4301 34.5179C24.0624 35.3609 25.097 35.3609 25.7292 34.5179L27.1662 32.6115C27.3482 32.372 27.6356 32.2283 27.9326 32.2283H29.3696C32.0136 32.2283 34.1595 30.092 34.1595 27.4576V20.7709C34.1595 18.1364 32.0136 16.0001 29.3696 16.0001ZM20.7478 25.5799C20.2113 25.5799 19.7898 25.1488 19.7898 24.6219C19.7898 24.095 20.2209 23.664 20.7478 23.664C21.2746 23.664 21.7057 24.095 21.7057 24.6219C21.7057 25.1488 21.2842 25.5799 20.7478 25.5799ZM24.5797 25.5799C24.0432 25.5799 23.6217 25.1488 23.6217 24.6219C23.6217 24.095 24.0528 23.664 24.5797 23.664C25.1066 23.664 25.5376 24.095 25.5376 24.6219C25.5376 25.1488 25.1161 25.5799 24.5797 25.5799ZM28.4116 25.5799C27.8751 25.5799 27.4536 25.1488 27.4536 24.6219C27.4536 24.095 27.8847 23.664 28.4116 23.664C28.9385 23.664 29.3696 24.095 29.3696 24.6219C29.3696 25.1488 28.9481 25.5799 28.4116 25.5799Z" fill="#151513"/>
                </svg>
              </div>
              <div class="bottom-banner-information-button-cancel">
                <button onclick="deleteOrder(${response.idOrder})">Отказаться от водителя</button>
              </div>
            </div>
          `;
        },

        error: function (xhr, status, error) {
          let bottomBanner = document.getElementById("bottomBanner-user");

          if (bottomBanner) {
            ched = false;
            bottomBanner.remove();
            map.geoObjects.removeAll();
            menu();
            bannerStarClient(idUserTaxi, "поездку");
            if (document.getElementById("bannerOrderTaxi")) {
              document.getElementById("bannerOrderTaxi").remove();
            }

            setInterval(() => updateTaxiData(objectManager), 500);
          }
        },
      });
    }

    if (ched) {
      setInterval(checkOrderProgress, 2000);
    }
  }

  function setupMap(map, objectManager) {
    objectManager.objects.options.set("preset", "islands#yellowIcon");
    objectManager.clusters.options.set("preset", "islands#yellowClusterIcons");
    map.geoObjects.add(objectManager);

    orderTaxiButton(map);
    mapSettings(map);

    function mapSettings(map) {
      map.controls.remove(
        "searchControl",
        "fullscreenControl",
        "zoomControl",
        "rulerControl"
      );

      map.controls.add("geolocationControl", {
        position: { right: 30, bottom: 120 },
      });
      map.controls.add("trafficControl", "typeSelector");
      map.behaviors.enable(["scrollZoom"]);
    }

    function sendRouteData(tarif, payment) {
      if (startMarker && endMarker) {
        ymaps
          .route([
            startMarker.geometry.getCoordinates(),
            endMarker.geometry.getCoordinates(),
          ])
          .then((route) => {
            if (route) {
              map.geoObjects.add(route);
            }
          })
          .catch((error) => {
            console.error("Error calculating the route:", error);
          });

        sendRequest("/route_data/", {
          start_latitude: startMarker.geometry.getCoordinates()[0],
          start_longitude: startMarker.geometry.getCoordinates()[1],
          end_latitude: endMarker.geometry.getCoordinates()[0],
          end_longitude: endMarker.geometry.getCoordinates()[1],
          tarif: tarif,
          payment: payment,
        });
      }
    }

    function showRouteControl(map) {
      if (routeControl) {
        removeRouteControl(map); // Remove the existing control if it exists
      }

      map.controls.add("routePanelControl");
      routeControl = map.controls.get("routePanelControl");

      routeControl.routePanel.state.set({ type: "car" });
      routeControl.routePanel.options.set({ types: { car: true } });

      routeControl.routePanel.getRouteAsync().then((route) => {
        route.model.events.add("requestsuccess", () => {
          const points = route.getWayPoints();
          if (points.getLength() > 1) {
            createMarkers(
              points.get(0).geometry.getCoordinates(),
              points.get(points.getLength() - 1).geometry.getCoordinates()
            );
          }
        });
      });

      return routeControl;
    }

    function removeRouteControl(map) {
      if (routeControl) {
        map.controls.remove(routeControl);
        routeControl = null;
      }
    }

    function createMarkers(startCoords, endCoords) {
      if (startMarker) map.geoObjects.remove(startMarker);
      if (endMarker) map.geoObjects.remove(endMarker);

      const avatarUrl = userAvatarUrl;

      startMarker = new ymaps.Placemark(startCoords, {}, {});

      const endMarkerLayout = ymaps.templateLayoutFactory.createClass(`
        <div style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 50%; border: 2px solid white; background-color: white;">
          <img class="round-avatar" src="${avatarUrl}" style="width: 100%; height: 100%;" />
        </div>
      `);

      const markerOptions = {
        iconLayout: endMarkerLayout,
        iconImageSize: [30, 30],
        iconImageOffset: [-15, -15],
      };

      endMarker = new ymaps.Placemark(endCoords, {}, markerOptions);
      startMarker = new ymaps.Placemark(startCoords, {}, {});

      map.geoObjects.add(endMarker);
      map.geoObjects.add(startMarker);
    }

    function bannerOrderTaxi(map) {
      $.ajax({
        type: "GET",
        url: "/getPrice/",
        success: function (response) {
          if (document.getElementById("menu")) {
            document.getElementById("menu").remove();
          }
          const bannerOrderTaxi = document.createElement("div");
          bannerOrderTaxi.id = "bannerOrderTaxi";
          bannerOrderTaxi.className = "banner-Order-Taxi";
          bannerOrderTaxi.innerHTML = `
            <button class="banner-Order-Taxi-action-button banner-Order-Taxi-action-button-cancel"  id="bannerOrderTaxiActionButtonCancel">Закрыть</button>
            <div class="banner-Order-Taxi-tarif">
                <div class="banner-Order-Taxi-tarif-sl">
    
                  <span class="banner-Order-Taxi-tatif-sl-price">${response.eco}₽</span>
    
                  <input type="radio" id="tarif-eco" name="tarif" value="Эконом">
                  <label for="tarif-eco" class="banner-Order-Taxi-tarif-button">Эконом</label>
    
                  <div class="banner-Order-Taxi-tarif-sl-ch">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.99976 7.33337C9.56445 7.33337 10.8329 6.06494 10.8329 4.50024C10.8329 2.93555 9.56445 1.66711 7.99976 1.66711C6.43506 1.66711 5.16663 2.93555 5.16663 4.50024C5.16663 6.06494 6.43506 7.33337 7.99976 7.33337Z" fill="#929292"/>
                    <path d="M7.99999 8C5.23858 8 3 10.1208 3 12.7368C3 13.4345 3.59697 14 4.33334 14H11.6667C12.403 14 13 13.4345 13 12.7368C13 10.1208 10.7614 8 7.99999 8Z" fill="#929292"/>
                    </svg>
                    <span>4</span>
                  </div>
                </div>
    
                <div class="banner-Order-Taxi-tarif-sl">
    
                  <span class="banner-Order-Taxi-tatif-sl-price">${response.comfort}₽</span>
                  
                  <input type="radio" id="tarif-comfort" name="tarif" value="Комфорт">
                  <label for="tarif-comfort" class="banner-Order-Taxi-tarif-button">Комфорт</label>
    
                  <div class="banner-Order-Taxi-tarif-sl-ch">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.99976 7.33337C9.56445 7.33337 10.8329 6.06494 10.8329 4.50024C10.8329 2.93555 9.56445 1.66711 7.99976 1.66711C6.43506 1.66711 5.16663 2.93555 5.16663 4.50024C5.16663 6.06494 6.43506 7.33337 7.99976 7.33337Z" fill="#929292"/>
                    <path d="M7.99999 8C5.23858 8 3 10.1208 3 12.7368C3 13.4345 3.59697 14 4.33334 14H11.6667C12.403 14 13 13.4345 13 12.7368C13 10.1208 10.7614 8 7.99999 8Z" fill="#929292"/>
                    </svg>
                    <span>4</span>
                  </div>
                </div>
    
                <div class="banner-Order-Taxi-tarif-sl">
    
                  <span class="banner-Order-Taxi-tatif-sl-price">${response.business}₽</span>
                  
                  <input type="radio" id="tarif-business" name="tarif" value="Бизнес">
                  <label for="tarif-business" class="banner-Order-Taxi-tarif-button">Бизнес</label>
    
                  <div class="banner-Order-Taxi-tarif-sl-ch">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.99976 7.33337C9.56445 7.33337 10.8329 6.06494 10.8329 4.50024C10.8329 2.93555 9.56445 1.66711 7.99976 1.66711C6.43506 1.66711 5.16663 2.93555 5.16663 4.50024C5.16663 6.06494 6.43506 7.33337 7.99976 7.33337Z" fill="#929292"/>
                    <path d="M7.99999 8C5.23858 8 3 10.1208 3 12.7368C3 13.4345 3.59697 14 4.33334 14H11.6667C12.403 14 13 13.4345 13 12.7368C13 10.1208 10.7614 8 7.99999 8Z" fill="#929292"/>
                    </svg>
                    <span>4</span>
                  </div>
                </div>
            </div>
            <span class="banner-Order-Taxi-payment-span">Способ оплаты</span>
            <div class="banner-Order-Taxi-payment">
          
        
            <div class="banner-Order-Taxi-payment-el">
              <input type="radio" id="payment-card" name="payment" value="Карта">
              <label for="payment-card" class="banner-Order-Taxi-payment-button">Карта</label>
              <img class="banner-Order-Taxi-payment-el-img" src="static/img/mir.png" alt="" width="53" height="15">
            </div>
            <div class="banner-Order-Taxi-payment-el">
              <input type="radio" id="payment-cash" name="payment" value="Наличные">
              <label for="payment-cash" class="banner-Order-Taxi-payment-button">Наличные</label>
              <img class="banner-Order-Taxi-payment-el-img" src="static/img/money.png" alt="" width="39" height="39">
            </div>
    
            </div>
            <div class="banner-Order-Taxi-actions">
                <button class="banner-Order-Taxi-action-button banner-Order-Taxi-action-button-confirm" id="bannerOrderTaxiActionButtonConfirm">Подтвердить</button>
            </div>
          `;
          document.body.appendChild(bannerOrderTaxi);
    
          const updateStyles = () => {
            document.querySelectorAll('.banner-Order-Taxi-tarif-sl').forEach((el) => {
              const radio = el.querySelector('input[type="radio"]');
              if (radio.checked) {
                el.classList.add('active');
              } else {
                el.classList.remove('active');
              }
            });
          };
    
          const updatePaymentStyles = () => {
            document.querySelectorAll('.banner-Order-Taxi-payment-el').forEach((el) => {
              const radio = el.querySelector('input[type="radio"]');
              const label = el.querySelector('.banner-Order-Taxi-payment-button');
              
              if (radio.checked) {
                el.classList.add('active');

              } else {
                el.classList.remove('active');
                label.style.backgroundColor = '';      // Убираем стили, если радио не активно
                label.style.borderColor = '';
              }
            });
          };
          
    
          document.querySelectorAll('input[name="tarif"]').forEach((radio) => {
            radio.addEventListener('change', updateStyles);
          });
    
          document.querySelectorAll('input[name="payment"]').forEach((radio) => {
            radio.addEventListener('change', updatePaymentStyles);
          });
    
          document.querySelector(".banner-Order-Taxi-action-button-confirm").addEventListener("click", () => {
            const selectedTarif = document.querySelector('input[name="tarif"]:checked');
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
    
            const selectedTarifValue = selectedTarif ? selectedTarif.value : null;
            const selectedPaymentValue = selectedPayment ? selectedPayment.value : null;
            
            $.ajax({
              type: "GET",
              url: "/get_user_all_information/",
              success: function (data) {
                if (selectedTarifValue === null || selectedPaymentValue === null) {
                  showTaxiAlertError("Вы не выбрали тариф или способ оплаты");
                } else {
                  $.ajax({
                    type: "GET",
                    url: "/getPriceTarif/",
                    data: {
                      selectedTarifValue: selectedTarifValue,
                    },
                    success: function (response) {
                      if (data.user_data.money_orders < response.price && selectedPaymentValue == "Карта") {
                        showTaxiAlertError("Недостаточно денег на карте");
                      } else {
                        sendRouteData(selectedTarifValue, selectedPaymentValue);
                        document.getElementById("bannerOrderTaxiActionButtonConfirm").remove();
                        document.getElementById("bannerOrderTaxiActionButtonCancel").remove();
                        document.querySelectorAll('input[type="radio"]').forEach((radio) => {
                          radio.disabled = true;
                        });
                        removeRouteControl(map);
                        orderTaxiButton(map);
                      }
                    },
                  });
                }
              },
            });
          });
    
          document.querySelector(".banner-Order-Taxi-action-button-cancel")
            .addEventListener("click", () => {
              const radios = document.querySelectorAll('input[type="radio"]');
              radios.forEach((radio) => (radio.checked = false));
              document.getElementById("bannerOrderTaxi").remove();
              removeRouteControl(map);
              orderTaxiButton(map);
              menu();
            });
    
          // Initial call to updateStyles and updatePaymentStyles to set the correct styles on page load
          updateStyles();
          updatePaymentStyles();
        },
      });
    }

    function orderTaxiButton(map) {
      const buttonLayout = ymaps.templateLayoutFactory.createClass(
        '<button class="find-button">{{ data.content }}</button>'
      );
      const button = new ymaps.control.Button({
        data: { content: "Заказать такси" },
        options: { layout: buttonLayout },
      });

      button.events.add("click", () => {
        routeControl = showRouteControl(map);
        map.controls.remove(button);
        bannerOrderTaxi(map);
      });

      map.controls.add(button, { position: { left: 18, bottom: 120 } });
    }
  }

  function updateCoordinate() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        sendRequest("/coordinate/", { latitude, longitude });
      },
      onPositionError,
      geolocationOptions
    );
  }

  function updateTaxiData(objectManager) {
    sendRequest("/get_taxi/", null, (responseData) => {
      const data = responseData.latitude.map((lat, i) => ({
        type: "Feature",
        id: i + 1,
        geometry: {
          type: "Point",
          coordinates: [lat, responseData.longitude[i]],
        },
        properties: {
          balloonContent: `Такси (${responseData.number[i]})`,
        },
      }));

      ymaps.option.presetStorage.add("custom#myIcon", {
        iconLayout: "default#image",
        iconImageHref: "static/img/taxi.png",
        iconImageSize: [30, 42],
        iconImageOffset: [-15, -42],
      });

      objectManager.objects.options.set("preset", "custom#myIcon");
      objectManager.clusters.options.set(
        "preset",
        "islands#yellowClusterIcons"
      );
      objectManager.removeAll();
      objectManager.add(data);
    });
  }

  function sendRequest(url, data = {}, successCallback = () => {}) {
    $.ajax({
      type: "GET",
      url: url,
      headers: { "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content") },
      data: { ...data, csrfmiddlewaretoken: "{{ csrf_token }}" },
      success: successCallback,
      error: (xhr, status, error) => console.log(`Error with ${url}:`, error),
    });
  }
}

function checkTaxiUser(map) {
  getUserInformation(function(userData) {
    if (userData.taxi == true) {
      // $.ajax({
      //   type: "GET",
      //   url: "/get_user_all_information/",
      //   success: function (response) {
      //       console.log(response.user_data.is_order_progress)
      //   }
      // });
      const buttonLayout = ymaps.templateLayoutFactory.createClass(`
        <button class="start-button">{{ data.content }}</button>
      `);

      const button = new ymaps.control.Button({
        data: { content: "Начать работу" },
        options: { layout: buttonLayout },
      });

      button.events.add("click", function () {
        showTaxiAlert("Ожидание заказов!");
        checkTaxiOrders(map, button);
      });

      map.controls.add(button, { position: { left: 18, bottom: 180 } });

    }
  });
}

let currentRoute;

function createRoute(
  userLatitude,
  userLongitude,
  newEndLatitude,
  newEndLongitude,
  map
) {
  ymaps
    .route(
      [
        [userLatitude, userLongitude],
        [newEndLatitude, newEndLongitude],
      ],
      {
        mapStateAutoApply: true,
      }
    )
    .then(
      function (route) {
        currentRoute = route;
        map.geoObjects.add(currentRoute);

        route.getPaths().options.set({
          balloonContentBodyLayout: ymaps.templateLayoutFactory.createClass(
            "Длина маршрута: " + route.getHumanLength()
          ),
          strokeColor: "9b72cf",
          opacity: 0.8,
        });
        var segments = route.getPaths().get(0).getSegments();

        if (segments.length > 0) {
          var firstSegment = segments[0];

          var length = firstSegment.getLength(); // длина сегмента в метрах
          var action = firstSegment.getAction(); // действие: turn, uturn, etc.

          console.log("First Segment info:", {
            length,
            action,
          });

          var direction;
          if (action && action.type === "turn") {
            direction = action.direction; // направление: left, right, etc.
          } else {
            direction = "прямо";
          }
          console.log(
            `Первый поворот через ${length} метров, направление: ${direction}`
          );
        } else {
          console.log("Сегменты маршрута отсутствуют.");
        }
      },
      function (error) {
        console.error("Ошибка при создании нового маршрута:", error);
      }
    );
  map.geoObjects.remove(currentRoute);
}

function checkTaxiOrders(map, button_end) {
  let startMarker, endMarker;
  let isOrderPending = false;

  function updatePosition() {
    if (isOrderPending) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: userLatitude, longitude: userLongitude } =
          position.coords;

        $.ajax({
          type: "GET",
          url: "/checkTaxiOrders/",
          success: function (data) {
            if (data.taxi) {
              isOrderPending = true;

              $.ajax({
                type: "GET",
                url: "/get_user_all_information/",
                success: function (response) {
                  const audioElement = new Audio();
                  audioElement.src = response.user_data.sound_taxi;
                  audioElement.play().catch();
                }
              });
            

              const endLatitude = parseFloat(data.taxi.end_latitude);
              const endLongitude = parseFloat(data.taxi.end_longitude);

              if (isNaN(endLatitude) || isNaN(endLongitude)) return;

              if (startMarker) map.geoObjects.remove(startMarker);
              if (endMarker) map.geoObjects.remove(endMarker);

              startMarker = new ymaps.Placemark([userLatitude, userLongitude], {
                balloonContent: "Ваше местоположение",
                preset: "islands#greenDotIconWithCaption",
              });
              endMarker = new ymaps.Placemark([endLatitude, endLongitude], {
                balloonContent: "Точка назначения",
                preset: "islands#redDotIconWithCaption",
              });

              function startMarkerFunc() {
                if(startMarker) {
                  $.ajax({
                    type: "GET",
                    url: "/get_user_all_information/",
                    success: function (response) {
                      startMarker.geometry.setCoordinates([
                        response.user_data.latitude,
                        response.user_data.longitude,
                      ]);
                    }
                  });
                }
              }

              map.geoObjects.add(startMarker);
              map.geoObjects.add(endMarker);

              const existingBanner = document.getElementById("bottomBanner");
              if (existingBanner) {
                existingBanner.remove();
              }

              $.ajax({ type: "GET", url: "/isJobTaxi/", data: "data" });

              $.ajax({
                type: "GET",
                url: "/takeTaxiId/",
                data: { id: data.taxi.id },
              });

              if (document.getElementById("menu")) {
                document.getElementById("menu").remove();
              }

              const bottomBanner = document.createElement("div");
              bottomBanner.id = "bottomBanner";
              bottomBanner.className = "bottom-banner";

              const paymentHTML =
                data.taxi.payment === "Карта"
                  ? `
                <div class="bottom-banner-information-payment">
                  <span class="bottom-banner-information-payment-span">Карта</span>
                  <img class="bottom-banner-information-payment-img" src="static/img/mir.png" alt="" width="53" height="15">
                  <h4 class="bottom-banner-information-payment-h4">${data.taxi.price}₽</h4>
                </div>
              `
                  : `
                <div class="bottom-banner-information-payment">
                  <span class="bottom-banner-information-payment-span">Наличные</span>
                  <img class="bottom-banner-information-payment-img" src="static/img/money.png" alt="" width="39" height="39">
                  <h4 class="bottom-banner-information-payment-h4">${data.taxi.price}₽</h4>
                </div>
              `;

              bottomBanner.innerHTML = `
                <button class="banner-Order-Taxi-action-button banner-Order-Taxi-action-button-cancel" id="bannerOrderTaxiActionButtonHidden" onclick="bannerOrderTaxiActionButtonHidden()">Скрыть</button>
                <span class="bottom-banner-information-span">Информация</span>
                <img src="${data.taxi.avatar}" class="avatar" alt="Avatar">
                <div class="order-info">
                  <p class="banner-text customer-name">${data.taxi.user_username}</p>
                  <div class="customer-rating">
                    <div class="rating-stars">
                      <svg class="star filled" width="36" height="36" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.0979 1.8541C11.6966 0.0114832 14.3034 0.0114818 14.9021 1.8541L16.5922 7.05573C16.86 7.87977 17.6279 8.43769 18.4943 8.43769H23.9636C25.9011 8.43769 26.7066 10.9169 25.1392 12.0557L20.7145 15.2705C20.0135 15.7798 19.7202 16.6825 19.9879 17.5066L21.678 22.7082C22.2767 24.5508 20.1678 26.0831 18.6003 24.9443L14.1756 21.7295C13.4746 21.2202 12.5254 21.2202 11.8244 21.7295L7.39966 24.9443C5.83224 26.0831 3.72327 24.5508 4.32198 22.7082L6.01209 17.5066C6.27984 16.6825 5.98652 15.7798 5.28555 15.2705L0.860783 12.0557C-0.706645 10.9169 0.0989046 8.43769 2.03635 8.43769H7.50566C8.37212 8.43769 9.14003 7.87977 9.40778 7.05573L11.0979 1.8541Z"/>
                      </svg>
                      <span>5 (30000 отзывов)</span>
                    </div>
                  </div>
                  <span class="order-info-span">6000 поездок</span>
                </div>
                <span class="bottom-banner-information-span-payment">Оплата</span>
                ${paymentHTML}
                <div class="bottom-banner-information-button">
                  <div class="bottom-banner-information-button-svg">
                    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="25" cy="25" r="24.5" fill="white" stroke="#151513"/>
                      <path d="M30.4922 27.9876C30.2966 27.8964 30.1029 27.8018 29.9112 27.7039C29.1206 27.3003 28.1249 27.5929 27.7576 28.401C27.252 29.5133 25.791 29.7783 24.927 28.9143L21.0736 25.0609C20.2096 24.1969 20.4746 22.7359 21.5869 22.2303C22.3528 21.8822 22.6226 20.9328 22.2226 20.1927C22.0537 19.88 21.8936 19.5617 21.7427 19.2381C21.4415 18.5923 21.1801 17.9321 20.9588 17.2612C20.5938 16.1551 19.338 15.5383 18.3002 16.0671L15.5651 17.4606C15.1149 17.69 14.8355 18.1613 14.8795 18.6647C15.2502 22.9013 17.1017 26.8718 20.1089 29.879C23.1161 32.8862 27.0866 34.7377 31.3232 35.1083C31.827 35.1524 32.2985 34.8728 32.5281 34.4223L33.9973 31.5388C34.5327 30.4879 33.8935 29.2172 32.7672 28.8671C31.9937 28.6266 31.2335 28.3333 30.4922 27.9876Z" fill="#151513" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="25" cy="25" r="24.5" fill="white" stroke="#151513"/>
                      <path d="M29.3696 16.0001H19.7898C17.1458 16.0001 14.9999 18.1364 14.9999 20.7709V26.4996V27.4576C14.9999 30.092 17.1458 32.2283 19.7898 32.2283H21.2267C21.4854 32.2283 21.8303 32.4007 21.9931 32.6115L23.4301 34.5179C24.0624 35.3609 25.097 35.3609 25.7292 34.5179L27.1662 32.6115C27.3482 32.372 27.6356 32.2283 27.9326 32.2283H29.3696C32.0136 32.2283 34.1595 30.092 34.1595 27.4576V20.7709C34.1595 18.1364 32.0136 16.0001 29.3696 16.0001ZM20.7478 25.5799C20.2113 25.5799 19.7898 25.1488 19.7898 24.6219C19.7898 24.095 20.2209 23.664 20.7478 23.664C21.2746 23.664 21.7057 24.095 21.7057 24.6219C21.7057 25.1488 21.2842 25.5799 20.7478 25.5799ZM24.5797 25.5799C24.0432 25.5799 23.6217 25.1488 23.6217 24.6219C23.6217 24.095 24.0528 23.664 24.5797 23.664C25.1066 23.664 25.5376 24.095 25.5376 24.6219C25.5376 25.1488 25.1161 25.5799 24.5797 25.5799ZM28.4116 25.5799C27.8751 25.5799 27.4536 25.1488 27.4536 24.6219C27.4536 24.095 27.8847 23.664 28.4116 23.664C28.9385 23.664 29.3696 24.095 29.3696 24.6219C29.3696 25.1488 28.9481 25.5799 28.4116 25.5799Z" fill="#151513"/>
                    </svg>
                  </div>
                  <div class="bottom-banner-information-button-cancel">
                    <button id="BottomBannerInformationButton">Прибыл</button>
                  </div>
                </div>
              `;

              document.body.appendChild(bottomBanner);

              setInterval(startMarkerFunc, 1000)

              function handleEndEvent() {
                const newEndLatitude = parseFloat(data.taxi.start_latitude);
                const newEndLongitude = parseFloat(data.taxi.start_longitude);

                if (!isNaN(newEndLatitude) && !isNaN(newEndLongitude)) {
                  endMarker.geometry.setCoordinates([
                    newEndLatitude,
                    newEndLongitude,
                  ]);
                }

                createRoute(
                  userLatitude,
                  userLongitude,
                  newEndLatitude,
                  newEndLongitude,
                  map
                );

                // Удаляем существующий элемент с id 'BottomBannerInformationButton'
                document
                  .getElementById("BottomBannerInformationButton")
                  .remove();

                // Создаем новый div элемент
                const finishButtonDiv = document.createElement("div");
                finishButtonDiv.className =
                  "bottom-banner-information-button-cancel";

                // Создаем новый button элемент внутри div
                const finishButton = document.createElement("button");
                finishButton.id = "BottomBannerInformationButtonFinish";
                finishButton.textContent = "Завершить";

                // Добавляем кнопку в div
                finishButtonDiv.appendChild(finishButton);

                // Добавляем div к нижнему баннеру
                bottomBanner.appendChild(finishButtonDiv);

                document
                  .getElementById("BottomBannerInformationButtonFinish")
                  .addEventListener("click", () => {
                    finishButton.addEventListener("click", () => {
                      if (startMarker) {
                        map.geoObjects.remove(startMarker);
                        startMarker = null;
                      }
                      if (endMarker) {
                        map.geoObjects.remove(endMarker);
                        endMarker = null;
                      }

                      if (currentRoute) {
                        map.geoObjects.remove(currentRoute);
                        currentRoute = null;
                      }

                      checkTaxiUser(map);
                      bottomBanner.remove();
                      menu();

                      $.ajax({
                        type: "GET",
                        url: "/deleteOrder/",
                        data: { id: data.taxi.id },
                      });

                      // ========================== Логига списание денег с карты и отправки таксисту ===========================

                      $.ajax({
                        type: "GET",
                        url: "/moneyPayTaxi/",
                        data: {
                          price: data.taxi.price,
                          id_user: data.taxi.user_id,
                        }
                      });

                      // ========================================================================================================

                      bannerStarClient(data.taxi.user_id, "клиента");
                    });
                  });
              }

              // document.addEventListener("mousemove", handleMoveEvent);
              // document.addEventListener("touchmove", handleMoveEvent);

              document
                .getElementById("BottomBannerInformationButton")
                .addEventListener("mouseup", handleEndEvent);
              document
                .getElementById("BottomBannerInformationButton")
                .addEventListener("touchend", handleEndEvent);

              map.controls.remove(button_end);

              createRoute(
                userLatitude,
                userLongitude,
                endLatitude,
                endLongitude,
                map
              );
            } else if (data.message === "No pending orders") {
              isOrderPending = false;
            }
          },
          error: function (xhr, status, error) {
            console.error("Ошибка при проверке заказов такси:", error);
            if(document.getElementById('bottomBanner')) document.getElementById('bottomBanner');

            if (startMarker) map.geoObjects.remove(startMarker);
            if (endMarker) map.geoObjects.remove(endMarker);
            isOrderPending = false;
          },
        });
      },
      onPositionError,
      geolocationOptions
    );
  }

  setInterval(updatePosition, 5000);

  updatePosition();
}

function getUserInformation(callback) {
  $.ajax({
    type: "GET",
    url: "/get_user_all_information/",
    success: function(response) {
      callback(response.user_data);
    },
    error: function(xhr, status, error) {
      console.error("Ошибка при получении информации о пользователе:", error);
    }
  });
}

              // getUserInformation(function(userData) {
              //   const audioElement = new Audio();
              //   audioElement.src = userData.sound_taxi;
              //   audioElement.play().catch();
              // });

function bannerAuth() {
  const bannerAuth = document.createElement("div");
  bannerAuth.className = "banner-auth";
  bannerAuth.id = "banner-auth";
  bannerAuth.innerHTML = `
      <div class="banner-auth">
          <img src="static/img/Welcome Screen.png">
          <h4>Добро пожаловать</h4>

          <button class="banner-auth-create" onclick="bannerAuthCreate()">Создать аккаунт</button>
          <button class="banner-auth-login" onclick="bannerAuthLogin()">Войти</button>
      </div>
  `;

  document.body.appendChild(bannerAuth);
}

function checkAuth() {
  // Получение CSRF токена из cookie
  const csrftoken = getCookie('csrftoken');

  // Отправка запроса с CSRF токеном в заголовке
  $.ajax({
    type: "GET",
    url: "/check_session/",
    headers: {
      'X-CSRFToken': csrftoken
    },
    success: (data) => {
      if (data === "Session exists") {
        $.ajax({
          type: "GET",
          url: "/online/",
          data: {
            inf: true
          },
          success: function (response) {
            ymaps.ready(init);
            menu();
          }
        });
      } else {
        bannerAuth();
      }
    },
  });
}

// Функция для получения CSRF токена из cookie (предполагается, что он там хранится)
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Ищем cookie с нужным именем
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}


function checkGPS() {
  function checkGeoLocation() {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        checkAuth()
      },
      function(error) {
        switch(error.code) {
          case error.PERMISSION_DENIED:
            console.log('Пользователь отказал в доступе к геолокации');
            break;
          case error.POSITION_UNAVAILABLE:
            console.log('Информация о местоположении недоступна');
            break;
          case error.TIMEOUT:
            console.log('Время запроса истекло');
            break;
          default:
            console.log('Произошла ошибка при определении местоположения');
        }
        // Показать модальное окно о геолокации
        document.getElementById('geoModal').style.display = 'block';
      }
    );
  }

  // Вызов проверки геолокации при загрузке страницы и затем каждые 10 секунд
  window.onload = function () {
    checkGeoLocation(); // Вызов при загрузке страницы
  };
}

function menu() {
  if (document.getElementById('menu')) {
    document.getElementById('menu').remove()
  }
  const menu = document.createElement("div");
  menu.id = "menu";
  menu.className = "menu";
  menu.innerHTML = `
    <div  onclick="home()">
      <img src="static/img/home.svg" alt="">
    </div>
    <div>
      <img src="static/img/favorite.svg" alt="">
    </div>
    <div onclick="coin()" class="menu-coin">
      <img src="static/img/coin.svg" alt="">
    </div>
    <div onclick="discont()">
      <img src="static/img/discont.svg" alt="">
    </div>
    <div onclick="profil()">
      <img src="static/img/profil.svg" alt="" id="menu-profil-icon">
    </div>
  `;

  document.body.appendChild(menu);
}

const geolocationOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function onPositionError(error) {
  console.warn(`ERROR(${error.code}): ${error.message}`);
}

checkGPS();
