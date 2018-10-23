export function addResizeListener(listener: () => void, target: Window | HTMLElement) {
  return addListener("resize", listener, target);
}

export function addScrollListener(listener: () => void, target: Window | HTMLElement) {
  return addListener("scroll", listener, target);
}

/**
 * Register the event listener.
 *
 * @param event The event name, e.g. "scroll" or "resize"
 * @param listener The listener of event
 * @param target The target element whaich is listened
 * @return The unregister handler
 */
function addListener(event: string, listener: () => void, target: Window | HTMLElement) {
  const eventCallback = () => {
    return listener();
  };

  target.addEventListener(event, eventCallback);

  return () => {
    target.removeEventListener(event, eventCallback);
  };
}
