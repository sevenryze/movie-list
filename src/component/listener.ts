export function addResizeListener(
  listener: Function,
  target: Window | HTMLElement
) {
  return addListener("resize", listener, target);
}

export function addScrollListener(
  listener: Function,
  target: Window | HTMLElement
) {
  return addListener("scroll", listener, target);
}

/**
 * 注册侦听函数，返回取消侦听器
 *
 * @param event 希望侦听的事件名称，例如："scroll" or "resize"
 * @param listener 事件侦听处理函数
 * @param target 希望侦听的目标对象
 * @return 调用此返回函数可以取消侦听事件
 */
function addListener(event: string, listener: Function, target) {
  const eventCallback = () => {
    return listener();
  };

  // 注册侦听函数
  target.addEventListener(event, eventCallback);

  // 调用此函数可取消事件侦听
  return () => {
    target.removeEventListener(event, eventCallback);
  };
}
