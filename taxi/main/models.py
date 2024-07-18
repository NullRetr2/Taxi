from django.db import models
from datetime import datetime


class OrderTaxi(models.Model):
    user = models.IntegerField(null=True, blank=True)
    taxi_take = models.IntegerField(null=True, blank=True)

    start_latitude = models.FloatField(null=True, blank=True)
    start_longitude = models.FloatField(null=True, blank=True)
    end_latitude = models.FloatField(null=True, blank=True)
    end_longitude = models.FloatField(null=True, blank=True)

    tarif = models.CharField(max_length=50, null=True, blank=True)
    payment = models.CharField(max_length=50, null=True, blank=True)

    price = models.IntegerField(null=True, blank=True)

    progress = models.BooleanField(null=True, blank=True)

    date_time = models.DateTimeField(default=datetime.now)


class Tarif(models.Model):
    eco = models.IntegerField()
    comfort = models.IntegerField()
    business = models.IntegerField()


class Discont(models.Model):
    name = models.CharField(max_length=255)
    about = models.TextField()
    
    discont = models.IntegerField()
    
    start_date = models.DateField()
    end_date = models.DateField()
