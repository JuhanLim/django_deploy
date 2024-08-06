"""
URL configuration for drf_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from my_app.views import HelloView
#from covermap.views import get_table_list 
# from rest_framework.routers import DefaultRouter
# from covermap.views import LargeCategoryViewSet # 여기서 app 의 view 를 가져와야하는데 안그래서 오류남  

# router = DefaultRouter()
# router.register(r'largecategory', LargeCategoryViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("hello/", HelloView.as_view(), name="hello"),
    path("api/covermap/", include('covermap.urls')),
    path("api/yongdam/", include('yongdam.urls')),
    #path("tables/", get_table_list.as_view(), name="get_table_list"),
    # path("", include(router.urls)),

]

# @admin.register(Location)
# class LocationAdmin(admin.OSMGeoAdmin):
#     list_display = ('name','point')
