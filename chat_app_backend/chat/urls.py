from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.get_users, name='get_users'),
    path('room/', views.create_or_get_room, name='create_or_get_room'),
    path('messages/<int:room_id>/', views.get_messages, name='get_messages'),
]