from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'cadastralall', views.YongdamcadastralallViewSet)
router.register(r'cadastraltarget', views.YongdamcadastraltargetViewSet)
urlpatterns = [
    path('', include(router.urls)),
    path('project-job/',views.api_v2_get_jobs,name='v2_get_filtered_jobs'),
    path('get-v2image/<str:job_id>/',views.api_get_v2_image,name='v2_get_image'),
]

