import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type Message = {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  isCurrentUser: boolean;
};

const ChatScreen = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const { colors, isDark } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  
  const { activityId } = route.params;
  const [loading, setLoading] = useState(true);
  const [activityTitle, setActivityTitle] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  
  useEffect(() => {
    fetchActivityDetails();
    fetchMessages();
    
    // In a real app, set up WebSocket connection here
    const interval = setInterval(() => {
      // Simulating new messages in real-time
      if (Math.random() > 0.7 && !loading) {
        const newMessage = generateRandomMessage();
        setMessages(prev => [...prev, newMessage]);
      }
    }, 10000);
    
    return () => {
      clearInterval(interval);
      // In a real app, close WebSocket connection here
    };
  }, [activityId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  const fetchActivityDetails = () => {
    // Simulating API call to fetch activity details
    setTimeout(() => {
      setActivityTitle('Morning Yoga in the Park');
    }, 1000);
  };
  
  const fetchMessages = () => {
    // Simulating API call to fetch messages
    setTimeout(() => {
      const mockMessages = [
        {
          id: 1,
          content: 'Hello everyone! Looking forward to our yoga session tomorrow!',
          senderId: 1,
          senderName: 'Alex Johnson',
          senderAvatar: 'https://source.unsplash.com/random/100x100/?portrait',
          timestamp: new Date(2023, 4, 14, 14, 30),
          isCurrentUser: true,
        },
        {
          id: 2,
          content: 'Hi Alex! I'm really excited to join. Is there anything specific we should bring?',
          senderId: 2,
          senderName: 'Jane Smith',
          senderAvatar: 'https://source.unsplash.com/random/100x100/?woman',
          timestamp: new Date(2023, 4, 14, 14, 45),
          isCurrentUser: false,
        },
        {
          id: 3,
          content: 'Please bring your own yoga mat and water bottle. I'll bring some extra mats just in case.',
          senderId: 1,
          senderName: 'Alex Johnson',
          senderAvatar: 'https://source.unsplash.com/random/100x100/?portrait',
          timestamp: new Date(2023, 4, 14, 15, 0),
          isCurrentUser: true,
        },
        {
          id: 4,
          content: 'Perfect, thanks for the info!',
          senderId: 2,
          senderName: 'Jane Smith',
          senderAvatar: 'https://source.unsplash.com/random/100x100/?woman',
          timestamp: new Date(2023, 4, 14, 15, 5),
          isCurrentUser: false,
        },
        {
          id: 5,
          content: 'This is my first yoga class, should I be worried about the difficulty level?',
          senderId: 3,
          senderName: 'Mike Wilson',
          senderAvatar: 'https://source.unsplash.com/random/100x100/?man',
          timestamp: new Date(2023, 4, 14, 16, 20),
          isCurrentUser: false,
        },
        {
          id: 6,
          content: 'Not at all! We'll be doing mostly beginner-friendly poses with options for more advanced practitioners.',
          senderId: 1,
          senderName: 'Alex Johnson',
          senderAvatar: 'https://source.unsplash.com/random/100x100/?portrait',
          timestamp: new Date(2023, 4, 14, 16, 30),
          isCurrentUser: true,
        },
        {
          id: 7,
          content: 'That sounds great! I'm looking forward to it!',
          senderId: 3,
          senderName: 'Mike Wilson',
          senderAvatar: 'https://source.unsplash.com/random/100x100/?man',
          timestamp: new Date(2023, 4, 14, 16, 35),
          isCurrentUser: false,
        },
      ];
      
      setMessages(mockMessages);
      setLoading(false);
    }, 1500);
  };
  
  const generateRandomMessage = () => {
    const randomMessages = [
      'Hey everyone! Looking forward to meeting you all!',
      'What's the weather forecast for tomorrow?',
      'Should we meet somewhere before heading to the park?',
      'Is there a coffee shop nearby where we can grab a drink after the session?',
      'I might be 5 minutes late, please wait for me!',
      'Has anyone done yoga in this park before?',
    ];
    
    const randomSenders = [
      {
        id: 2,
        name: 'Jane Smith',
        avatar: 'https://source.unsplash.com/random/100x100/?woman',
      },
      {
        id: 3,
        name: 'Mike Wilson',
        avatar: 'https://source.unsplash.com/random/100x100/?man',
      },
      {
        id: 4,
        name: 'Sarah Davis',
        avatar: 'https://source.unsplash.com/random/100x100/?girl',
      },
    ];
    
    const randomSender = randomSenders[Math.floor(Math.random() * randomSenders.length)];
    const randomContent = randomMessages[Math.floor(Math.random() * randomMessages.length)];
    
    return {
      id: Date.now(),
      content: randomContent,
      senderId: randomSender.id,
      senderName: randomSender.name,
      senderAvatar: randomSender.avatar,
      timestamp: new Date(),
      isCurrentUser: false,
    };
  };
  
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    setSending(true);
    
    // Simulating API call to send message
    setTimeout(() => {
      const newMessage = {
        id: Date.now(),
        content: messageText.trim(),
        senderId: 1, // Current user ID
        senderName: 'Alex Johnson', // Current user name
        senderAvatar: 'https://source.unsplash.com/random/100x100/?portrait',
        timestamp: new Date(),
        isCurrentUser: true,
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setMessageText('');
      setSending(false);
      
      // Scroll to the bottom
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 500);
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };
  
  const shouldShowDate = (message: Message, index: number) => {
    if (index === 0) return true;
    
    const previousMessage = messages[index - 1];
    const messageDate = new Date(message.timestamp);
    const previousMessageDate = new Date(previousMessage.timestamp);
    
    return messageDate.toDateString() !== previousMessageDate.toDateString();
  };
  
  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const showDate = shouldShowDate(item, index);
    
    return (
      <>
        {showDate && (
          <View style={styles.dateContainer}>
            <View style={[styles.dateLabel, { backgroundColor: colors.border }]}>
              <Text style={[styles.dateText, { color: colors.text }]}>
                {formatDate(item.timestamp)}
              </Text>
            </View>
          </View>
        )}
        
        <View 
          style={[
            styles.messageContainer,
            item.isCurrentUser ? styles.sentMessage : styles.receivedMessage,
          ]}
        >
          {!item.isCurrentUser && (
            <Image 
              source={{ uri: item.senderAvatar }} 
              style={styles.avatar} 
            />
          )}
          
          <View style={styles.messageContent}>
            {!item.isCurrentUser && (
              <Text style={[styles.senderName, { color: colors.text }]}>
                {item.senderName}
              </Text>
            )}
            
            <View 
              style={[
                styles.messageBubble,
                item.isCurrentUser 
                  ? [styles.sentBubble, { backgroundColor: colors.primary }]
                  : [styles.receivedBubble, { backgroundColor: isDark ? colors.cardLight : '#F0F0F0' }]
              ]}
            >
              <Text 
                style={[
                  styles.messageText,
                  { color: item.isCurrentUser ? 'white' : colors.text }
                ]}
              >
                {item.content}
              </Text>
              <Text 
                style={[
                  styles.timeText,
                  { color: item.isCurrentUser ? 'rgba(255, 255, 255, 0.7)' : colors.inactive }
                ]}
              >
                {formatTime(item.timestamp)}
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading chat...
        </Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.chatList}
        />
        
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: isDark ? colors.cardLight : '#F0F0F0',
                color: colors.text
              }
            ]}
            placeholder="Type a message..."
            placeholderTextColor={colors.inactive}
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton, 
              { backgroundColor: colors.primary },
              (!messageText.trim() || sending) && { opacity: 0.6 }
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  keyboardView: {
    flex: 1,
  },
  chatList: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  dateLabel: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageContent: {
    flexShrink: 1,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    marginLeft: 12,
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    minWidth: 80,
  },
  sentBubble: {
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default ChatScreen;