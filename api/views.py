from rest_framework import status, generics, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from .models import User, Account, Category, Transaction
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer, AccountSerializer, CategorySerializer, TransactionSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer

    @extend_schema(
        summary="Register a new user",
        description="Create a new user account with name, email, and password",
        request=UserRegistrationSerializer,
        responses={
            201: UserSerializer,
            400: {"type": "object", "properties": {"error": {"type": "string"}}}
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'user': UserSerializer(user).data,
                'message': 'User created successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    permission_classes = (AllowAny,)
    serializer_class = UserLoginSerializer

    @extend_schema(
        summary="Login user",
        description="Authenticate user and return JWT tokens",
        request={
            "type": "object",
            "properties": {
                "email": {"type": "string", "format": "email"},
                "password": {"type": "string", "format": "password"}
            },
            "required": ["email", "password"]
        },
        responses={
            200: {
                "type": "object",
                "properties": {
                    "refresh": {"type": "string"},
                    "access": {"type": "string"},
                    "user": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "integer"},
                            "name": {"type": "string"},
                            "email": {"type": "string"}
                        }
                    }
                }
            },
            401: {"type": "object", "properties": {"detail": {"type": "string"}}}
        }
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class UserProfileView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        summary="Get user profile",
        description="Get the authenticated user's profile information",
        responses={
            200: UserSerializer,
            401: {"type": "object", "properties": {"detail": {"type": "string"}}}
        }
    )
    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        summary="Logout user",
        description="Logout the authenticated user (client-side token removal)",
        responses={
            200: {"type": "object", "properties": {"message": {"type": "string"}}}
        }
    )
    def post(self, request):
        return Response({'message': 'Successfully logged out'})


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
