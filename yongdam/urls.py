from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'cadastralall', views.YongdamcadastralallViewSet)
router.register(r'cadastraltarget', views.YongdamcadastraltargetViewSet)
urlpatterns = [
    path('', include(router.urls)),
    path('all-jobs/',views.api_v2_get_all_jobs,name='v2_get_all_jobs'),
]

