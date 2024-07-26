# # Create your models here.
# from django.contrib.gis.db import models


# class Yongdamcadastralall(models.Model):
#     gid = models.AutoField(primary_key=True)
#     pnu = models.CharField(max_length=19, blank=True, null=True)
#     jibun = models.CharField(max_length=16, blank=True, null=True)
#     bchk = models.CharField(max_length=1, blank=True, null=True)
#     sgg_oid = models.FloatField(blank=True, null=True)
#     col_adm_se = models.CharField(max_length=5, blank=True, null=True)
#     layer = models.CharField(max_length=254, blank=True, null=True)
#     path = models.CharField(max_length=254, blank=True, null=True)
#     geom = models.MultiPolygonField(srid=0, blank=True, null=True)

#     class Meta:
#         app_label = 'yongdam'
#         managed = False
#         db_table = 'yongdamcadastralall'
