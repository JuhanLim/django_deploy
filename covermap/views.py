from rest_framework import viewsets
from .models import LargeCategory
from .serializers import LargeCategorySerializer

class LargeCategoryViewSet(viewsets.ModelViewSet):
    queryset = LargeCategory.objects.all()
    serializer_class = LargeCategorySerializer


# # -- 
# # k_water 데이터베이스의 테이블목록을 가져오기 위한 view ( 모델 정의 필요없음)
# from django.http import JsonResponse
# from django.db import connection

# def get_table_list(request): 
#     with connection.cursor() as cursor:
#         cursor.execute("""
#             SELECT table_name 
#             FROM information_schema.tables 
#             WHERE table_schema = 'public'
#         """)
#         tables = cursor.fetchall()
        
#     table_list = [table[0] for table in tables]
#     return JsonResponse({'tables': table_list})

# ----- 