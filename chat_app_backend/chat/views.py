from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer

User = get_user_model()

@api_view(['GET'])
def get_users(request):
    users = User.objects.exclude(id=request.user.id)
    from chat_authentication.serializers import UserSerializer
    return Response(UserSerializer(users, many=True).data)

@api_view(['POST'])
def create_or_get_room(request):
    other_user_id = request.data.get('user_id')
    try:
        other_user = User.objects.get(id=other_user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if room already exists between these two users
    room = ChatRoom.objects.filter(participants=request.user).filter(participants=other_user).first()
    
    if not room:
        room_name = f"chat_{min(request.user.id, other_user.id)}_{max(request.user.id, other_user.id)}"
        room = ChatRoom.objects.create(name=room_name)
        room.participants.add(request.user, other_user)
    
    return Response(ChatRoomSerializer(room).data)

@api_view(['GET'])
def get_messages(request, room_id):
    try:
        room = ChatRoom.objects.get(id=room_id, participants=request.user)
        messages = room.messages.all()
        return Response(MessageSerializer(messages, many=True).data)
    except ChatRoom.DoesNotExist:
        return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)