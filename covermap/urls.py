from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
# from .views import get_table_list
# from covermap.views import LargeCategoryViewSet # 여기서 app 의 view 를 가져와야하는데 안그래서 오류남  

router = DefaultRouter()
router.register(r'largecategory', views.LargeCategoryViewSet)
urlpatterns = [
    path('', include(router.urls)),
]