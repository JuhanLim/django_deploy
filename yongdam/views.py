from rest_framework import viewsets
from .models import Yongdamcadastralall
from .serializers import YongdamcadastralallSerializer
from django.conf import settings

class YongdamcadastralallViewSet(viewsets.ModelViewSet):
    queryset = Yongdamcadastralall.objects.all()
    serializer_class = YongdamcadastralallSerializer
