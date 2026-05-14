import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, PanResponder, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { MemorialPoster, MemorialElement, Person } from '../../types/memorial';
import type { Person as PersonType } from '../../types/familyTree';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POSTER_WIDTH = SCREEN_WIDTH - 32;
const POSTER_HEIGHT = POSTER_WIDTH * 1.4;

interface DraggableElementProps {
  element: MemorialElement;
  onUpdate: (element: MemorialElement) => void;
  onDelete?: (elementId: string) => void;
  isEditing: boolean;
}

const DraggableElement: React.FC<DraggableElementProps> = ({
  element,
  onUpdate,
  onDelete,
  isEditing,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [position, setPosition] = useState({ x: element.x, y: element.y });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isEditing,
      onMoveShouldSetPanResponder: () => isEditing,
      onPanResponderMove: (_, gestureState) => {
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        const newX = element.x + gestureState.dx;
        const newY = element.y + gestureState.dy;
        setPosition({ x: newX, y: newY });
        pan.setValue({ x: 0, y: 0 });
        onUpdate({
          ...element,
          x: newX,
          y: newY,
        });
      },
    })
  ).current;

  const renderContent = () => {
    switch (element.type) {
      case 'avatar':
        return (
          <View style={[styles.avatarContainer, { width: element.width, height: element.height }]}>
            {element.data.avatar_url ? (
              <Image
                source={{ uri: element.data.avatar_url }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: element.data.gender === 'male' ? '#3B82F6' : '#EC4899' }]}>
                <Text style={styles.avatarText}>
                  {element.data.name?.charAt(0) || '?'}
                </Text>
              </View>
            )}
            <Text style={styles.avatarName} numberOfLines={1}>
              {element.data.name}
            </Text>
          </View>
        );

      case 'name':
        return (
          <View style={[styles.nameContainer, { width: element.width }]}>
            <Text style={[styles.nameText, { fontSize: element.height }]}>
              {element.data.text}
            </Text>
          </View>
        );

      case 'text':
        return (
          <View style={[styles.textContainer, { width: element.width }]}>
            <Text style={styles.textContent} numberOfLines={undefined}>
              {element.data.text}
            </Text>
          </View>
        );

      case 'qrcode':
        return (
          <View style={[styles.qrcodeContainer, { width: element.width, height: element.height }]}>
            <View style={styles.qrcodePlaceholder}>
              <Text style={styles.qrcodeText}>二维码</Text>
            </View>
            <Text style={styles.qrcodeLabel}>{element.data.label || '扫码加入家族'}</Text>
          </View>
        );

      case 'photo':
        return (
          <View style={[styles.photoContainer, { width: element.width, height: element.height }]}>
            {element.data.uri ? (
              <Image source={{ uri: element.data.uri }} style={styles.photoImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>+</Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={[
        styles.elementContainer,
        {
          left: position.x,
          top: position.y,
          width: element.width,
          height: element.height,
          transform: [{ rotate: `${element.rotation || 0}deg` }],
        },
        pan.getLayout(),
      ]}
      {...panResponder.panHandlers}
    >
      {renderContent()}
      {isEditing && onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(element.id)}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      )}
      {isEditing && (
        <View style={styles.resizeHandle} />
      )}
    </Animated.View>
  );
};

interface MemorialPosterPreviewProps {
  poster: MemorialPoster;
  onUpdatePoster: (poster: MemorialPoster) => void;
  isEditing?: boolean;
}

const MemorialPosterPreview: React.FC<MemorialPosterPreviewProps> = ({
  poster,
  onUpdatePoster,
  isEditing = false,
}) => {
  const { colors } = useTheme();

  const updateElement = useCallback((updatedElement: MemorialElement) => {
    const updatedElements = poster.layout.elements.map((el) =>
      el.id === updatedElement.id ? updatedElement : el
    );
    onUpdatePoster({
      ...poster,
      layout: {
        ...poster.layout,
        elements: updatedElements,
      },
    });
  }, [poster, onUpdatePoster]);

  const deleteElement = useCallback((elementId: string) => {
    const updatedElements = poster.layout.elements.filter((el) => el.id !== elementId);
    onUpdatePoster({
      ...poster,
      layout: {
        ...poster.layout,
        elements: updatedElements,
      },
    });
  }, [poster, onUpdatePoster]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.posterContainer,
          {
            backgroundColor: poster.layout.backgroundColor,
            width: POSTER_WIDTH,
            height: POSTER_HEIGHT,
          },
        ]}
      >
        {poster.layout.backgroundImage && (
          <Image
            source={{ uri: poster.layout.backgroundImage }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.elementsContainer}>
          {poster.layout.elements.map((element) => (
            <DraggableElement
              key={element.id}
              element={element}
              onUpdate={updateElement}
              onDelete={deleteElement}
              isEditing={isEditing}
            />
          ))}
        </View>

        <View style={styles.familyNameContainer}>
          <Text style={styles.familyNameText}>{poster.familyName}</Text>
        </View>

        {poster.familyMotto && (
          <View style={styles.mottoContainer}>
            <Text style={styles.mottoText}>"{poster.familyMotto}"</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  posterContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  elementsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  elementContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resizeHandle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '85%',
    borderRadius: 100,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '85%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  avatarName: {
    marginTop: 8,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  nameContainer: {
    alignItems: 'center',
  },
  nameText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  textContainer: {
    padding: 8,
    alignItems: 'center',
  },
  textContent: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  qrcodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrcodePlaceholder: {
    width: '80%',
    height: '75%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrcodeText: {
    fontSize: 14,
    color: '#1F2937',
  },
  qrcodeLabel: {
    marginTop: 4,
    fontSize: 10,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  photoContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  familyNameContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  familyNameText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  mottoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  mottoText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default MemorialPosterPreview;
