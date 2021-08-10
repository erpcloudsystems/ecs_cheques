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
			on_change: function() {
				let filter_based_on = frappe.query_report.get_filter_value('type');
				frappe.query_report.toggle_filter_display('status', type === 'Pay');
				frappe.query_report.toggle_filter_display('status_pay', type === 'Receive');

				frappe.query_report.refresh();
			}
		},
		{
			"fieldname":"status",
			"label": __("Status"),
			"fieldtype": "Select",
			"options":  "\nحافظة شيكات برسم التحصيل\nمظهر\nتحت التحصيل\nمحصل\nمرفوض بالبنك\nحافظة شيكات مرجعة\nمردود\nمحصل فوري"
		},
		{
			"fieldname":"status_pay",
			"label": __("Status"),
			"fieldtype": "Select",
			"options":  "\nحافظة شيكات برسم الدفع\nمدفوع"
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





                return value;
            }
}
