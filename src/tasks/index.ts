import fs from 'fs';
import path from 'path';
import { container } from 'tsyringe';

export abstract class Task {
    interval: number = 360;
    lastRun: number = 0;
    abstract run(): Promise<void>;
}

export default class TaskManager {
    private static instance: TaskManager
    private _tasks: Task[] = []

    constructor() {
        const dir = path.join(path.resolve(), 'src/tasks')
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            if(file.endsWith('.task.ts')){
                import('./' + file).then((module) =>{
                    const task: Task = container.resolve(module.default);
                    this._tasks.push(task)
                });
            }
        });
    }

    public static getInstance(): TaskManager {
        if (!TaskManager.instance)
            TaskManager.instance = new TaskManager()
        return TaskManager.instance;
    }

    public async start(){
        while(true) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            const now = Math.round(Date.now() / 1000)
            this._tasks.forEach((task) => {
                if (now - task.lastRun > task.interval) {
                    task.run().then(() => task.lastRun = now);
                }
            })
        }
    }
}