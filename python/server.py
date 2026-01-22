import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from database.database import *
from typing import Callable
import json

class TestBody(BaseModel):
    request:str
    payload:str

app  = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

response_functions = {}
def append_entry(key:str):
    def wapper(value:Callable):
        response_functions[key] = value
        return value
    return wapper

@append_entry("allTask")
def allTask(payload:str = None):
    connect = onConnect()
    cursor = connect.cursor()
    allTask =  recordList(cursor,"todo")
    col = tableInfo(cursor,"todo")
    # test = list(allTask[0])
    # print("test",test)
    # test[1] = "dlkjlk j lksj flk asdfjasklj slkajfklja"
    response = {
        "response":allTask,
        "col":col,
        # "test":searchRecordById(cursor,"todo",10),
        # "update":updateById(connect,cursor,"todo",test)
    }
    connect.close()
    return response

@append_entry("tableInfo")
def info(payload:str = None):
    connect = onConnect()
    cursor = connect.cursor()
    info = tableInfo(cursor,"todo")
    response = {
        "response":info
    }
    connect.close()
    return response

@append_entry('update')
def update(payload:str = None):
    payload = json.loads(payload)
    connect = onConnect()
    cursor = connect.cursor()
    response = {
        "response":updateById(connect,cursor,"todo",payload)
    }
    connect.close()
    return response

@append_entry("insert")
def insert(payload:str):
    payload = json.loads(payload)
    connect = onConnect()
    cursor = connect.cursor()
    response = {
        "response":insertRecord(connect,cursor,"todo",payload)
    }
    connect.close()
    return response

@append_entry('deleteRecord')
def deleteRecord(payload:str):
    id = payload
    connect = onConnect()
    cursor = connect.cursor()
    response = {
        "response":deleteRecordById(connect,cursor,'todo',id)
    }
    connect.close()
    return response

@append_entry("deleteTable")
def deleteTable(payload:str = None):
    connect = onConnect()
    cursor = connect.cursor()
    removeTable(connect,cursor,"todo")
    response = {
        "response":"deleted"
    }
    connect.close()
    return response


print("response_functions",list(response_functions.keys()))

@app.post("/todo")
def test(body:TestBody):
    print("body:",body)
    request = body.request
    payload = body.payload
    if request in response_functions:
        return response_functions[request](payload)


if __name__ == "__main__":
    uvicorn.run("server:app",port=8000,reload= True)
    print(__file__)
