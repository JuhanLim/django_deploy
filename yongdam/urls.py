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
    path('get-coordinate/<str:job_id>/', views.get_coordinate, name='get_coordinate'),
    # path('get-xml/<str:job_id>/', views.get_xml, name='get_xml'),   
    # path('test/<str:job_id>/',views.test,name='test'),
]

