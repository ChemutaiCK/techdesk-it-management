
from django.urls import path

from .views import (
    CurrentUserView,
    LoginView,
    TechnicianListView,
)

app_name = "accounts"

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("technicians/", TechnicianListView.as_view(), name="technicians"),
]