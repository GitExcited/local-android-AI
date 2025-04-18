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

    public LLMModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "LLMModule";
    }

    @ReactMethod
    public void init(String modelPath, Promise promise) {
        try {
            Log.i(TAG, "Mock initialization with model: " + modelPath);
            // Mock successful initialization
            modelInitialized = true;
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error in mock init", e);
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
            
            Log.i(TAG, "Getting mock predictions for: " + text);
            
            // Create mock predictions
            WritableArray result = Arguments.createArray();
            
            // Mock different predictions based on input text
            if (text.contains("hello")) {
                result.pushString("world");
                result.pushString("there");
                result.pushString("friend");
            } else if (text.contains("how")) {
                result.pushString("are");
                result.pushString("can");
                result.pushString("do");
            } else {
                result.pushString("the");
                result.pushString("a");
                result.pushString("is");
            }
            
            // Add generic predictions to fill the array
            String[] commonWords = {"and", "to", "of", "in", "for", "with", "on"};
            for (int i = result.size(); i < numPredictions && i < commonWords.length; i++) {
                result.pushString(commonWords[i]);
            }
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error in mock predictions", e);
            promise.reject("PREDICTION_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void cleanup(Promise promise) {
        try {
            Log.i(TAG, "Mock cleanup");
            modelInitialized = false;
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("CLEANUP_ERROR", e.getMessage());
        }
    }
}