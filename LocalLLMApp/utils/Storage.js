// utils/Storage.js
import { MMKV } from 'react-native-mmkv'
import { StateStorage } from 'zustand/middleware'

export const mmkv = new MMKV()

export const mmkvStorage = {
    setItem: (name, value) => {
        // THIS IS THE CRITICAL FIX - force value to be string
        if (typeof value !== 'string') {
            console.warn('MMKV: value is not a string, stringifying it')
            value = String(value)
        }
        return mmkv.set(name, value)
    },
    getItem: (name) => {
        const value = mmkv.getString(name)
        return value ?? null
    },
    removeItem: (name) => {
        return mmkv.delete(name)
    },
}