from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework import permissions

urlpatterns = [
    path('admin/', admin.site.urls),

    # Include app APIs
    path('api/', include('api.urls')),

    # API Schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),

    # Swagger documentation
    path('swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

