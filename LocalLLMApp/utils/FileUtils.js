// utils/FileUtils.js
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

export const AppDirectory = {
  ModelPath: `${FileSystem.documentDirectory}models/`,
};

export const ensureDirectories = async () => {
  try {
    await FileSystem.makeDirectoryAsync(AppDirectory.ModelPath, { intermediates: true });
    console.log('App directories created');
    return true;
  } catch (error) {
    console.error('Failed to create directories:', error);
    return false;
  }
};

export const readableFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const importModelFile = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: false,
    });
    
    if (result.canceled) return null;
    
    const file = result.assets[0];
    if (!file.name.endsWith('.gguf') && !file.name.endsWith('.bin')) {
      console.error('File must be a GGUF or bin model file');
      return null;
    }
    
    return file;
  } catch (error) {
    console.error('Error importing model:', error);
    return null;
  }
};