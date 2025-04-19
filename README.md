# LocalLLMApp - Run AI Models Locally on Your Android Device
LocalLLMApp is a lightweight mobile application for running large language models (LLMs) directly on your Android device. It provides a simple interface for selecting, loading, and chatting with AI models without requiring internet connectivity.

## Project Structure
```
LocalLLMApp/
├── assets/            # Static assets used in the app
│   └── jniLibs/       # Native libraries for different architectures
├── plugins/           # Expo plugins for native functionality
│   └── copyjni.plugin.js  # Plugin for copying JNI libraries
├── screens/           # UI screens for the application
│   ├── ChatScreen.js      # Interface for chatting with loaded model
│   ├── ModelScreen.js     # Screen for selecting models
│   └── ModelLoadingScreen.js  # Screen for loading models
├── state/             # State management
│   ├── LlamaState.js      # Core model execution state
│   └── ModelState.js      # State for model selection and management
├── utils/             # Utility functions
│   ├── FileUtils.js       # File system operations for models
│   └── Storage.js         # MMKV storage implementation
├── App.js             # Main application component
├── babel.config.js    # Babel configuration
├── app.json           # Expo configuration
└── metro.config.js    # Metro bundler configuration
```
## Core Components for Local AI Processing
1. LlamaState.js
This is the heart of the AI processing system:

- Creates and manages the native LLaMA context for model execution
- Handles model loading with progress tracking
- Processes text generation through the completion function
-Manages context window and token limitations
-Implements proper memory management through unload
```js
// Key operations:
load: async (model) => { ... }      // Loads a model into memory
completion: async (prompt, ...) => { ... }  // Generates text from prompt
unload: async () => { ... }         // Properly disposes of model resources
```

2. ModelScreen.js & ModelLoadingScreen.js
These screens handle model selection and loading:

- ModelScreen: Allows users to browse and select models
- ModelLoadingScreen: Displays loading progress and handles errors

3. FileUtils.js
Manages the file system operations needed for models:

- Creates necessary directories for model storage
- Handles model import/selection
- Manages file permissions and access

4. Storage.js
Implements persistent storage using MMKV:

- Safely stores model configurations
- Maintains state between app restarts
- Properly serializes data to prevent memory errors

## JNI Integration
The app uses `cui-llama.rn` native module with JNI bindings to interface with the underlying llama.cpp library. The `jniLibs` folder contains compiled libraries for different CPU architectures:

# License
See the LICENSE.md file for details.

arm64-v8a (most modern Android devices)
armeabi-v7a (older devices)
x86 and x86_64 (mostly emulators)
The `copyjni.plugin.js` ensures these native libraries are properly included in the APK.
