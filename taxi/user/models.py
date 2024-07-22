from django.db import models
from django.contrib.auth.models import AbstractUser
from main.models import OrderTaxi
from datetime import datetime

class User(AbstractUser):
    taxi = models.BooleanField(null=True, blank=True)
    is_job = models.BooleanField(null=True, blank=True)
    
    latitude = models.FloatField(null=True, blank=True) 
    longitude = models.FloatField(null=True, blank=True)
    number = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=255, null=True, blank=True)
    avatar = models.ImageField(upload_to="avatar", default="../media/avatar/default.png")
    rating = models.IntegerField(null=True, blank=True)
    
    is_order_progress = models.OneToOneField(OrderTaxi, verbose_name="is_order_progress", on_delete=models.SET_NULL, related_name='is_order_progress', null=True, blank=True)
    
    money_orders = models.IntegerField(null=True, blank=True)
    money_taxi = models.IntegerField(null=True, blank=True)
    
    transactions = models.ManyToManyField("Transactions", verbose_name='transactions', blank=True)
    
    sound_taxi = models.CharField(max_length=50, default='../media/taxi/order.mp')
    sound_order = models.CharField(max_length=50, default='../media/taxi/order.mp')
    
    online = models.BooleanField(default=False)
    
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='user_groups',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='user_permissions',
        blank=True
    )
    
    def __str__(self):
        return str(self.id)

class Transactions(models.Model):
    name = models.CharField(max_length=50)
    money = models.IntegerField()
    
    types = models.BooleanField(null=True)
    
    date = models.DateTimeField(default=datetime.now)