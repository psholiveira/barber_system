from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class MeView(APIView):
    """
    Retorna informações básicas do usuário logado.
    Usado pelo frontend para controlar permissões (sidebar).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, "profile", None)

        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "role": profile.role if profile else None,
        })
