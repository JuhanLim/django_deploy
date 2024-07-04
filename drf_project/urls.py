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
from rest_framework.routers import DefaultRouter
from .views import LargeCategoryViewSet

router = DefaultRouter()
router.register(r'largecategory', LargeCategoryViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("hello/", HelloView.as_view(), name="hello"),
    path("api/tables/", include(router.urls)),
    path("api/", include(covermap.urls)),
]

# @admin.register(Location)
# class LocationAdmin(admin.OSMGeoAdmin):
#     list_display = ('name','point')
