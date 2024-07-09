from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'largecategory', views.LargeCategoryViewSet)
urlpatterns = [
    path('', include(router.urls)),
    path('tables/', views.get_table_list, name='get_table_list'), # name 은 역참조나 템플릿에서 참조시 사용할 수 있다. 
    path('layers/',views.get_layers,name='get_layers')
]

# from .views import get_table_list