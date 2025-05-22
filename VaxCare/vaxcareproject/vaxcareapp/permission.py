from rest_framework import permissions


# chứng thực admin
class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        user_role = request.user.role

        return user_role == 'Admin'


class IsStaffRole(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        user_role = request.user.role

        return user_role == 'Staff'

class IsCitizenRole(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        user_role = request.user.role

        return user_role == 'Citizen'