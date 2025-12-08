import AsyncStorage from '@react-native-async-storage/async-storage';

const USERNAME_KEY = 'username';

export const saveUsername = async username => {
  try {
    await AsyncStorage.setItem(USERNAME_KEY, username);
    return true;
  } catch (error) {
    console.error('Error saving username:', error);
    return false;
  }
};

export const getUsername = async () => {
  try {
    const username = await AsyncStorage.getItem(USERNAME_KEY);
    return username;
  } catch (error) {
    console.error('Error getting username:', error);
    return null;
  }
};

export const removeUsername = async () => {
  try {
    await AsyncStorage.removeItem(USERNAME_KEY);
    return true;
  } catch (error) {
    console.error('Error removing username:', error);
    return false;
  }
};
