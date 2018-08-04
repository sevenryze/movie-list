import { Snapshot } from "./snapshot";

const PROXIMITY = {
  INSIDE: "inside",
  OUTSIDE: "outside"
};

const TRIGGER_CAUSE = {
  INITIAL_POSITION: "init",
  MOVEMENT: "movement",
  LIST_UPDATE: "list-update"
};

function getProximity(condition, snapshot: Snapshot) {
  return condition(snapshot.getListRect(), snapshot.getScreenRect())
    ? PROXIMITY.INSIDE
    : PROXIMITY.OUTSIDE;
}

function findCause(prevState, nextState) {
  const isInit =
    !prevState.proximity && nextState.proximity === PROXIMITY.INSIDE;
  if (isInit) {
    return TRIGGER_CAUSE.INITIAL_POSITION;
  }

  const isMovement =
    prevState.proximity === PROXIMITY.OUTSIDE &&
    nextState.proximity === PROXIMITY.INSIDE;
  if (isMovement) {
    return TRIGGER_CAUSE.MOVEMENT;
  }

  const stay =
    prevState.proximity === PROXIMITY.INSIDE &&
    nextState.proximity === PROXIMITY.INSIDE;
  if (stay && prevState.listLength !== nextState.listLength) {
    return TRIGGER_CAUSE.LIST_UPDATE;
  }

  return null;
}

export const Condition = {
  nearTop(distance) {
    return (list, viewport) => {
      return viewport.getTop() - list.getTop() <= distance;
    };
  },
  nearBottom(distance) {
    return (list, viewport) => {
      return list.getBottom() - viewport.getBottom() <= distance;
    };
  },
  nearTopRatio(ratio) {
    return (list, viewport) => {
      const viewportHeight = viewport.getHeight();
      const distance = ratio * viewportHeight;
      return viewport.getTop() - list.getTop() <= distance;
    };
  },
  nearBottomRatio(ratio) {
    return (list, viewport) => {
      const viewportHeight = viewport.getHeight();
      const distance = ratio * viewportHeight;
      return list.getBottom() - viewport.getBottom() <= distance;
    };
  }
};

/**
 * 用来记录Scroll的位置，然后触发一些在注册在特定位置的事件。例如：滑到最底、滑到最顶、快到最底、快到最顶
 */
export class Trigger {
  private _handlers;

  constructor(zones) {
    this._handlers = zones.map(zone => ({
      zone,
      state: {}
    }));
  }

  handleSnapshotUpdate(snapshot: Snapshot) {
    this._handlers.forEach(({ zone, state }) => {
      const { condition, callback } = zone;
      const newProximity = getProximity(condition, snapshot);
      const newListLength = snapshot.getFrameList().length;
      const triggerCause = findCause(state, {
        proximity: newProximity,
        listLength: newListLength
      });

      state.proximity = newProximity;
      state.listLength = newListLength;

      if (triggerCause) {
        callback({
          triggerCause
        });
      }
    });
  }
}
