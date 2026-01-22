export const postURL = "http://localhost:8000/todo";

export function createRquest(requestTxt,payload = ""){
    const template = new Request(postURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    })
    return new Request(template,{
        body:JSON.stringify({
            "request": requestTxt,
            "payload":payload
        })
    })
}

export const definedActions = [
    "allTask",
    "update",
    "insert",
    "tableInfo"
]

export async function requestAction(action,payload="") {
    if (definedActions.includes(action)) {
        const request = createRquest(action,payload)
        return (await fetch(request)).json()
    }else{
        return -1;
    }
}

export async function deleteRecord(id) {
    const Request_deteleRecord = createRquest('deleteRecord',id.toString())
    const response =  await fetch(Request_deteleRecord)
    const data =  await response.json()
    return data
}

export async function tableInfo() {
    const Request_insertRecord = createRquest("tableInfo")
    const response = await fetch(Request_insertRecord)
    const data = await response.json()
    return data
}