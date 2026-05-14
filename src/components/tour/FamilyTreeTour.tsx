import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { useTourStore, TourStep, TOUR_STEPS } from '../../store/useTourStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TourStepConfig {
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'center';
  showSkip?: boolean;
  buttonText?: string;
}

const STEP_CONFIGS: Record<TourStep, TourStepConfig> = {
  welcome: {
    title: '👋 欢迎使用家族树',
    description: '让我带您快速了解如何使用这个应用，记录和探索您的家族故事。',
    position: 'center',
    showSkip: true,
    buttonText: '开始探索',
  },
  tap_member: {
    title: '查看成员详情',
    description: '点击任意成员卡片，您可以查看该成员的详细信息、编辑资料或添加事件。',
    position: 'bottom',
    showSkip: true,
    buttonText: '下一步',
  },
  long_press_add: {
    title: '添加新成员',
    description: '长按任意成员节点，您可以快速添加该成员的子女或配偶，完善您的家族树。',
    position: 'bottom',
    showSkip: false,
    buttonText: '我知道了',
  },
};

export function FamilyTreeTour() {
  const { isVisible, currentStep, nextStep, setTourCompleted, closeTour } = useTourStore();
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const startAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const resetAnimation = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
  }, [fadeAnim, slideAnim]);

  React.useEffect(() => {
    if (isVisible && currentStep) {
      startAnimation();
    }
  }, [isVisible, currentStep, startAnimation]);

  const handleNext = () => {
    resetAnimation();
    if (currentStep) {
      const currentIndex = TOUR_STEPS.indexOf(currentStep);
      if (currentIndex >= TOUR_STEPS.length - 1) {
        setTourCompleted();
      } else {
        nextStep();
      }
    }
  };

  const handleSkip = () => {
    setTourCompleted();
  };

  const handleOverlayPress = () => {
    // 点击蒙层跳过当前步骤
    resetAnimation();
    if (currentStep) {
      const currentIndex = TOUR_STEPS.indexOf(currentStep);
      if (currentIndex >= TOUR_STEPS.length - 1) {
        setTourCompleted();
      } else {
        nextStep();
      }
    }
  };

  if (!isVisible || !currentStep) {
    return null;
  }

  const config = STEP_CONFIGS[currentStep];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={closeTour}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={0.8}
        onPress={handleOverlayPress}
      />
      
      <Animated.View
        style={[
          styles.tourContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
          getPositionStyle(config.position),
        ]}
      >
        {/* 步骤指示器 */}
        <View style={styles.stepIndicatorContainer}>
          {TOUR_STEPS.map((step, index) => (
            <View
              key={step}
              style={[
                styles.stepDot,
                currentStep === step && styles.stepDotActive,
              ]}
            />
          ))}
        </View>

        {/* 内容区域 */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.description}>{config.description}</Text>
          
          {/* 按钮区域 */}
          <View style={styles.buttonContainer}>
            {config.showSkip && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>跳过</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.7}
            >
              <Text style={styles.nextButtonText}>{config.buttonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

function getPositionStyle(position: 'top' | 'bottom' | 'center') {
  switch (position) {
    case 'top':
      return styles.positionTop;
    case 'bottom':
      return styles.positionBottom;
    case 'center':
    default:
      return styles.positionCenter;
  }
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  tourContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  positionTop: {
    top: 100,
  },
  positionCenter: {
    top: SCREEN_HEIGHT / 2 - 150,
  },
  positionBottom: {
    bottom: 80,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  stepDotActive: {
    backgroundColor: '#EF4444',
    width: 24,
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 14,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
