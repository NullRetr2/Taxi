from django.contrib import admin
from .models import User, Transactions

admin.site.register(User)
admin.site.register(Transactions)