from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model

User = get_user_model()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware to authenticate WebSocket connections using JWT tokens.
    Token can be passed as query parameter: ?token=<jwt_token>
    """

    async def __call__(self, scope, receive, send):
        # Parse query string for token
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token')
        
        if token:
            token = token[0]  # Get first token from list
            try:
                # Validate JWT token
                access_token = AccessToken(token)
                user = await self.get_user_from_token(access_token)
                scope['user'] = user
            except (InvalidToken, TokenError, Exception) as e:
                # Invalid token, set anonymous user
                scope['user'] = AnonymousUser()
        else:
            # No token provided, set anonymous user
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user_from_token(self, token):
        """
        Get user from JWT token
        """
        try:
            user_id = token.payload.get('user_id')
            if user_id:
                user = User.objects.get(id=user_id)
                return user
        except User.DoesNotExist:
            pass
        return AnonymousUser()


def JWTAuthMiddlewareStack(inner):
    """
    Stack that includes JWT authentication middleware
    """
    return JWTAuthMiddleware(inner)