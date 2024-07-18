from django.contrib import admin
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from main.views import (
    index,
    update_coordinates,
    get_taxi,
    check_session,
    register,
    login,
    route_data,
    checkTaxiOrders,
    deleteOrder,
    moneyPayTaxi,
    isJobTaxi,
    takeTaxiId,
    getOrderProgress,
    getPrice,
    setStars,
    get_user_all_information,
    getPriceTarif,
    get_discont,
    get_transactions,
    updateInformationUser,
    online,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", index, name="index"),
    path("coordinate/", update_coordinates, name="update_coordinates"),
    path("get_taxi/", get_taxi, name="get_taxi"),
    path("check_session/", check_session, name="check_session"),
    path("register/", register, name="register"),
    path("login/", login, name="login"),
    path("route_data/", route_data, name="route_data"),
    path("checkTaxiOrders/", checkTaxiOrders, name="checkTaxiOrders"),
    path("deleteOrder/", deleteOrder, name="deleteOrder"),
    path("moneyPayTaxi/", moneyPayTaxi, name="moneyPayTaxi"),
    path("isJobTaxi/", isJobTaxi, name="isJobTaxi"),
    path("takeTaxiId/", takeTaxiId, name="takeTaxiId"),
    path("getOrderProgress/", getOrderProgress, name="getOrderProgress"),
    path("getPrice/", getPrice, name="getPrice"),
    path("setStars/", setStars, name="setStars"),
    path(
        "get_user_all_information/",
        get_user_all_information,
        name="get_user_all_information",
    ),
    path("getPriceTarif/", getPriceTarif, name="getPriceTarif"),
    path("get_discont/", get_discont, name="get_discont"),
    path("get_transactions/", get_transactions, name="get_transactions"),
    path("updateInformationUser/", updateInformationUser , name="updateInformationUser"),
    path("online/", online , name="online"),
    
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
