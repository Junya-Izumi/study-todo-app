import * as database from './api.js';

// console.log(await database.getAllTask())
const qs = (selector, parent = document) => parent.querySelector(selector);
const qsAll = (selector, parent = document) => parent.querySelectorAll(selector);
class TaskManager {
    static taskList = []
    static editTask = null
    constructor(){}
    static async createTask() {
        this.editTask = null
        qs(".editer-taskTitle").value = ''
        qs(".editer-taskDetail").value = ''
        qs(".editer-taskTitle").focus()
    }
    static async save() {
        // console.log("run save ",TaskManager.editTask.htmlElement,TaskManager.editTask,!TaskManager.editTask)
        if (this.editTask == null) {
            console.log("new task")
            const newTaskData = {
                title: qs(".editer-taskTitle").value,
                detail: qs(".editer-taskDetail").value,
                createDate: new Date(),
                completed: 0,
                completeDate: new Date()
            }
            const insert = await database.requestAction("insert", JSON.stringify(newTaskData))// console.log(insert)
            console.log("insert:", insert.response)
            const taskData = await Task.recordToTaskData(insert.response)
            // console.log(taskData)
            this.editTask = new Task(taskData)
            console.log(this.editTask)
            return taskData
        }
        console.log("existing")
        this.editTask.taskData = {
            id: this.editTask.taskData.id,
            title: qs(".editer-taskTitle").value,
            detail: qs(".editer-taskDetail").value
        }
        this.editTask.displayUpdate()
        database.requestAction('updateReord', JSON.stringify(this.editTask.taskData));

    }
    static async delete() {
        qs(".editer-taskTitle").value = ''
        qs(".editer-taskDetail").value = ''
        if (this.editTask == null) return;
        // console.log(TaskManager.editTask.taskData.id)
        const deleteRecord = await database.deleteRecord(this.editTask.taskData.id)
        if (deleteRecord.response == "deleted") {
            this.editTask.htmlElement.remove()
            this.taskList[this.taskList.indexOf(this.editTask)] = null
            this.taskList = this.taskList.filter(task => task !== null)
            this.editTask = null;
        }
        // console.log(deleteRecord)
        return deleteRecord.response
    }
    static onload() {
        qs(".editer-menu_btn_0").addEventListener('click', this.delete.bind(this))
        qs(".editer-menu_btn_1").addEventListener('click', this.save.bind(this))
        qs(".editer-createTask").addEventListener('click', this.createTask.bind(this))
    }
}
class Task {
    static taskList = []
    static editTask = null;
    constructor(taskData) {
        this.taskData = taskData
        TaskManager.taskList.push(this)
        TaskManager.taskList.push(this)
        this.displayTask()
    }
    /**
     * htmlで表示するためのテンプレートリテラルを返す
     * @returns {TemplateStringsArray}
     */
    get UITemplate() {
        const { id, title, detail, createDate, completeDate, completed } = this.taskData
        // const title = taskData.title
        // const detail = taskData.detail
        // const createDate = taskData.createDate
        const pad2 = (num) => String(num).padStart(2, '0');
        const dateParts = (date) => {
            return {
                year: date.getFullYear(),//年
                month: pad2(date.getMonth() + 1),//月 0ベースだから+1
                date: pad2(date.getDate()),//日
                hour: pad2(date.getHours()),//時間
                minutes: pad2(date.getMinutes())//分 
            }
        };
        const displayText = (dateParts) => `${dateParts.year}/${dateParts.month}/${dateParts.date} ${dateParts.hour}:${dateParts.minutes}`;
        const displayCompleted = (num) => { if (num == 1) { return "未完了にする" } else { return "完了にする" } };
        const createDateParts = dateParts(createDate)
        const createDateDisplayText = displayText(createDateParts)
        const completeDateParts = dateParts(completeDate)
        const completeDateDisplayText = displayText(completeDateParts)
        const completedDisplaytext = displayCompleted(completed)
        return `
        <li data-taskid="${id}">
            <article class="task">
                <h4 class="task-title">${title}</h4>
                <p class="task-detail">${detail}</p>
                <button class="task-completeBtn" aria-label="${completedDisplaytext}">
                    <span>${completedDisplaytext}</span>
                </button>
                <time class="task-createDate" datetime="${createDateDisplayText}">
                作成日時:${createDateDisplayText}
                </time>
                <time class="task-completeDate" datetime="${completeDateDisplayText}">
                完了日時:${completeDateDisplayText}
                </time>
            </article>
        </li>
        `
    }
    /**
     * タスクを一覧に表示する
     * @returns 
     */
    displayTask() {
        // console.log("completed:",this.taskData)
        const targetList = [".taskList-incomplete", ".taskList-completed"][this.taskData.completed]
        console.log(this.taskData.completed,qs(targetList))
        qs(targetList).insertAdjacentHTML('beforeend', this.UITemplate)
        // this.htmlElement = qs(`${targetList} > li:last-child`)
        this.htmlElement.addEventListener('click', this.selectTask)
        qs(".task-completeBtn", this.htmlElement).addEventListener('click', this.switchComplete.bind(this))
    }
    async switchComplete(e) {
        e.stopPropagation()//イベント伝播を防ぐ
        // console.log(this.taskData.completed,[1, 0][this.taskData.completed])
        if (this.taskData.completed) {
            this.taskData.completed = 0
        }else{
            this.taskData.completed = 1
        }
        // this.taskData.completed = [1, 0][this.taskData.completed]
        this.taskData.completeDate = new Date()
        this.htmlElement.remove()
        await database.requestAction('update', JSON.stringify(this.taskData))
        this.displayTask()
    }
    /***
     * this.htmlElementがクリックされたときのイベントハンドラ
     */
    selectTask(e) {
        // console.log(e.target)
        const editer = qs(".editer")
        const title = qs(".editer-taskTitle", editer)
        const detail = qs(".editer-taskDetail", editer)
        const id = e.target.dataset.taskid;
        // console.log(e.target.dataset)
        // console.log(title)
        title.value = qs(".task-title", e.target).innerText
        detail.value = qs(".task-detail", e.target).innerText
        TaskManager.editTask = Task.prototype.searchById(id);
        // console.log("globalThis.task", TaskManager.editTask)
    }
    /**
     * @param {number} id 
     * @returns {null | Task}
     */
    searchById(id = NaN) {
        if (id == NaN) return null;
        for (let i in TaskManager.taskList) {
            const currentTaskId = TaskManager.taskList[i].taskData.id;
            if (currentTaskId == id) {
                return TaskManager.taskList[i];
            }
        }
        return null;
    }
    get htmlElement() {
        const selector = `[data-taskid="${this.taskData.id}"]`
        // console.log("taskid:",this.taskData.id,selector)
        return qs(selector)
    }
    /**
     * 変更内容をタスク一覧に反映する
     */
    displayUpdate() {
        const { title, detail } = this.taskData
        qs(".task-title", this.htmlElement).innerText = title
        qs(".task-detail", this.htmlElement).innerText = detail
    }
    static async recordToTaskData(record) {
        const taskData = {}
        const col = await database.tableInfo()
        record.forEach((item, index) => {
            const currentCol = col.response[index][1]
            if (currentCol === 'createDate' ||
                currentCol === 'completeDate'
            ) {
                taskData[currentCol] = new Date(item)
            } else {
                taskData[currentCol] = item
            }
        });
        return taskData
    }
    static async onload() {
        const allTaskData = await database.requestAction('allTask')
        console.log(allTaskData)
        // console.log("allTaskData",allTaskData)
        allTaskData.response.forEach(async (record) => {
            /**
             *　レスポンスでTaskクラスのインスタンスを作成する 
             */
            const taskData = await Task.recordToTaskData(record)
            new Task(taskData)
        });
        console.log(TaskManager.taskList)
        // console.log("globalThis.task", qs(".editer-menu_btn_1"))
        // qs(".editer-createTask").addEventListener('click', this.createTask.bind(this))
        // qs("body > script:last-child").remove()
    }
}
globalThis.task = Task;
globalThis.taskManager = TaskManager
globalThis.reqAction = database.requestAction

/*
* taskデータを取得して表示する
*/
document.addEventListener('DOMContentLoaded', Task.onload())
document.addEventListener('DOMContentLoaded', TaskManager.onload())