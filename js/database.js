/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var db;
function populateDB(tx) {
	tx.executeSql('DROP TABLE IF EXISTS DEMO');
	tx.executeSql('CREATE TABLE IF NOT EXISTS DEMO (uc char(8) unique,dev_id char(24))');
	tx.executeSql('INSERT INTO DEMO (uc) VALUES (07130011)');
	tx.executeSql('INSERT INTO DEMO (uc) VALUES (07130022)');
}

function errorCB(err) {
   	console.log("Error processing SQL: "+err.code);
}

function successCB() {
   	console.log("success!");
}

function queryDB(tx) {
    tx.executeSql('SELECT * FROM DEMO', [], querySuccess, errorCB);
}

function querySuccess(tx, results) {
	var len = results.rows.length;
    console.log("Returned rows = " + len);
     for (var i=0; i<len; i++){
            console.log("Row = " + i + " uc =  " + results.rows.item(i).uc 
                            + " ID = "  + results.rows.item(i).dev_id);
        }
    // this will be true since it was a select statement and so rowsAffected was 0
    console.log(results.rowsAffected);
    if (results.rowsAffected === 0) {
        console.log('No rows affected!');
        return false;
    }
    // for an insert statement, this property will return the ID of the last inserted row
    //console.log("Last inserted row ID = " + results.insertId);
}

function updateDB(tx) {
    tx.executeSql("UPDATE DEMO SET dev_id = '123456789123456789123456' WHERE uc = 07130022", [], querySuccess, errorCB);
}
function databasetest(){
	db = window.openDatabase("Database", "1.0", "PhoneGap Demo", 200000);
    db.transaction(populateDB, errorCB, successCB);
}
function querytest(){
	db.transaction(queryDB, errorCB);
}
function updatetest(){
	db.transaction(updateDB, errorCB);
}

