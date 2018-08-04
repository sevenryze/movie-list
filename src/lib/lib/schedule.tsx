/**
 * 创建一个调度函数，使用用户提供的调度器。
 *
 * @param task 被调度的执行函数
 * @param scheduler 用户提供的调度器
 * @returns {() => void} 调用它可以执行一次任务调度
 */
export function createScheduler(task: Function, scheduler: Function) {
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
