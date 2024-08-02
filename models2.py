# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.contrib.gis.db import models


class Yongdamcadastraltarget(models.Model):
    gid = models.AutoField(primary_key=True)
    pnu = models.CharField(max_length=19, blank=True, null=True)
    jibun = models.CharField(max_length=16, blank=True, null=True)
    bchk = models.CharField(max_length=1, blank=True, null=True)
    sgg_oid = models.CharField(max_length=254, blank=True, null=True)
    col_adm_se = models.CharField(max_length=5, blank=True, null=True)
    layer = models.CharField(max_length=254, blank=True, null=True)
    path = models.CharField(max_length=254, blank=True, null=True)
    geom = models.MultiPolygonField(srid=0, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'yongdamcadastraltarget'

from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Yongdamcadastralall
from .serializers import YongdamcadastralallSerializer

class YongdamcadastralallViewSet(viewsets.ModelViewSet):
    queryset = Yongdamcadastralall.objects.all()
    serializer_class = YongdamcadastralallSerializer

    def create(self, request, *args, **kwargs):
        if isinstance(request.data, list):
            # 여러 데이터가 포함된 리스트인 경우
            serializer = self.get_serializer(data=request.data, many=True)
        else:
            # 단일 데이터인 경우
            serializer = self.get_serializer(data=request.data)
        
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        if isinstance(request.data, list):
            # 여러 데이터를 생성한 경우, 각 레코드의 상세 정보로 응답
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # 단일 데이터를 생성한 경우, 상세 정보로 응답
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

