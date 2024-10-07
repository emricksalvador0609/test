/**
* Author: Algie Rosario - 09178557045
* Date: December 06, 2022 11PM
*/

var sqlite_connection = new JsStore.Connection(new Worker('../hxassets/hxplugins/jsstoresqlitelib/jsstore.worker.min.js'));
var session_table = "health_xense_session_table";
var clinic_schedule_table = "health_xense_clinic_schedule_table";


$(document).ready(function(){

	var db ='healthxense_offlinesqlitedb';

	var tblSession = {
	    name: session_table,
	    columns: {
	        //id: { primaryKey: true, autoIncrement: true },
			user_id:  { notNull: false, dataType: "number" },
	        userlog_id:  { notNull: true, dataType: "number" },
			user_access_token:  { notNull: false, dataType: "string" },
			first_name:  { notNull: true, dataType: "string" },
			last_name:  { notNull: false, dataType: "string" },
			email_address:  { notNull: false, dataType: "string" },
	        phone_number:  { notNull: false, dataType: "string" },
            sig2_number:  { notNull: false, dataType: "string" },
            license_number:  { notNull: false, dataType: "string" },
        	ptr_number:  { notNull: false, dataType: "string" },
            picture:  { notNull: false, dataType: "string" },
            medical_form_header:  { notNull: false, dataType: "string" },
            signature:  { notNull: false, dataType: "string" },
            license_no_exp_date:  { notNull: false, dataType: "string" },
            ptr_no_exp_date:  { notNull: false, dataType: "string" },
            sig_2_no_exp_date:  { notNull: false, dataType: "string" },
            date_of_birth:  { notNull: false, dataType: "string" },
            gender:  { notNull: false, dataType: "string" },
            prc_id_image:  { notNull: false, dataType: "string" },
            active_clinic: { notNull: false, dataType: "string" },
            title:  { notNull: false, dataType: "string" }

	    },
	    alter: {
			7: {
				add:{
	                email_address:  { notNull: false, dataType: "string" },
	                phone_number:  { notNull: false, dataType: "string" },
                    sig2_number:  { notNull: false, dataType: "string" },
	                ptr_number:  { notNull: false, dataType: "string" },
	                license_number:  { notNull: false, dataType: "string" },
                    picture:  { notNull: false, dataType: "string" },
                    medical_form_header:  { notNull: false, dataType: "string" },
                    signature:  { notNull: false, dataType: "string" },
                    license_no_exp_date:  { notNull: false, dataType: "string" },
                    ptr_no_exp_date:  { notNull: false, dataType: "string" },
                    sig_2_no_exp_date:  { notNull: false, dataType: "string" },
                    title:  { notNull: false, dataType: "string" },
                    date_of_birth:  { notNull: false, dataType: "string" },
                    prc_id_image:  { notNull: false, dataType: "string" },
                    active_clinic: { notNull: false, dataType: "string" },
                    gender:  { notNull: false, dataType: "string" },
	            }
			}
		}
	};

	var tblClinic = {
	    name: clinic_schedule_table,
	    columns: {
			access_token: { notNull: false, dataType: "string" },
			doctor_clinic_id:  { notNull: false, dataType: "number" },
			clinic_id: { notNull: false, dataType: "number" },
			clinic_name: { notNull: false, dataType: "string" },
			monday_schedule: { notNull: false, dataType: "object" },
			is_online_monday: { notNull: false, dataType: "boolean" },
			tuesday_schedule: { notNull: false, dataType: "object" },
			is_online_tuesday: { notNull: false, dataType: "boolean" },
			wednesday_schedule: { notNull: false, dataType: "object" },
			is_online_wednesday: { notNull: false, dataType: "boolean" },
			thursday_schedule: { notNull: false, dataType: "object" },
			is_online_thursday: { notNull: false, dataType: "boolean" },
			friday_schedule: { notNull: false, dataType: "object" },
			is_online_friday: { notNull: false, dataType: "boolean" },
			saturday_schedule: { notNull: false, dataType: "object" },
			is_online_saturday: { notNull: false, dataType: "boolean" },
			sunday_schedule: { notNull: false, dataType: "object" },
			is_online_sunday: { notNull: false, dataType: "boolean" },
	    }
	};


	var database = {
	    name: db,
	    tables: [tblSession,tblClinic],
	    version: 9
	}

	//initialize sqlitedb
	jsstoresqlite_initsqlitedb(database);

	//clear data for autos-downloading of new data
	//jsstoresqlite_clear_table(clisqlcachingtbl);

});

async function jsstoresqlite_clear_table(table_name){
	await sqlite_connection.clear(table_name);
}

async function jsstoresqlite_initsqlitedb(database) {

	const isDbCreated = await sqlite_connection.initDb(database);

	if(isDbCreated === true){
		//console.log("jsstore cliconnection created");
	}else {
	    //console.log("jsstore cliconnection opened");
	}

}

async function jsstoresqlite_read_data(table_name, where_clause = {}){

	// results will be array of objects
	if( $.isEmptyObject(where_clause) ){

		var results = await sqlite_connection.select({
	    	from: table_name,
		});

	}else{

		var results = await sqlite_connection.select({
		    from: table_name,
			where: where_clause,
		});

	}

	return results;
}

async function jsstoresqlite_insert_data(table_name, data){

	var insertCount = await sqlite_connection.insert({
	    into: table_name,
	    values: data,
		validation: false,
		skipDataCheck: true,
	});

	return insertCount;
}

async function jsstoresqlite_update_data(table_name, data, where){

	var rowsUpdated = await sqlite_connection.update({
	    in: table_name,
	    set: data,
	    where: where
	});

	return rowsUpdated;
}


async function is_logged_in(table_name, is_boolean = true){

	// results will be array of objects
	var is_logged_in = false;

	var result = await sqlite_connection.select({
	    from: table_name,
	});

	if(typeof result == "object"){

		if(result.hasOwnProperty(0)){
			is_logged_in = true;
			actokensec = validate_clean_hxdata(result[0]['user_access_token']);
		}

		return is_boolean ? is_logged_in : result;

	//always false
	}else{

		return is_logged_in;

	}

}

async function is_clinic_exist(table_name, is_boolean = true, where=false){

	// results is_exist be array of objects
	var is_exist = false;

	if(!where) {
		var result = await sqlite_connection.select({
	    from: table_name,
		});
	} else {
		var result = await sqlite_connection.select({
	    from: table_name,
	   	where:where
		});
	}


	if(typeof result == "object"){

		if(result.hasOwnProperty(0)){
			is_exist = true;
			//actokensec = validate_clean_hxdata(result[0]['user_access_token']);
		}

		return is_boolean ? is_exist : result;

	//always false
	}else{

		return is_exist;

	}

}
