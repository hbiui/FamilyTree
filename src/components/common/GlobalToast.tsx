import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useApiStore } from '../../store/useApiStore';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ToastProps {
  id: string;
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
  retryAction?: () => void;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, message, retryAction, onClose }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      closeToast();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const closeToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }),
      Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }),
  ]).start(() => {
      onClose();
    });
  };

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return styles.successToast;
      case 'error':
        return styles.errorToast;
      case 'warning':
        return styles.warningToast;
      case 'info':
      default:
        return styles.infoToast;
    }
  };

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle-outline';
      case 'error':
        return 'alert-circle-outline';
      case 'warning':
        return 'warning-outline';
      case 'info':
      default:
        return 'information-circle-outline';
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Animated.View
        style={[
          styles.toastContainer,
          getToastStyle(),
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <View style={styles.toastContent}>
          <Ionicons
            name={getIconName()}
            size={24}
            color="white"
            style={styles.toastIcon}
          />
          <Text style={styles.toastText}>{message}</Text>
          
          {retryAction && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={retryAction}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>重试</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeToast}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export const GlobalToastContainer: React.FC = () => {
  const toasts = useApiStore((state) => state.toasts);
  const removeToast = useApiStore((state) => state.removeToast);

  return (
    <View style={styles.container}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          retryAction={toast.retryAction}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  successToast: {
    backgroundColor: '#10B981',
  },
  errorToast: {
    backgroundColor: Colors.primary,
  },
  warningToast: {
    backgroundColor: '#F59E0B',
  },
  infoToast: {
    backgroundColor: '#3B82F6',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastIcon: {
    marginRight: 12,
  },
  toastText: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  retryButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default Toast;
