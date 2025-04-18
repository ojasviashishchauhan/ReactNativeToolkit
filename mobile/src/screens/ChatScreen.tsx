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
  Keyboard,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Sample data for an activity chat
const ACTIVITY_MESSAGES = [
  {
    id: 1,
    content: 'Welcome to Morning Yoga in the Park chat! We\'ll be meeting at 7:30 AM by the main entrance.',
    senderId: 101, // host
    senderName: 'Sarah Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    isHost: true
  },
  {
    id: 2,
    content: 'Hi everyone! Looking forward to the session. Should I bring my own yoga mat?',
    senderId: 2,
    senderName: 'John Doe',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 30), // 30 mins later
  },
  {
    id: 3,
    content: 'Yes, please bring your own mat and water bottle. I\'ll have some extra props for everyone to use.',
    senderId: 101,
    senderName: 'Sarah Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 35), // 5 mins later
    isHost: true
  },
  {
    id: 4,
    content: 'Hi all, what kind of yoga will we be doing? Is it suitable for beginners?',
    senderId: 3,
    senderName: 'Alice Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: 5,
    content: 'We\'ll focus on gentle vinyasa flow and some basic poses. It\'s definitely suitable for beginners, but there will be variations for those who want more challenge.',
    senderId: 101,
    senderName: 'Sarah Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 5), // 5 mins later
    isHost: true
  },
  {
    id: 6,
    content: 'Perfect! I\'m new to yoga, so that sounds great for me.',
    senderId: 3,
    senderName: 'Alice Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 10), // 5 mins later
  },
  {
    id: 7,
    content: 'Weather forecast says it might rain. Do we have a backup plan?',
    senderId: 4,
    senderName: 'Bob Brown',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
  },
  {
    id: 8,
    content: 'Good point! If it rains, we\'ll move to the covered pavilion just north of the main entrance. I\'ll send updates here if we need to change plans.',
    senderId: 101,
    senderName: 'Sarah Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isHost: true
  },
  {
    id: 9,
    content: 'I\'ll be running a few minutes late tomorrow, but should be there by 7:45. Sorry in advance!',
    senderId: 1, // current user
    senderName: 'You',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    isCurrentUser: true
  },
  {
    id: 10,
    content: 'No problem! We\'ll wait for you. The actual session will start around 7:45-7:50 once everyone is settled.',
    senderId: 101,
    senderName: 'Sarah Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 mins ago
    isHost: true
  }
];

// Sample data for direct messages
const DIRECT_MESSAGES = [
  {
    id: 1,
    content: 'Hi there! I saw you\'re participating in the yoga session tomorrow.',
    senderId: 5,
    senderName: 'Jane Smith',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
  {
    id: 2,
    content: 'Yes, I\'m really looking forward to it! Will you be there too?',
    senderId: 1, // current user
    senderName: 'You',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    isCurrentUser: true
  },
  {
    id: 3,
    content: 'Definitely! I try to go every week. It\'s a great way to start the day.',
    senderId: 5,
    senderName: 'Jane Smith',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4 + 1000 * 60 * 5), // 5 mins later
  },
  {
    id: 4,
    content: 'Do you know if there\'s a coffee shop nearby? I was thinking we could grab coffee after.',
    senderId: 1, // current user
    senderName: 'You',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    isCurrentUser: true
  },
  {
    id: 5,
    content: 'There\'s a great little place just a block away called Morning Brew. They have amazing pastries too!',
    senderId: 5,
    senderName: 'Jane Smith',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
  },
  {
    id: 6,
    content: 'Perfect! Let\'s plan to head there after class. I\'ll need the caffeine!',
    senderId: 1, // current user
    senderName: 'You',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    isCurrentUser: true
  },
];

// Format timestamp
const formatMessageTime = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffDays > 0) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + 
           date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } else if (diffHours > 0) {
    return diffHours + 'h ago';
  } else if (diffMins > 0) {
    return diffMins + 'm ago';
  } else {
    return 'Just now';
  }
};

// Message component
const MessageItem = ({ message, isDark, showSender = true }) => {
  const isCurrentUser = message.isCurrentUser;
  
  return (
    <View style={[
      styles.messageContainer,
      isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
      isCurrentUser && isDark && styles.currentUserMessageDark,
      !isCurrentUser && isDark && styles.otherUserMessageDark
    ]}>
      {!isCurrentUser && showSender && (
        <View style={styles.senderInfo}>
          <Ionicons 
            name="person-circle-outline" 
            size={16} 
            color={isDark ? "#ccc" : "#666"} 
            style={styles.senderAvatar}
          />
          <Text style={[
            styles.senderName, 
            message.isHost && styles.hostName,
            isDark && styles.textLightDark
          ]}>
            {message.senderName}
            {message.isHost && ' (Host)'}
          </Text>
        </View>
      )}
      
      <Text style={[
        styles.messageContent,
        isDark && styles.textDark
      ]}>
        {message.content}
      </Text>
      
      <Text style={[styles.messageTime, isDark && styles.textLightDark]}>
        {formatMessageTime(message.timestamp)}
      </Text>
    </View>
  );
};

// Date separator component
const DateSeparator = ({ date, isDark }) => {
  const formatDate = (date) => {
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };
  
  return (
    <View style={styles.dateSeparator}>
      <View style={[styles.dateLine, isDark && { backgroundColor: '#444' }]} />
      <Text style={[styles.dateText, isDark && styles.textLightDark]}>
        {formatDate(date)}
      </Text>
      <View style={[styles.dateLine, isDark && { backgroundColor: '#444' }]} />
    </View>
  );
};

const ChatScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const route = useRoute();
  const navigation = useNavigation();
  const { activityId, userId, title } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  
  const flatListRef = useRef(null);
  const isActivity = !!activityId;
  
  useEffect(() => {
    // Set header title
    navigation.setOptions({
      title: title || (isActivity ? 'Activity Chat' : 'Chat'),
      headerRight: isActivity ? () => (
        <TouchableOpacity 
          style={styles.participantsButton}
          onPress={() => setShowParticipants(!showParticipants)}
        >
          <Ionicons 
            name="people-outline" 
            size={24} 
            color={isDark ? "#fff" : "#333"} 
          />
          <View style={styles.participantsBadge}>
            <Text style={styles.participantsBadgeText}>5</Text>
          </View>
        </TouchableOpacity>
      ) : null
    });
    
    // Simulate API call to fetch messages
    setTimeout(() => {
      if (isActivity) {
        setMessages(ACTIVITY_MESSAGES);
        // Simulate fetching participants for activity chat
        setParticipants([
          { id: 1, name: 'You' },
          { id: 101, name: 'Sarah Johnson (Host)' },
          { id: 2, name: 'John Doe' },
          { id: 3, name: 'Alice Johnson' },
          { id: 4, name: 'Bob Brown' }
        ]);
      } else {
        setMessages(DIRECT_MESSAGES);
      }
      setLoading(false);
    }, 1000);
  }, [navigation, isActivity, title, isDark]);
  
  // Group messages by date
  const processedMessages = messages.reduce((acc, message) => {
    const messageDate = new Date(message.timestamp);
    messageDate.setHours(0, 0, 0, 0);
    
    const dateString = messageDate.toISOString();
    
    if (!acc[dateString]) {
      acc[dateString] = {
        date: messageDate,
        messages: []
      };
    }
    
    acc[dateString].messages.push(message);
    return acc;
  }, {});
  
  // Convert to array and sort by date
  const groupedMessages = Object.values(processedMessages).sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );
  
  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    
    // Simulate sending a message
    setTimeout(() => {
      const newMsg = {
        id: messages.length + 1,
        content: newMessage.trim(),
        senderId: 1, // current user id
        senderName: 'You',
        timestamp: new Date(),
        isCurrentUser: true
      };
      
      setMessages([...messages, newMsg]);
      setNewMessage('');
      setSending(false);
      
      // Scroll to bottom after sending
      if (flatListRef.current) {
        setTimeout(() => {
          flatListRef.current.scrollToEnd({ animated: true });
        }, 100);
      }
    }, 500);
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={[styles.loadingText, isDark && styles.textDark]}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {showParticipants && (
          <View style={[styles.participantsPanel, isDark && styles.participantsPanelDark]}>
            <View style={styles.participantsPanelHeader}>
              <Text style={[styles.participantsPanelTitle, isDark && styles.textDark]}>
                Participants ({participants.length})
              </Text>
              <TouchableOpacity onPress={() => setShowParticipants(false)}>
                <Ionicons name="close" size={24} color={isDark ? "#fff" : "#333"} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={participants}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={[styles.participantItem, isDark && { borderBottomColor: '#444' }]}>
                  <Ionicons name="person-circle-outline" size={36} color={isDark ? "#ccc" : "#666"} />
                  <Text style={[styles.participantName, isDark && styles.textDark]}>
                    {item.name}
                  </Text>
                </View>
              )}
            />
          </View>
        )}
        
        <FlatList
          ref={flatListRef}
          style={styles.messagesList}
          data={groupedMessages}
          keyExtractor={(item) => item.date.toISOString()}
          renderItem={({ item }) => (
            <View>
              <DateSeparator date={item.date} isDark={isDark} />
              {item.messages.map((message, index) => {
                // Determine whether to show sender info based on consecutive messages
                const showSender = index === 0 || 
                  item.messages[index - 1].senderId !== message.senderId || 
                  (message.timestamp - item.messages[index - 1].timestamp > 1000 * 60 * 5); // 5 minutes gap
                
                return (
                  <MessageItem 
                    key={message.id} 
                    message={message} 
                    showSender={showSender && !message.isCurrentUser}
                    isDark={isDark}
                  />
                );
              })}
            </View>
          )}
          onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current.scrollToEnd({ animated: false })}
          contentContainerStyle={styles.messagesListContent}
        />
        
        <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder="Type a message..."
            placeholderTextColor={isDark ? "#999" : "#999"}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxHeight={100}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
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
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  keyboardAvoid: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  textDark: {
    color: '#fff',
  },
  textLightDark: {
    color: '#ccc',
  },
  participantsButton: {
    position: 'relative',
    padding: 8,
  },
  participantsBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantsBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  participantsPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '70%',
    backgroundColor: '#fff',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  participantsPanelDark: {
    backgroundColor: '#222',
  },
  participantsPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  participantsPanelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  participantName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  messagesList: {
    flex: 1,
  },
  messagesListContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 8,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#EBF5FF',
    borderBottomRightRadius: 0,
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f5',
    borderBottomLeftRadius: 0,
  },
  currentUserMessageDark: {
    backgroundColor: '#0d2545',
  },
  otherUserMessageDark: {
    backgroundColor: '#333',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderAvatar: {
    marginRight: 4,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  hostName: {
    color: '#3b82f6',
  },
  messageContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  inputContainerDark: {
    backgroundColor: '#222',
    borderTopColor: '#444',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 16,
    maxHeight: 100,
    color: '#333',
  },
  inputDark: {
    backgroundColor: '#333',
    color: '#fff',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#c5d5eb',
  },
});

export default ChatScreen;