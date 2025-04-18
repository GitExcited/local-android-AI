package com.yourcompany.textpredictorapp;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.Arguments;

import android.util.Log;

public class LLMModule extends ReactContextBaseJavaModule {
    private static final String TAG = "LLMModule";
    private boolean modelInitialized = false;
    
    // Load the native library when the class is loaded
    static {
        System.loadLibrary("llm_module");
    }

    public LLMModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "LLMModule";
    }
    
    // Native method declarations - these match the C++ functions
    private native boolean nativeInitializeModel(String modelPath);
    private native String[] nativeGetWordPredictions(String text, int numPredictions);
    private native void nativeCleanup();

    @ReactMethod
    public void init(String modelPath, Promise promise) {
        try {
            Log.i(TAG, "Initializing model: " + modelPath);
            // Call native method instead of mock
            boolean success = nativeInitializeModel(modelPath);
            modelInitialized = success;
            promise.resolve(success);
        } catch (Exception e) {
            Log.e(TAG, "Error initializing model", e);
            promise.reject("INIT_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getNextWordPredictions(String text, int numPredictions, Promise promise) {
        try {
            if (!modelInitialized) {
                promise.reject("NOT_INITIALIZED", "Model not initialized. Call init() first.");
                return;
            }
            
            Log.i(TAG, "Getting predictions for: " + text);
            // Call native method
            String[] predictions = nativeGetWordPredictions(text, numPredictions);
            
            if (predictions == null) {
                promise.reject("PREDICTION_FAILED", "Failed to get predictions");
                return;
            }
            
            WritableArray result = Arguments.createArray();
            for (String word : predictions) {
                result.pushString(word);
            }
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error getting predictions", e);
            promise.reject("PREDICTION_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void cleanup(Promise promise) {
        try {
            Log.i(TAG, "Cleaning up resources");
            // Call native method
            nativeCleanup();
            modelInitialized = false;
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("CLEANUP_ERROR", e.getMessage());
        }
    }
}