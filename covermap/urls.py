from django.urls import path
from .views import get_table_list

urlpatterns = [
    path('tables/', get_table_list, name='get_table_list'),  # 세부 경로를 앱 레벨에서 정의
]