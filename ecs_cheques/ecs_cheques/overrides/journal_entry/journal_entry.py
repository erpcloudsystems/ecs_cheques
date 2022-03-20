# -*- coding: utf-8 -*-
# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.model.document import Document
from frappe import _
from frappe.desk.search import sanitize_searchfield
from frappe.utils import (flt, getdate, get_url, now,
nowtime, get_time, today, get_datetime, add_days)
from frappe.utils import add_to_date, now, nowdate

@frappe.whitelist()
def update_payment_entry_on_cancel(doc, method=None):
	if doc.reference_doctype == "Payment Entry" and doc.reference_link and (doc.pe_status == "محصل فوري" or doc.pe_status == "مظهر" or doc.pe_status == "تحت التحصيل"):
		frappe.db.sql(""" update `tabPayment Entry` set cheque_status = "حافظة شيكات واردة" where name = %s""", doc.reference_link)
		frappe.db.sql(""" update `tabPayment Entry` set cheque_action = "" where name = %s""", doc.reference_link)
		frappe.db.sql(""" update `tabPayment Entry` set clearance_date = NULL where name = %s""", doc.reference_link)

	if doc.reference_doctype == "Payment Entry" and doc.pe_status == "تحت التحصيل 2":
		frappe.db.sql(""" update `tabPayment Entry` set cheque_status = "مرفوض بالبنك" where name = %s""", doc.reference_link)
		frappe.db.sql(""" update `tabPayment Entry` set cheque_action = "" where name = %s""", doc.reference_link)

	if doc.reference_doctype == "Payment Entry" and doc.pe_status == "مردود 1":
		frappe.db.sql(""" update `tabPayment Entry` set cheque_status = "حافظة شيكات واردة" where name = %s""", doc.reference_link)
		frappe.db.sql(""" update `tabPayment Entry` set cheque_action = "" where name = %s""", doc.reference_link)

	if doc.reference_doctype == "Payment Entry" and doc.pe_status == "مردود 2":
		frappe.db.sql(""" update `tabPayment Entry` set cheque_status = "مرفوض بالبنك" where name = %s""", doc.reference_link)
		frappe.db.sql(""" update `tabPayment Entry` set cheque_action = "" where name = %s""", doc.reference_link)

	if doc.reference_doctype == "Payment Entry" and doc.reference_link and (doc.pe_status == "محصل" or doc.pe_status == "مرفوض بالبنك"):
		frappe.db.sql(""" update `tabPayment Entry` set cheque_status = "تحت التحصيل" where name = %s""", doc.reference_link)
		frappe.db.sql(""" update `tabPayment Entry` set cheque_action = "" where name = %s""", doc.reference_link)
		frappe.db.sql(""" update `tabPayment Entry` set clearance_date = NULL where name = %s""", doc.reference_link)

	if doc.reference_doctype == "Payment Entry" and doc.reference_link and doc.pe_status == "حافظة شيكات مرجعة":
		frappe.db.sql(""" update `tabPayment Entry` set cheque_status = "مرفوض بالبنك" where name = %s""", doc.reference_link)
		frappe.db.sql(""" update `tabPayment Entry` set cheque_action = "" where name = %s""", doc.reference_link)

	if doc.reference_doctype == "Payment Entry" and doc.reference_link and (doc.pe_status == "مدفوع" or doc.pe_status == "مسحوب"):
		frappe.db.sql(""" update `tabPayment Entry` set cheque_status_pay = "حافظة شيكات برسم الدفع" where name = %s""", doc.reference_link)
		frappe.db.sql(""" update `tabPayment Entry` set cheque_action = "" where name = %s""", doc.reference_link)
		frappe.db.sql(""" update `tabPayment Entry` set clearance_date = NULL where name = %s""", doc.reference_link)