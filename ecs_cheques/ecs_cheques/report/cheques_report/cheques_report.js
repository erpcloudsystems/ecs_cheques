// Copyright (c) 2016, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Cheques Report"] = {
	"filters": [
	    {
			"fieldname":"type",
			"label": __("Type"),
			"fieldtype": "Select",
			"options": ["Pay","Receive","Internal Transfer"],
			"default": ["Pay"],
			"reqd": 1,
			on_change: function() {
				let type = frappe.query_report.get_filter_value('type');
				frappe.query_report.toggle_filter_display('status', type === 'Pay');
				frappe.query_report.toggle_filter_display('status_pay', type === 'Receive');
				frappe.query_report.set_filter_value('status_pay', '');
				frappe.query_report.set_filter_value('status', '');
				frappe.query_report.refresh();
			}
		},
		{
			"fieldname":"status",
			"label": __("Status"),
			"fieldtype": "Select",
			"options":  "\nحافظة شيكات واردة \nمظهر\nتحت التحصيل\nمحصل\nمرفوض بالبنك\nحافظة شيكات مرجعة\nمردود\nمحصل فوري",
			"hidden": 1
		},
		{
			"fieldname":"status_pay",
			"label": __("Status"),
			"fieldtype": "Select",
			"options":  "\nحافظة شيكات برسم الدفع\nمدفوع\nمسحوب",
			
		},
		{
			"fieldname": "from_date",
			"label": __("From Date"),
			"fieldtype": "Date",

		},
		{
			"fieldname": "to_date",
			"label": __("To Date"),
			"fieldtype": "Date",

		},
		{
			"fieldname":"new_mode_of_payment",
			"label": __("Mode of Payment"),
			"fieldtype": "Link",
			"options": "Mode of Payment",
		},
		{
			"fieldname":"bank",
			"label": __("Bank"),
			"fieldtype": "Link",
			"options": "Bank Account"
		}
	],


	    "formatter": function (value, row, column, data, default_formatter) {
                value = default_formatter(value, row, column, data);

                if (column.fieldname == "reference_date" && data && frappe.datetime.get_diff(data.reference_date, frappe.datetime.nowdate()) <= 15) {
                     value = "<span style='color:red;font-weight: bold;'>" + value + "</span>";
                }else if(column.fieldname == "reference_date" && data && frappe.datetime.get_diff(data.reference_date, frappe.datetime.nowdate()) > 15){
                }else if(column.fieldname == "reference_date" && data && frappe.datetime.get_diff(data.reference_date, frappe.datetime.nowdate()) > 15){
                    value =  value ;
                }
/*                else if (column && data && data.cheque_status == "محصل فوري") {
                     value = "<span style='background-color:#8CFA97;font-weight: bold;'>" + value + "</span>";
                }else if (column && data && data.cheque_status == "محصل") {
                     value = "<span style='background-color:#8CFA97;font-weight: bold;'>" + value + "</span>";
                }else if (column && data && data.cheque_status == "مدفوع") {
                     value = "<span style='background-color:#8CFA97;font-weight: bold;'>" + value + "</span>";
                }else if (column && data && data.cheque_status == "حافظة شيكات مرجعة") {
                     value = "<span style='background-color:#FAA58C;font-weight: bold;'>" + value + "</span>";
                }else if (column && data && data.cheque_status == "مرفوض بالبنك") {
                     value = "<span style='background-color:#FAA58C;font-weight: bold;'>" + value + "</span>";
                }else if (column && data && data.cheque_status == "مردود") {
                     value = "<span style='background-color:#FAA58C;font-weight: bold;'>" + value + "</span>";
                }else if (column && data && data.cheque_status == "تحت التحصيل") {
                     value = "<span style='background-color:#FAD98C;font-weight: bold;'>" + value + "</span>";
                }else if (column && data && data.cheque_status == "مظهر") {
                     value = "<span style='background-color:#FAD98C;font-weight: bold;'>" + value + "</span>";
                }else if (column && data && data.cheque_status == "حافظة شيكات واردة") {
                     value = "<span style='background-color:#C8CDFE;font-weight: bold;'>" + value + "</span>";
                }else if (column && data && data.cheque_status == "حافظة شيكات برسم الدفع") {
                     value = "<span style='background-color:#C8CDFE;font-weight: bold;'>" + value + "</span>";
                }
*/
                return value;
            }

}
