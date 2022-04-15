frappe.ui.form.on("Payment Entry", {
    refresh(frm) {
        if (cur_frm.doc.docstatus == "1" && cur_frm.doc.mode_of_payment_type == "Cheque" && cur_frm.doc.payment_type == "Receive" && cur_frm.doc.cheque_type == "Opened" && cur_frm.doc.cheque_status == "حافظة شيكات واردة"){
            set_field_options("cheque_action", ["رد شيك","تحويل إلى حافظة شيكات أخرى","تظهير شيك","إيداع شيك تحت التحصيل","تحصيل فوري للشيك"]);
        }
        if (cur_frm.doc.docstatus == "1" && cur_frm.doc.mode_of_payment_type == "Cheque" && cur_frm.doc.payment_type == "Receive" && cur_frm.doc.cheque_type != "Opened" && cur_frm.doc.cheque_status == "حافظة شيكات واردة"){
            set_field_options("cheque_action", ["تحويل إلى حافظة شيكات أخرى","إيداع شيك تحت التحصيل","تحصيل فوري للشيك"]);
        }
        if (cur_frm.doc.docstatus == "1" && cur_frm.doc.mode_of_payment_type == "Cheque" && cur_frm.doc.payment_type == "Receive" && cur_frm.doc.cheque_status == "تحت التحصيل"){
            set_field_options("cheque_action", ["رفض شيك تحت التحصيل","صرف شيك تحت التحصيل"]);
        }
        if (cur_frm.doc.docstatus == "1" && cur_frm.doc.mode_of_payment_type == "Cheque" && cur_frm.doc.payment_type == "Receive" && cur_frm.doc.cheque_status == "مرفوض بالبنك"){
            set_field_options("cheque_action", ["إيداع شيك تحت التحصيل","رد شيك","إرجاع لحافظة شيكات واردة"]);
        }
        if (cur_frm.doc.docstatus == "1" && cur_frm.doc.mode_of_payment_type == "Cheque" && cur_frm.doc.payment_type == "Receive" && cur_frm.doc.paid_amount != cur_frm.doc.encashed_amount && cur_frm.doc.cheque_status == "مرفوض بالبنك"){
            set_field_options("cheque_action", ["رد شيك","إرجاع لحافظة شيكات واردة","إيداع شيك تحت التحصيل","تسييل الشيك"]);
        }
        if (cur_frm.doc.docstatus == "1" && cur_frm.doc.mode_of_payment_type == "Cheque" && cur_frm.doc.payment_type == "Receive" && cur_frm.doc.cheque_status == "حافظة شيكات مرجعة"){
                set_field_options("cheque_action", ["إيداع شيك تحت التحصيل","رد شيك","تسييل الشيك"]);
        }
        if (cur_frm.doc.docstatus == "1" && cur_frm.doc.mode_of_payment_type == "Cheque" && cur_frm.doc.payment_type == "Receive" && cur_frm.doc.paid_amount > cur_frm.doc.encashed_amount && cur_frm.doc.cheque_status == "حافظة شيكات مرجعة"){
                set_field_options("cheque_action", ["رد شيك","تسييل الشيك"]);
        }
        if (cur_frm.doc.docstatus == "1" && cur_frm.doc.mode_of_payment_type == "Cheque" && cur_frm.doc.payment_type == "Receive" && cur_frm.doc.paid_amount > cur_frm.doc.encashed_amount && cur_frm.doc.encashed_amount != 0){
                set_field_options("cheque_action", ["تسييل الشيك"]);
        }
        if (cur_frm.doc.docstatus == "1" && cur_frm.doc.mode_of_payment_type == "Cheque" && cur_frm.doc.payment_type == "Receive" && cur_frm.doc.paid_amount == cur_frm.doc.encashed_amount && cur_frm.doc.cheque_status == "حافظة شيكات مرجعة"){
                set_field_options("cheque_action", ["رد شيك"]);
        }
        if (cur_frm.doc.docstatus == "1" && cur_frm.doc.mode_of_payment_type == "Cheque" && (cur_frm.doc.payment_type == "Pay" || cur_frm.doc.payment_type == "Internal Transfer") && cur_frm.doc.cheque_status_pay == "حافظة شيكات برسم الدفع"){
            set_field_options("cheque_action", ["صرف الشيك","سحب الشيك"]);
        }
        if (cur_frm.doc.docstatus == "1" && cur_frm.doc.mode_of_payment_type == "Cheque" && (cur_frm.doc.cheque_status == "مظهر" || cur_frm.doc.cheque_status == "محصل فوري" || cur_frm.doc.cheque_status == "مردود" || cur_frm.doc.cheque_status == "محصل" || cur_frm.doc.cheque_status_pay == "مدفوع" || cur_frm.doc.cheque_status_pay == "مسحوب")){
            set_field_options("cheque_action", [" "]);
        }
    }
});

frappe.ui.form.on("Payment Entry", {
	setup: function(frm) {
		frm.set_query("new_mode_of_payment", function() {
			return {
				filters: [
					["Mode of Payment","type", "=", 'Cheque']
				]
			};
		});
	}
});

frappe.ui.form.on("Payment Entry", {
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

frappe.ui.form.on("Payment Entry", {
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

frappe.ui.form.on("Payment Entry","mode_of_payment", function(frm){
    if (cur_frm.doc.mode_of_payment_type == "Cheque"){
        cur_frm.doc.new_mode_of_payment = cur_frm.doc.mode_of_payment;
    }
});

/*
frappe.ui.form.on("Payment Entry","account", function(frm){
    if (cur_frm.doc.mode_of_payment_type == "Cheque" && cur_frm.doc.payment_type == "Internal Transfer"){
        cur_frm.set_value("paid_from",cur_frm.doc.account);
    }
});
*/

frappe.ui.form.on("Payment Entry","cheque_bank", function(frm){
    cur_frm.set_value("bank_acc","");
    cur_frm.set_value("account","");
    cur_frm.set_value("collection_fee_account","");
    cur_frm.set_value("payable_account","");
});

/*
frappe.ui.form.on("Payment Entry","bank_acc", function(frm){
    cur_frm.set_value("account","");
    cur_frm.set_value("collection_fee_account","");
    cur_frm.set_value("payable_account","");
});
*/

/*frappe.ui.form.on("Payment Entry","bank_acc", function(frm){
    if(cur_frm.doc.payment_type == "Pay" && cur_frm.doc.mode_of_payment_type == "Cheque"){
        cur_frm.set_value("paid_from",cur_frm.doc.collection_fee_account);
    }
});
*/
frappe.ui.form.on("Payment Entry","first_beneficiary", function(frm){
    if(cur_frm.doc.payment_type == "Pay" && cur_frm.doc.first_beneficiary == "Company" && cur_frm.doc.mode_of_payment_type == "Cheque"){
        cur_frm.set_value("person_name",cur_frm.doc.party);
        cur_frm.set_value("issuer_name",cur_frm.doc.company);
    }
});

frappe.ui.form.on("Payment Entry","first_beneficiary", function(frm){
    if(cur_frm.doc.payment_type == "Pay" && cur_frm.doc.first_beneficiary == "Personal" && cur_frm.doc.mode_of_payment_type == "Cheque"){
        cur_frm.set_value("person_name","");
        cur_frm.set_value("issuer_name",cur_frm.doc.company);
    }
});

frappe.ui.form.on("Payment Entry","first_beneficiary", function(frm){
    if(cur_frm.doc.payment_type == "Receive" && cur_frm.doc.first_beneficiary == "Company" && cur_frm.doc.mode_of_payment_type == "Cheque"){
        cur_frm.set_value("person_name",cur_frm.doc.company);
        cur_frm.set_value("issuer_name",cur_frm.doc.party);
    }
});

frappe.ui.form.on("Payment Entry","first_beneficiary", function(frm){
    if(cur_frm.doc.payment_type == "Receive" && cur_frm.doc.first_beneficiary == "Personal" && cur_frm.doc.mode_of_payment_type == "Cheque"){
        cur_frm.set_value("person_name","");
        cur_frm.set_value("issuer_name","");
    }
});

frappe.ui.form.on('Payment Entry', 'bank_acc',  function(frm) {
   if(cur_frm.doc.payment_type == "Receive" && cur_frm.doc.mode_of_payment_type == "Cheque"){
       frappe.call({ method: "frappe.client.get_value",
args: { doctype: "Bank Account",
fieldname: "co3_",
filters: { 'name': cur_frm.doc.bank_acc},
}, callback: function(r)
{cur_frm.set_value("co3_", r.message.co3_);
  } });
   }

});

frappe.ui.form.on('Payment Entry', 'bank_acc',  function(frm) {
   if(cur_frm.doc.payment_type == "Receive" && cur_frm.doc.mode_of_payment_type == "Cheque"){
       frappe.call({ method: "frappe.client.get_value",
args: { doctype: "Bank Account",
fieldname: "co4_",
filters: { 'name': cur_frm.doc.bank_acc},
}, callback: function(r)
{cur_frm.set_value("co4_", r.message.co4_);
  } });
   }

});

frappe.ui.form.on('Payment Entry', 'bank_acc',  function(frm) {
   if(cur_frm.doc.payment_type == "Receive" && cur_frm.doc.mode_of_payment_type == "Cheque"){
       frappe.call({ method: "frappe.client.get_value",
args: { doctype: "Bank Account",
fieldname: "co5_",
filters: { 'name': cur_frm.doc.bank_acc},
}, callback: function(r)
{cur_frm.set_value("co5_", r.message.co5_);
  } });
   }

});

frappe.ui.form.on('Payment Entry', 'bank_acc',  function(frm) {
   if(cur_frm.doc.payment_type == "Receive" && cur_frm.doc.mode_of_payment_type == "Cheque"){
       frappe.call({ method: "frappe.client.get_value",
args: { doctype: "Bank Account",
fieldname: "co6",
filters: { 'name': cur_frm.doc.bank_acc},
}, callback: function(r)
{cur_frm.set_value("co6", r.message.co6);
  } });
   }

});



frappe.ui.form.on('Payment Entry', 'payment_type',  function(frm) {
   if(cur_frm.doc.payment_type == "Receive" && cur_frm.doc.mode_of_payment_type == "Cheque"){
       frappe.call({ method: "frappe.client.get_value",
args: { doctype: "Company",
fieldname: "default_incoming_cheque_wallet_account",
filters: { 'name': cur_frm.doc.company},
}, callback: function(r)
{cur_frm.set_value("paid_to", r.message.default_incoming_cheque_wallet_account);
  } });
   }

});

frappe.ui.form.on('Payment Entry', 'mode_of_payment',  function(frm) {
   if(cur_frm.doc.payment_type == "Receive" && cur_frm.doc.mode_of_payment_type == "Cheque"){
       frappe.call({ method: "frappe.client.get_value",
args: { doctype: "Company",
fieldname: "default_incoming_cheque_wallet_account",
filters: { 'name': cur_frm.doc.company},
}, callback: function(r)
{cur_frm.set_value("paid_to", r.message.default_incoming_cheque_wallet_account);
  } });
   }

});

frappe.ui.form.on("Payment Entry", "encashment_amount", function(frm) {
    cur_frm.doc.encashed_amount = cur_frm.doc.encashed_amount + cur_frm.doc.encashment_amount;
    cur_frm.doc.remaining_amount = cur_frm.doc.paid_amount - cur_frm.doc.encashed_amount;

});

frappe.ui.form.on("Payment Entry", "validate", function(frm) {
    cur_frm.doc.encashment_amount = 0;
});

frappe.ui.form.on("Payment Entry", {
setup: function(frm) {
frm.set_query("party_type_", function() {
return {
filters: [
["DocType","name", "in", ["Supplier", "Customer", "Employee"]]
]
};
});
}
});

frappe.ui.form.on("Payment Entry", {
setup: function(frm) {
frm.set_query("account_1", function() {
return {
filters: [
["Account","account_type", "in", ["Payable", "Receivable"]]
]
};
});
}
});

frappe.ui.form.on("Payment Entry", "on_submit", function(frm) {
    if (frm.doc.mode_of_payment_type == "Cheque" && frm.doc.payment_type == "Receive" && frm.doc.cheque_){
    frappe.db.set_value("Cheque Table",  frm.doc.cheque_table_no, "payment_entry", frm.doc.name)
    }
    if (frm.doc.mode_of_payment_type == "Cheque" && frm.doc.payment_type == "Pay" && frm.doc.cheque_){
    frappe.db.set_value("Cheque Table Pay",  frm.doc.cheque_table_no2, "payment_entry", frm.doc.name)
    }
});

frappe.ui.form.on('Payment Entry', 'party_type_',  function(frm) {

    if (cur_frm.doc.party_type_ =="Customer"){

    frappe.call({ method: "frappe.client.get_value",
args: { doctype: "Company",
fieldname: "default_receivable_account",
filters: { 'name': cur_frm.doc.company},
}, callback: function(r)
{cur_frm.set_value("account_1", r.message.default_receivable_account);
  } });
    }
  if (cur_frm.doc.party_type_ =="Employee"){

    frappe.call({ method: "frappe.client.get_value",
args: { doctype: "Company",
fieldname: "default_employee_advance_account",
filters: { 'name': cur_frm.doc.company},
}, callback: function(r)
{cur_frm.set_value("account_1", r.message.default_employee_advance_account);
  } });
  }


   if (cur_frm.doc.party_type_ =="Supplier"){
       frappe.call({ method: "frappe.client.get_value",
args: { doctype: "Company",
fieldname: "default_payable_account",
filters: { 'name': cur_frm.doc.company},
}, callback: function(r)
{cur_frm.set_value("account_1", r.message.default_payable_account);
  } });
   }

});


