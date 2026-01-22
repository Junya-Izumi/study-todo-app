import sqlite3
import os
import pprint


todoColDefinition  = [
    "id INTEGER PRIMARY KEY",
    "title TEXT",
    "detail TEXT",
    "createDate TEXT",
    "completed BOOLEAN",
    "completeDate TEXT"
]

def onConnect() -> sqlite3.Connection:
    currentFolder = os.path.dirname(os.path.abspath(__file__))
    targetFile = os.path.join(currentFolder,"ToDoApp.db")
    if os.path.exists(targetFile) == False:
        f = open(targetFile,mode='w')
        f.close()
        connect = sqlite3.connect(targetFile)
        createTable(connect,connect.cursor(),'todo',todoColDefinition)
    return sqlite3.connect(targetFile)

def removeTargetCharactor(text:str,target:str|list) -> str:#テキストから文字を特定の文字を取り除く
    result = text
    for item in target:
        result = result.replace(item,"")
    return result

def createTable(connect:sqlite3.Connection,cursor:sqlite3.Cursor,tableName:str,colDefinition:list) -> str:#テーブルの作成を関数化
    # colDefinitionText = map(lambda item:item+",",colDefinition)
    colDefinitionText = removeTargetCharactor(str(colDefinition),"'[]")
    print("colDefinitionText",(colDefinitionText))
    print("tableName",tableName)
    # print("colDefinition",str(colDefinition))
    query = f"create table if not exists {tableName}({colDefinitionText})"
    print("query",query)
    cursor.execute(query)
    connect.commit()
    return tableName

def tableInfo(cursor:sqlite3.Cursor,tableName:str) -> list:
    query  = f"PRAGMA table_info({tableName})"
    cursor.execute(query)
    columns = cursor.fetchall()
    # print("tableInfo ",f"table name:{tableName}",columns)
    return columns

def colNameList(cursor:sqlite3.Cursor,tableName:str) -> list:
    
    pass

def tableList(cursor:sqlite3.Cursor) -> list:
    '''
    テーブルの一覧を取得する
    '''
    query = "SELECT name FROM sqlite_master WHERE type='table'"
    cursor.execute(query)
    tables = [t[0] for t in cursor.fetchall()]
    return tables

def recordList(cursor:sqlite3.Cursor,tableName:str) -> list:
    '''
    指定したテーブルのレコードをすべて取得する
    '''
    query = f"SELECT * FROM {tableName}"
    cursor.execute(query)
    records = cursor.fetchall()
    return records

def removeTable(connect:sqlite3.Connection,cursor:sqlite3.Cursor,tableName:str):
    '''
    テーブルを削除する関数
    '''
    query = f"DROP table IF EXISTS {tableName};"
    cursor.execute(query)
    connect.commit()
    return tableName

def insertRecord(connect:sqlite3.Connection,cursor:sqlite3.Cursor,tableName:str,keyValues:dict):
    '''
        レコードの追加
    '''
    # valuesText = removeTargetCharactor(str(values),"[]")
    # values = list(map(lambda item:item.value,keyValues))
    values  =  list(keyValues.values())
    keys = ', '.join(keyValues.keys())
    print("keyValues:",keyValues) 
    print("values:",values)
    print("keys:",keys)
    print("tableName",tableName)
    placeholders = ', '.join(['?'] * len(keyValues))
    query = f"INSERT INTO {tableName} ({keys}) VALUES ({placeholders})"
    # query = f'INSERT INTO {tableName} ({keys}) VALUES ({values}) '
    print("insertRecord","query:",query)
    cursor.execute(query,values)
    newId = cursor.lastrowid
    print("newId",newId)
    connect.commit()
    return searchRecordById(cursor,"todo",newId)

def searchRecordById(cursor:sqlite3.Cursor,tableName:str,id:int|str):
    allRecord = recordList(cursor,tableName)
    for i in range(len(list(allRecord))):
        # print(item)
        if allRecord[i][0] == id:
           return allRecord[i]
    return -1

def updateById(connect:sqlite3.Connection,cursor:sqlite3.Cursor,tableName:str,record:dict):
    '''
     更新されたデータを反映する
     テーブルになければ追加する
    '''
    print("update record",record)
    # keyValues = dict(zip(list(map(lambda x:x[1], tableInfo(cursor,"todo"))),record))
    # print("keyValues",record)
    pprint.pprint(record,width=40)
    existingRecord = searchRecordById(cursor,tableName,record["id"])
    if existingRecord == -1:
        return insertRecord(connect,cursor,tableName,record)
    updateText = ""
    keys = list(record.keys())
    values = list(record.values())
    updateValueCount = 0
    for i in range(len(list(record.keys()))):
        # print(type(values[i]))
        # print(values)
        # print("existingRecord[i]",existingRecord[i],"values[0]",values[i])
        if values[i] == existingRecord[i]:
            print("i",i)
            continue
        updateValueCount = updateValueCount+1
        if updateValueCount > 1 :
            updateText+=", "
        print("updateValueCount:",updateValueCount)
        if type(values[i]) == str:
            updateText+=f"{keys[i]} = '{values[i]}' "
        else:
            updateText+=f"{keys[i]} = {values[i]} "
    print("updateText",updateText,"len",len(updateText))
    if len(updateText) == 0:
        return 
    query = f"update {tableName} set {updateText} where id = {record['id']}"
    print("query:",query)
    cursor.execute(query)
    connect.commit()
    return record["id"]

def deleteRecordById(connect:sqlite3.Connection,cursor:sqlite3.Cursor,tableName:str,id:str):
    query = f"DELETE FROM {tableName} WHERE id = {id}"
    print("delete record query:",query)
    cursor.execute(query)
    connect.commit()
    return "deleted"


# def main():
#     connect  = onConnect()
#     cursor = connect.cursor()
#     createTable(connect,cursor,"todo",todoColDefinition)
#     pass

# if __name__ == "__main__":
#     # main()
#     pass