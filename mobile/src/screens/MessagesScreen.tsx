import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  RefreshControl,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Sample data
const CONVERSATIONS = [
  {
    id: 1,
    type: 'activity',
    activityId: 1,
    activityTitle: 'Morning Yoga in the Park',
    lastMessage: {
      senderId: 5,
      senderName: 'Jane Smith',
      content: 'What time should we meet tomorrow?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      isRead: false
    },
    unreadCount: 3,
    participants: 5
  },
  {
    id: 2,
    type: 'activity',
    activityId: 3,
    activityTitle: 'Board Games Night',
    lastMessage: {
      senderId: 1, // current user
      senderName: 'You',
      content: 'I\'ll bring Catan and some snacks',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isRead: true
    },
    unreadCount: 0,
    participants: 12
  },
  {
    id: 3,
    type: 'direct',
    userId: 5,
    userName: 'Jane Smith',
    avatarUrl: 'https://via.placeholder.com/50',
    lastMessage: {
      senderId: 1, // current user
      senderName: 'You',
      content: 'See you at the coffee shop!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isRead: true
    },
    unreadCount: 0,
    online: true
  },
  {
    id: 4,
    type: 'direct',
    userId: 8,
    userName: 'Mike Johnson',
    avatarUrl: 'https://via.placeholder.com/50',
    lastMessage: {
      senderId: 8,
      senderName: 'Mike Johnson',
      content: 'Thanks for joining my hiking group!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      isRead: true
    },
    unreadCount: 0,
    online: false
  },
];

const formatMessageTime = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

const ConversationItem = ({ conversation, onPress, isDark }) => {
  const isActivity = conversation.type === 'activity';
  const isUnread = conversation.unreadCount > 0;
  
  return (
    <TouchableOpacity 
      style={[
        styles.conversationItem, 
        isDark && styles.conversationItemDark,
        isUnread && styles.unreadItem,
        isUnread && isDark && styles.unreadItemDark
      ]} 
      onPress={() => onPress(conversation)}
    >
      {isActivity ? (
        <View style={[styles.groupAvatar, isDark && styles.groupAvatarDark]}>
          <Ionicons name="people" size={24} color={isDark ? "#3b82f6" : "#3b82f6"} />
        </View>
      ) : (
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle-outline" size={50} color={isDark ? "#ccc" : "#666"} />
          {conversation.online && <View style={styles.onlineIndicator} />}
        </View>
      )}
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[
            styles.conversationName, 
            isDark && styles.textDark,
            isUnread && styles.unreadText
          ]} numberOfLines={1}>
            {isActivity ? conversation.activityTitle : conversation.userName}
          </Text>
          <Text style={[styles.conversationTime, isDark && styles.textLightDark]}>
            {formatMessageTime(conversation.lastMessage.timestamp)}
          </Text>
        </View>
        
        {isActivity && (
          <View style={styles.participantsInfo}>
            <Ionicons name="people-outline" size={12} color={isDark ? "#999" : "#666"} />
            <Text style={[styles.participantsText, isDark && styles.textLightDark]}>
              {conversation.participants} participants
            </Text>
          </View>
        )}
        
        <View style={styles.messagePreview}>
          <Text 
            style={[
              styles.senderName, 
              isUnread && styles.unreadText,
              isDark && styles.textDark
            ]}
            numberOfLines={1}
          >
            {conversation.lastMessage.senderName === 'You' ? '' : `${conversation.lastMessage.senderName}: `}
          </Text>
          <Text 
            style={[
              styles.messageText, 
              isUnread && styles.unreadText,
              isDark && (isUnread ? styles.unreadText : styles.textLightDark)
            ]}
            numberOfLines={1}
          >
            {conversation.lastMessage.content}
          </Text>
        </View>
        
        {isUnread && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{conversation.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const MessagesScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setConversations(CONVERSATIONS);
      setLoading(false);
    }, 1000);
  }, []);
  
  const handleConversationPress = (conversation) => {
    if (conversation.type === 'activity') {
      navigation.navigate('Chat', { 
        activityId: conversation.activityId,
        title: conversation.activityTitle
      });
    } else {
      navigation.navigate('Chat', { 
        userId: conversation.userId,
        title: conversation.userName
      });
    }
    
    // Mark as read
    const updatedConversations = conversations.map(c => 
      c.id === conversation.id 
        ? { ...c, unreadCount: 0, lastMessage: { ...c.lastMessage, isRead: true } }
        : c
    );
    setConversations(updatedConversations);
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setConversations(CONVERSATIONS);
      setRefreshing(false);
    }, 1000);
  };
  
  const filteredConversations = conversations.filter(conversation => {
    // Filter by tab
    if (activeTab === 'activities' && conversation.type !== 'activity') return false;
    if (activeTab === 'direct' && conversation.type !== 'direct') return false;
    
    // Filter by search query
    if (searchQuery) {
      const name = conversation.type === 'activity' 
        ? conversation.activityTitle.toLowerCase() 
        : conversation.userName.toLowerCase();
      return name.includes(searchQuery.toLowerCase());
    }
    
    return true;
  });
  
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
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Messages</Text>
        <TouchableOpacity style={styles.newMessageButton}>
          <Ionicons name="create-outline" size={24} color={isDark ? "#fff" : "#333"} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
        <Ionicons name="search-outline" size={20} color={isDark ? "#999" : "#999"} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, isDark && styles.searchInputDark]}
          placeholder="Search conversations"
          placeholderTextColor={isDark ? "#999" : "#999"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={isDark ? "#999" : "#999"} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]} 
          onPress={() => setActiveTab('all')}
        >
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'all' && styles.activeTabText,
              isDark && styles.textDark,
              activeTab === 'all' && isDark && { color: '#3b82f6' }
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'activities' && styles.activeTab]} 
          onPress={() => setActiveTab('activities')}
        >
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'activities' && styles.activeTabText,
              isDark && styles.textDark,
              activeTab === 'activities' && isDark && { color: '#3b82f6' }
            ]}
          >
            Activities
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'direct' && styles.activeTab]} 
          onPress={() => setActiveTab('direct')}
        >
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'direct' && styles.activeTabText,
              isDark && styles.textDark,
              activeTab === 'direct' && isDark && { color: '#3b82f6' }
            ]}
          >
            Direct
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {filteredConversations.length > 0 ? (
          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ConversationItem 
                conversation={item} 
                onPress={handleConversationPress}
                isDark={isDark}
              />
            )}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                tintColor={isDark ? "#fff" : "#3b82f6"}
              />
            }
            contentContainerStyle={styles.conversationsList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={isDark ? "#555" : "#ccc"} />
            <Text style={[styles.emptyStateTitle, isDark && styles.textDark]}>No messages yet</Text>
            <Text style={[styles.emptyStateText, isDark && styles.textLightDark]}>
              {searchQuery 
                ? "No conversations match your search" 
                : "Start a conversation by joining an activity or messaging another user"}
            </Text>
          </View>
        )}
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  newMessageButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
  },
  searchContainerDark: {
    backgroundColor: '#222',
    borderColor: '#444',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  searchInputDark: {
    color: '#fff',
  },
  clearButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#EBF5FF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  conversationsList: {
    paddingHorizontal: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  conversationItemDark: {
    backgroundColor: '#222',
    shadowOpacity: 0.2,
  },
  unreadItem: {
    backgroundColor: '#EBF8FF',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  unreadItemDark: {
    backgroundColor: '#0d2545',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupAvatarDark: {
    backgroundColor: '#1a365d',
  },
  conversationContent: {
    flex: 1,
    position: 'relative',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  conversationTime: {
    fontSize: 12,
    color: '#999',
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  messagePreview: {
    flexDirection: 'row',
    flex: 1,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unreadText: {
    fontWeight: '600',
    color: '#333',
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default MessagesScreen;