from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework import permissions

def home_redirect(request):
    return redirect('swagger-ui')

urlpatterns = [
    path('', home_redirect, name='home'),

    path('admin/', admin.site.urls),

    # Include app APIs
    path('api/', include('api.urls')),

    # API Schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),

    # Swagger documentation
    path('swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

