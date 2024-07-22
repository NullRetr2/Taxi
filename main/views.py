from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from .models import OrderTaxi, Tarif, Discont
from user.models import User, Transactions
from django.db import IntegrityError, transaction


def index(request):
    # del request.session["auth"]

    return render(request, "main/index.html")


def checkTaxiOrders(request):
    order = OrderTaxi.objects.filter(progress=False).first()
    data = User.objects.get(id=request.session["auth"])

    if order is not None:
        order.progress = True

        data.is_order_progress = order
        data.save()

        order.save()

        return JsonResponse(
            {
                "taxi": {
                    "id": order.id,
                    "user_id": User.objects.get(id=int(order.user)).id,
                    "avatar": User.objects.get(id=int(order.user)).avatar.url,
                    "payment": order.payment,
                    "user_username": User.objects.get(id=int(order.user)).username,
                    "user_phone": User.objects.get(id=int(order.user)).phone,
                    "user_rating": User.objects.get(id=int(order.user)).rating,
                    "start_latitude": order.start_latitude,
                    "start_longitude": order.start_longitude,
                    "taxi_latitude": data.latitude,
                    "taxi_longitude": data.longitude,
                    "end_latitude": order.end_latitude,
                    "end_longitude": order.end_longitude,
                    "price": order.price,
                }
            }
        )
    else:
        return JsonResponse({"message": "No pending orders"})


def deleteOrder(request):
    order = get_object_or_404(OrderTaxi, id=request.GET.get("id"))
    order.delete()

    data = get_object_or_404(User, id=request.session["auth"])
    data.is_job = False
    data.save()

    return JsonResponse({"message": "Success delete"})


def checkTaxiOrder_Del(request):
    user = get_object_or_404(User, id=request.session.get("auth"))

    response_data = {"is_job": user.is_job, "is_order_progress": None}

    if user.is_order_progress:
        response_data["is_order_progress"] = {
            "id": user.is_order_progress.id,
        }

    return JsonResponse(response_data)


def set_Is_Job(request):
    user = get_object_or_404(User, id=request.session.get("auth"))
    print(request.GET.get("is"))
    user.is_job = request.POST.get("is")

    user.save()

    return JsonResponse({"message": "success"})


def isJobTaxi(request):
    data = get_object_or_404(User, id=request.session["auth"])
    data.is_job = True

    data.save()

    return JsonResponse({"message": "Success"})


def getOrderProgress(request):
    try:
        data = get_object_or_404(
            OrderTaxi, user=int(request.session["auth"]), progress=True
        )
        taxi = get_object_or_404(User, id=data.taxi_take)

        response_data = {
            "message": "Success",
            "id": taxi.id,
            "username": taxi.username,
            "latitude": data.end_latitude,
            "longitude": data.end_longitude,
            "latitude_taxi": taxi.latitude,
            "longitude_taxi": taxi.longitude,
            "idOrder": data.id,
            "number": taxi.number,
            "payment": data.payment,
            "price": data.price,
            "phone": taxi.phone,
            "avatar": taxi.avatar.url,
            "rating": taxi.rating,
        }

        return JsonResponse(response_data)

    except OrderTaxi.DoesNotExist:
        return JsonResponse({"message": "No order in progress"}, status=404)


def takeTaxiId(request):
    user_taxi = get_object_or_404(User, id=request.session["auth"])
    order = get_object_or_404(OrderTaxi, id=request.GET.get("id"))

    order.taxi_take = user_taxi.id

    order.save()

    return JsonResponse({"message": "Success"})


def moneyPayTaxi(request):
    try:
        user_taxi = get_object_or_404(User, id=request.session["auth"])
        user = get_object_or_404(User, id=request.GET.get("id_user"))

        price = int(request.GET.get("price", 0))
        if price <= 0:
            return JsonResponse({"message": "Invalid price"}, status=400)

        t = user_taxi.money_taxi
        d = user.money_orders

        with transaction.atomic():
            user_taxi.money_taxi = int(t) + price
            user.money_orders = int(d) - price

            transactions_taxi = Transactions.objects.create(
                name="Выполнен заказ",
                money=price,
                types=False,
            )
            transactions_user = Transactions.objects.create(
                name="Оплата такси",
                money=price,
                types=True,
            )

            user_taxi.transactions.add(transactions_taxi)
            user.transactions.add(transactions_user)

            user_taxi.save()
            user.save()

        return JsonResponse({"message": "Success"})

    except Exception as e:
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)


def update_coordinates(request):
    latitude = request.GET.get("latitude")
    longitude = request.GET.get("longitude")
    data = User.objects.get(id=request.session["auth"])

    data.latitude = latitude
    data.longitude = longitude

    data.save()

    return JsonResponse(
        {
            "message": "Coordinates updated successfully",
            "latitude": latitude,
            "longitude": longitude,
        }
    )


def get_taxi(request):
    data = User.objects.filter(taxi=True, online=True)

    latitude = []
    longitude = []
    number = []

    for el in data:
        latitude += [el.latitude]
        longitude += [el.longitude]
        number += [el.number]

    return JsonResponse(
        {
            "message": "Coordinates updated successfully",
            "latitude": latitude,
            "longitude": longitude,
            "number": number,
        }
    )


def get_user_all_information(request):
    user = User.objects.get(id=request.session["auth"])

    if user.is_order_progress:
        is_order_progress_data = {"id": user.is_order_progress.id}
    else:
        is_order_progress_data = None

    user_data = {
        "taxi": user.taxi,
        "is_job": user.is_job,
        "latitude": user.latitude,
        "longitude": user.longitude,
        "number": user.number,
        "phone": user.phone,
        "avatar": user.avatar.url if user.avatar else None,
        "email": user.email,
        "rating": user.rating,
        "is_order_progress": is_order_progress_data,
        "money_orders": user.money_orders,
        "money_taxi": user.money_taxi,
        "username": user.username,
        "sound_taxi": user.sound_taxi,
        "sound_order": user.sound_order,
    }

    return JsonResponse({"message": "success", "user_data": user_data})


def check_session(request):
    if request.session.get("auth"):
        return HttpResponse("Session exists")
    else:
        return HttpResponse("Session does not exist")


def register(request):
    if request.method == "POST":
        username = request.POST.get("username")
        phone = request.POST.get("phone")
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirm-password")

        if User.objects.filter(username=username).exists():
            return JsonResponse({"message": "Username already exists"})

        if password == confirm_password:
            us = User.objects.create(username=username, phone=phone, password=password)
            request.session["auth"] = us.id
            return redirect("/")
        else:
            return JsonResponse({"message": "Passwords do not match"})


def login(request):
    if request.method == "POST":
        phone = request.POST.get("login-phone")
        password = request.POST.get("login-password")

        user = User.objects.filter(phone=phone, password=password).first()
        if user:
            request.session["auth"] = user.id
            return JsonResponse({"success": "Logged in successfully"}, status=200)
        else:
            return JsonResponse({"error": "Invalid phone or password"}, status=400)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)


def route_data(request):
    if request.method == "GET":
        start_latitude = request.GET.get("start_latitude")
        start_longitude = request.GET.get("start_longitude")
        end_latitude = request.GET.get("end_latitude")
        end_longitude = request.GET.get("end_longitude")
        tarif = request.GET.get("tarif")
        payment = request.GET.get("payment")

        user_id = request.session.get("auth")
        if not user_id:
            return JsonResponse({"message": "User not authenticated"}, status=401)

        user = get_object_or_404(User, pk=user_id)

        try:
            order, created = OrderTaxi.objects.update_or_create(
                user=user.id,
                defaults={
                    "start_latitude": start_latitude,
                    "start_longitude": start_longitude,
                    "end_latitude": end_latitude,
                    "end_longitude": end_longitude,
                    "tarif": tarif,
                    "payment": payment,
                    "price": 200,
                    "progress": False,
                },
            )

            return JsonResponse({"message": "success"})

        except IntegrityError as e:
            return JsonResponse({"message": "Integrity error"}, status=500)

        except Exception as e:
            return JsonResponse({"message": "Internal server error"}, status=500)

    else:
        return JsonResponse({"message": "Invalid request method"}, status=405)


def getPrice(request):
    return JsonResponse(
        {
            "eco": Tarif.objects.get(id=1).eco,
            "comfort": Tarif.objects.get(id=1).comfort,
            "business": Tarif.objects.get(id=1).business,
        }
    )


def get_discont(request):
    data = Discont.objects.all()
    discont_list = []

    for el in data:
        discont = {
            "name": el.name,
            "about": el.about,
            "discont": el.discont,
            "start_date": el.start_date,
            "end_date": el.end_date,
        }
        discont_list.append(discont)

    return JsonResponse({"discont": discont_list}, safe=False)


def get_transactions(request):
    data = get_object_or_404(User, id=request.session["auth"])
    transactions_list = []

    transactions = data.transactions.all().order_by("-date")

    for el in transactions:
        transaction = {
            "name": el.name,
            "money": el.money,
            "date": el.date.strftime("%d-%m-%Y %H:%M:%S"),
            "types": el.types,
        }
        transactions_list.append(transaction)

    return JsonResponse({"transactions": transactions_list}, safe=False)


def getPriceTarif(request):
    data = request.GET.get("selectedTarifValue")

    if data == "Эконом":
        return JsonResponse({"price": Tarif.objects.get(id=1).eco})
    elif data == "Комфорт":
        return JsonResponse({"price": Tarif.objects.get(id=1).comfort})
    elif data == "Бизнес":
        return JsonResponse({"price": Tarif.objects.get(id=1).business})


def setStars(request):

    data = User.objects.get(id=request.GET.get("id"))
    print(request.GET.get("id"))
    data.rating = request.GET.get("stars")

    data.save()

    return JsonResponse({"message": "success"})


def updateInformationUser(request):
    # Получение текущего пользователя
    user = User.objects.get(id=request.session["auth"])

    # Обновление данных пользователя
    if "phone" in request.POST and request.POST["phone"]:
        print(request.POST["phone"])
        user.phone = request.POST["phone"]

    if "email" in request.POST and request.POST["email"].strip():
        print(request.POST["email"])
        user.email = request.POST["email"].strip()

    if "soundTaxi" in request.POST and request.POST["soundTaxi"] != "null":
        print(request.POST["soundTaxi"])
        user.sound_taxi = request.POST["soundTaxi"]

    if "soundOrder" in request.POST and request.POST["soundOrder"] != "null":
        print(request.POST["soundOrder"])
        user.sound_order = request.POST["soundOrder"]

    if (
        "avatar" in request.FILES and request.FILES["avatar"]
    ):  # Проверяем наличие файла в request.FILES
        print(request.FILES["avatar"])
        user.avatar = request.FILES["avatar"]  # Сохраняем файл

    # Сохранение обновлений
    user.save()

    return HttpResponse("User information updated successfully!")


def online(request):
    onl = request.GET.get("inf")
    if onl == "true":
        user = User.objects.get(id=request.session["auth"])
        user.online = True
        user.save()
    else:
        user = User.objects.get(id=request.session["auth"])
        user.online = False
        user.save()
    return JsonResponse({"message": "dw"})
