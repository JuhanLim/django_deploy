from rest_framework import viewsets
from .models import LargeCategory
from .serializers import LargeCategorySerializer
from django.conf import settings

class LargeCategoryViewSet(viewsets.ModelViewSet):
    queryset = LargeCategory.objects.all()
    serializer_class = LargeCategorySerializer


# # -- 
# k_water 데이터베이스의 테이블목록을 가져오기 위한 view ( 모델 정의 필요없음)
from django.http import JsonResponse
from django.db import connection

def get_table_list(request): 
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name LIKE '%category'
        """)
        tables = cursor.fetchall()
        
    table_list = [table[0] for table in tables]
    return JsonResponse({'tables': table_list})

# ----- 

#---- GeoServer 
import requests
from requests.auth import HTTPBasicAuth

def get_layers(request): # 레이어 목록 가져오는 뷰 
    geoserver_url = 'http://175.45.204.163:8080/geoserver//rest/layers'
    response = requests.get(geoserver_url, 
                            auth=HTTPBasicAuth(settings.GEOSERVER_USER,
                                               settings.GEOSERVER_PASSWORD,
                                               ),
                            )
    
    if response.status_code == 200:
        return JsonResponse(response.json())
    else:
        return JsonResponse({'error': 'Failed to fetch layers'}, 
                            status=response.status_code,
                            )
    
    