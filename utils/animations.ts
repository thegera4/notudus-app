import { Animated, Easing } from 'react-native'

/** This function creates a growing up animation for the note items.
* @param {Animated.Value} ref - The reference to the Animated.Value object.
*/
export const animateListItem = (ref: Animated.Value): void => {
  Animated.timing(ref, {
    toValue: 1,
    duration: 300,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  }).start()
}

/** This function creates a sliding animation used when deleting a todo item.
* @param {Animated.Value} ref - The reference to the Animated.Value object.
* @param {Function} onDelete - The function to be called when the animation ends.
*/
export const slideAnimation = (ref: Animated.Value, onDelete: Function): void => {
  Animated.timing(ref, {
    toValue: -500, 
    duration: 300, 
    useNativeDriver: true
  }).start(() => onDelete())
}

/** This function creates a fade in animation for the custom loading screen.
* @param {Animated.Value} ref - The reference to the Animated.Value object.
*/
export const fadeIn = (ref: Animated.Value) => {
  Animated.timing(ref, {
    toValue: 1,
    duration: 1000,
    useNativeDriver: true,
  }).start(() => fadeOut(ref))
}

/** This function creates a fade out animation for the custom loading screen.
* @param {Animated.Value} ref - The reference to the Animated.Value object.
*/
const fadeOut = (ref: Animated.Value) => {
  Animated.timing(ref, {
    toValue: 0.5,
    duration: 1000,
    useNativeDriver: true,
  }).start(() => fadeIn(ref))
}

/** This function is the animation definition to slide the BottomSheet up.
* @param {Animated.Value} ref - The reference to the Animated.Value object.
*/
export const slideUp = (ref: Animated.Value): void => {
  Animated.timing(ref, { 
    toValue: 0, 
    duration: 200, 
    useNativeDriver: true 
  }).start()
}

/** This function is the animation definition to slide the BottomSheet down.
* @param {Animated.Value} ref - The reference to the Animated.Value object.
*/
export const slideDown = (ref: Animated.Value): void => {
  Animated.timing(ref, { 
    toValue: 300, 
    duration: 200, 
    useNativeDriver: true 
  }).start()
}