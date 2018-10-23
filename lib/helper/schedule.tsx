/**
 * 创建一个调度函数，使用用户提供的调度器。
 *
 * @param task 被调度的执行函数
 * @param scheduler 用户提供的调度器
 * @returns 调用它可以执行一次任务调度
 */
// tslint:disable-next-line:ban-types
export function createScheduler(task: () => void, scheduler: Function) {
  // Prevent from multi-schedule
  let isRunning = false;

  const update = () => {
    isRunning = false;
    task();
  };

  const scheduleToRun = () => {
    if (!isRunning) {
      scheduler(update);
    }
    isRunning = true;
  };

  return scheduleToRun;
}
