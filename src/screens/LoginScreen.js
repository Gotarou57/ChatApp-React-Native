import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { saveUsername } from '../utils/storage';
import { CommonActions } from '@react-navigation/native';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');

  const handleLogin = async () => {
    if (username.trim() === '') {
      Alert.alert('Error', 'Silakan masukkan nama Anda');
      return;
    }

    const success = await saveUsername(username.trim());
    if (success) {
      // Reset navigation stack dan navigasi ke ChatRoom
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'ChatRoom' }],
        }),
      );
    } else {
      Alert.alert('Error', 'Gagal menyimpan username');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>ChatApp</Text>
        <Text style={styles.subtitle}>Masukkan nama Anda untuk mulai chat</Text>

        <TextInput
          style={styles.input}
          placeholder="Nama Anda"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="words"
          maxLength={30}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Masuk</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
