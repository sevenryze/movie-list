/**
 * Create a schedule factory
 *
 * @param task The target task
 * @param scheduler Actual scheduler, like rAF
 * @returns Call for schedule!
 */
// tslint:disable-next-line:ban-types
export function createScheduler(task: () => void, scheduler: Function) {
  // Prevent from multi-schedule
  let isRunning = false;

  const update = () => {
    task();
    isRunning = false;
  };

  const scheduleToRun = () => {
    if (!isRunning) {
      scheduler(update);
    }
    isRunning = true;
  };

  return scheduleToRun;
}
