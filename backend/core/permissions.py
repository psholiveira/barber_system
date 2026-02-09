from rest_framework.permissions import BasePermission

def get_role(user) -> str:
    if not user or not user.is_authenticated:
        return ""
    if hasattr(user, "profile"):
        return user.profile.role
    return ""

class IsManagerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        role = get_role(request.user)
        return role in ("MANAGER", "ADMIN")

class IsOwnerOrManagerAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        role = get_role(request.user)
        if role in ("MANAGER", "ADMIN"):
            return True
        return getattr(obj, "barber_id", None) == request.user.id
