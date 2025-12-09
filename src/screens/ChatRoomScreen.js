import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { getUsername, removeUsername } from '../utils/storage';
import {
  sendMessage,
  sendImageMessage,
  subscribeToMessages,
  uploadImage,
} from '../services/firebaseService';
import { CommonActions } from '@react-navigation/native';

const ChatRoomScreen = ({ navigation }) => {
  const [currentUsername, setCurrentUsername] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [uploading, setUploading] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadUsername();
    const unsubscribe = subscribeToMessages(newMessages => {
      setMessages(newMessages);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => unsubscribe();
  }, []);

  const loadUsername = async () => {
    const username = await getUsername();
    if (username) {
      setCurrentUsername(username);
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === '') {
      return;
    }

    const success = await sendMessage(currentUsername, inputText.trim());
    if (success) {
      setInputText('');
    } else {
      Alert.alert('Error', 'Gagal mengirim pesan');
    }
  };

  const handleImagePick = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert('Error', 'Gagal memilih gambar');
        return;
      }

      if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        setUploading(true);

        const imageUrl = await uploadImage(imageUri, currentUsername);

        if (imageUrl) {
          const success = await sendImageMessage(currentUsername, imageUrl);
          if (!success) {
            Alert.alert('Error', 'Gagal mengirim gambar');
          }
        } else {
          Alert.alert('Error', 'Gagal upload gambar');
        }

        setUploading(false);
      }
    });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await removeUsername();
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            }),
          );
        },
      },
    ]);
  };

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.username === currentUsername;

    return (
      <View
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        {!isOwnMessage && <Text style={styles.username}>{item.username}</Text>}

        {item.type === 'image' ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.messageImage}
            resizeMode="cover"
          />
        ) : (
          <Text
            style={[styles.messageText, isOwnMessage && styles.ownMessageText]}
          >
            {item.text}
          </Text>
        )}

        <Text style={[styles.timestamp, isOwnMessage && styles.ownTimestamp]}>
          {item.createdAt.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Chat Room</Text>
          <Text style={styles.headerSubtitle}>Halo, {currentUsername}!</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Keluar</Text>
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Uploading Indicator */}
      {uploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color="#4A90E2" />
          <Text style={styles.uploadingText}>Mengirim gambar...</Text>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.imageButton}
          onPress={handleImagePick}
          disabled={uploading}
        >
          <Text style={styles.imageButtonText}>📷</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={uploading}
        >
          <Text style={styles.sendButtonText}>Kirim</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  messagesList: {
    padding: 15,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4A90E2',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  username: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  ownMessageText: {
    color: 'white',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 5,
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownTimestamp: {
    color: 'rgba(255,255,255,0.8)',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#e3f2fd',
  },
  uploadingText: {
    marginLeft: 10,
    color: '#4A90E2',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  imageButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginRight: 10,
  },
  imageButtonText: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatRoomScreen;
