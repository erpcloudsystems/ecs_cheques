// Copyright (c) 2021, erpcloud.systems and contributors
// For license information, please see license.txt

frappe.ui.form.on("Multiple Cheque Entry", {
	setup: function(frm) {
		frm.set_query("bank_acc", function() {
			return {
				filters: [
					["Bank Account","bank", "in", frm.doc.cheque_bank]
				]
			};
		});
	}
});

frappe.ui.form.on("Multiple Cheque Entry", {
	setup: function(frm) {
		frm.set_query("cheque_bank", function() {
			return {
				filters: [
					["Bank","company_bank", "=", '1']
				]
			};
		});
	}
});

frappe.ui.form.on("Multiple Cheque Entry", {
	setup: function(frm) {
		frm.set_query("mode_of_payment", function() {
			return {
				filters: [
					["Mode of Payment","type", "=", 'Cheque']
				]
			};
		});
	}
});

frappe.ui.form.on("Multiple Cheque Entry","party_type", function(frm){
    cur_frm.set_value("party","");
    cur_frm.set_value("party_name","");
});

frappe.ui.form.on("Multiple Cheque Entry","cheque_bank", function(frm){
    cur_frm.set_value("bank_acc","");
    cur_frm.set_value("account","");
    cur_frm.set_value("collection_fee_account","");
    cur_frm.set_value("payable_account","");
});

frappe.ui.form.on("Multiple Cheque Entry","bank_acc", function(frm){
    cur_frm.set_value("account","");
    cur_frm.set_value("collection_fee_account","");
    cur_frm.set_value("payable_account","");
});

frappe.ui.form.on("Multiple Cheque Entry", "on_submit", function(frm) {
    if(frm.doc.payment_type == "Pay"){
		let docs = [];
		$.each(frm.doc.cheque_table_2 || [], function(i, w) {
		  if(!w.payment_entry){
			docs.push({
				doctype: "Payment Entry",
				posting_date: frm.doc.posting_date,
				reference_doctype: "Multiple Cheque Entry",
				reference_link: frm.doc.name,
				payment_type: frm.doc.payment_type,
				mode_of_payment: frm.doc.mode_of_payment,
				mode_of_payment_type: frm.doc.mode_of_payment_type,
				party_type: frm.doc.party_type,
				party: frm.doc.party,
				paid_from: frm.doc.payable_account,
				paid_to: frm.doc.paid_to,
				cheque_bank: frm.doc.cheque_bank,
				bank_acc: frm.doc.bank_acc,

				cheque_type: w.cheque_type,
				reference_no: w.reference_no,
				reference_date: w.reference_date,
				paid_amount: w.paid_amount,
				received_amount: w.paid_amount,
				first_beneficiary: w.first_beneficiary,
				person_name: w.person_name,
				issuer_name: w.issuer_name,
				cheque_table_no2: w.name,
				picture_of_check: w.picture_of_check

			});console.log();
			 frappe.call({ method: "frappe.client.get_value",
				args: { doctype: "Payment Entry",
				fieldname: "name",
				filters: { 'cheque_table_no2': w.name},
				 }, callback: function(r)
				{frappe.db.set_value("Cheque Table Pay",  w.name, "payment_entry", r.message.name);console.log();
				    } });
		}

		});
		const funcs = docs.map((doc) => {
			frappe.call({
				method: "frappe.client.insert",
				args: {
					doc: doc // doc object
				},
				method: "frappe.client.submit",
				args: {
					doc: doc // doc object
				},
				callback: function(r) {}

			});console.log();
		});

		Promise.all(funcs).then(() => {
			console.log("Done");
			msgprint(" تم إنشاء الشيكات بنجاح ... برجاء الدخول على المدفوعات والمقبوضات ");
			frm.refresh();
		});
    }
	});

	frappe.ui.form.on("Multiple Cheque Entry", {
	setup: function(frm) {
		frm.set_query("party_type", function() {
			return {
				filters: [
					["DocType","name", "in", ["Customer","Supplier"]]
				]
			};
		});
	}
});

frappe.ui.form.on('Multiple Cheque Entry', 'payment_type',  function(frm) {
    if (cur_frm.doc.payment_type == "Receive"){
	    cur_frm.set_value("party_type", "Customer");
    }
    if (cur_frm.doc.payment_type == "Pay"){
	    cur_frm.set_value("party_type", "Supplier");
    }
});

frappe.ui.form.on('Multiple Cheque Entry', 'party',  function(frm) {

    if (cur_frm.doc.party_type =="Customer"){

    frappe.call({ method: "frappe.client.get_value",
	args: { doctype: "Customer",
	fieldname: "customer_name",
	filters: { 'name': cur_frm.doc.party},
	}, callback: function(r)
	{cur_frm.set_value("party_name", r.message.customer_name);
  } });
        }

  if (cur_frm.doc.party_type =="Supplier"){

    frappe.call({ method: "frappe.client.get_value",
    args: { doctype: "Supplier",
    fieldname: "supplier_name",
    filters: { 'name': cur_frm.doc.party},
    }, callback: function(r)
    {cur_frm.set_value("party_name", r.message.supplier_name);
  } });
        }
});

frappe.ui.form.on('Multiple Cheque Entry', 'party_type',  function(frm) {

    if (cur_frm.doc.payment_type == "Receive" && cur_frm.doc.party_type =="Customer"){

    frappe.call({ method: "frappe.client.get_value",
	args: { doctype: "Company",
	fieldname: "default_receivable_account",
	filters: { 'name': cur_frm.doc.company},
	}, callback: function(r)
	{cur_frm.set_value("paid_from", r.message.default_receivable_account);
  } });

    frappe.call({ method: "frappe.client.get_value",
	args: { doctype: "Company",
	fieldname: "default_incoming_cheque_wallet_account",
	filters: { 'name': cur_frm.doc.company},
	}, callback: function(r)
	{cur_frm.set_value("paid_to", r.message.default_incoming_cheque_wallet_account);
  } });
    }

    if (cur_frm.doc.payment_type == "Receive" && cur_frm.doc.party_type =="Supplier"){

    frappe.call({ method: "frappe.client.get_value",
	args: { doctype: "Company",
	fieldname: "default_payable_account",
	filters: { 'name': cur_frm.doc.company},
	}, callback: function(r)
	{cur_frm.set_value("paid_from", r.message.default_payable_account);
  } });

    frappe.call({ method: "frappe.client.get_value",
	args: { doctype: "Company",
	fieldname: "default_incoming_cheque_wallet_account",
	filters: { 'name': cur_frm.doc.company},
	}, callback: function(r)
	{cur_frm.set_value("paid_to", r.message.default_incoming_cheque_wallet_account);
  } });
        }

    if (cur_frm.doc.payment_type == "Pay" && cur_frm.doc.party_type =="Customer"){

    frappe.call({ method: "frappe.client.get_value",
	args: { doctype: "Company",
	fieldname: "default_receivable_account",
	filters: { 'name': cur_frm.doc.company},
	}, callback: function(r)
	{cur_frm.set_value("paid_to", r.message.default_receivable_account);
  } });
        }

    if (cur_frm.doc.payment_type == "Pay" && cur_frm.doc.party_type =="Supplier"){

    frappe.call({ method: "frappe.client.get_value",
	args: { doctype: "Company",
	fieldname: "default_payable_account",
	filters: { 'name': cur_frm.doc.company},
	}, callback: function(r)
	{cur_frm.set_value("paid_to", r.message.default_payable_account);
  } });
        }

  //  if (cur_frm.doc.payment_type == "Pay" && cur_frm.doc.party_type =="Employee"){

    //frappe.call({ method: "frappe.client.get_value",
	//args: { doctype: "Company",
	//fieldname: "default_employee_advance_account",
	//filters: { 'name': cur_frm.doc.company},
	//}, callback: function(r)
	//{cur_frm.set_value("paid_to", r.message.default_employee_advance_account);
  //} });

    //    }

});

frappe.ui.form.on("Multiple Cheque Entry", "validate", function(frm) {
    if(frm.doc.mode_of_payment_type != "Cheque"){
        frappe.throw("The Type Of The Selected Mode Of Payment Is Not Cheque ... Please Select Another Mode Of Payment With Cheque Type ");
    }
 });

frappe.ui.form.on("Multiple Cheque Entry", "on_submit", function(frm) {
    if(frm.doc.payment_type == "Receive"){
		let docs = [];
		$.each(frm.doc.cheque_table || [], function(i, v) {
		    if(!v.payment_entry){
			docs.push({
				doctype: "Payment Entry",
				posting_date: frm.doc.posting_date,
				reference_doctype: "Multiple Cheque Entry",
				reference_link: frm.doc.name,
				payment_type: frm.doc.payment_type,
				mode_of_payment: frm.doc.mode_of_payment,
				mode_of_payment_type: frm.doc.mode_of_payment_type,
				party_type: frm.doc.party_type,
				party: frm.doc.party,
				paid_from: frm.doc.paid_from,
				paid_to: frm.doc.paid_to,

				    drawn_bank: v.bank,
				    cheque_type: v.cheque_type,
			    	person_name: v.person_name,
					reference_no: v.reference_no,
					reference_date: v.reference_date,
					paid_amount: v.paid_amount,
					received_amount: v.paid_amount,
					cheque_table_no: v.name,
					first_beneficiary: v.first_beneficiary,
					picture_of_check: v.picture_of_check,
					issuer_name: v.issuer_name,


			});
			 frappe.call({ method: "frappe.client.get_value",
				args: { doctype: "Payment Entry",
				fieldname: "name",
				filters: { 'cheque_table_no': v.name},
				 }, callback: function(r)
				{frappe.db.set_value("Cheque Table Receive",  v.name, "payment_entry", r.message.name);
				    } });
		    }

		});
		const funcs = docs.map((doc) => {
			frappe.call({
				method: "frappe.client.insert",
				args: {
					doc: doc // doc object
				},
				method: "frappe.client.submit",
				args: {
					doc: doc // doc object
				},
				callback: function(r) {}
			});
		});

		Promise.all(funcs).then(() => {
			console.log("Done");
			msgprint(" تم إنشاء الشيكات بنجاح ... برجاء الدخول على المدفوعات والمقبوضات ");
			frm.refresh();
		});
    }
	});

frappe.ui.form.on("Cheque Table Pay","first_beneficiary", function(){
    for (var i = 0; i < cur_frm.doc.cheque_table_2.length; i++){
          cur_frm.doc.cheque_table_2[i].person_name = cur_frm.doc.party_name;
          cur_frm.doc.cheque_table_2[i].issuer_name = cur_frm.doc.company;
    }
    cur_frm.refresh_field('cheque_table_2');
});

frappe.ui.form.on("Cheque Table Receive","first_beneficiary", function(){
    for (var i = 0; i < cur_frm.doc.cheque_table.length; i++){
          cur_frm.doc.cheque_table[i].person_name = cur_frm.doc.company;
          cur_frm.doc.cheque_table[i].issuer_name = cur_frm.doc.party_name;
    }
    cur_frm.refresh_field('cheque_table');
});
