from django.db import models

#Create your models here.
from django.contrib.gis.db import models


class LargeCategory(models.Model):
    name = models.CharField(unique=True, max_length=50)
    geom = models.PolygonField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'large_category'