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
def cheque(doc, method=None):
	default_incoming_cheque_wallet_account = frappe.db.get_value("Company", doc.company, "default_incoming_cheque_wallet_account")
	default_rejected_cheque_account = frappe.db.get_value("Company", doc.company, "default_rejected_cheque_account")
	default_payback_cheque_wallet_account = frappe.db.get_value("Company", doc.company, "default_payback_cheque_wallet_account")
	default_discount_account = frappe.db.get_value("Company", doc.company, "default_discount_account")
	default_cash_account = frappe.db.get_value("Company", doc.company, "default_cash_account")
	default_bank_commissions_account = frappe.db.get_value("Company", doc.company, "default_bank_commissions_account")
	default_receivable_account = frappe.db.get_value("Company", doc.company, "default_receivable_account")



	if doc.cheque_action == "تحصيل فوري للشيك":
		frappe.db.sql("""update `tabPayment Entry` set clearance_date = %s where name=%s """,
					  (nowdate(), doc.name))
		frappe.db.sql(""" update `tabPayment Entry` set cheque_status = "محصل فوري" where name = %s""", doc.name)
		doc.reload()
		accounts = [
			{
				"doctype": "Journal Entry Account",
				"account": default_cash_account,
				"credit": 0,
				"debit": doc.paid_amount,
				"debit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			},
			{
				"doctype": "Journal Entry Account",
				"account": doc.paid_to,
				"credit": doc.paid_amount,
				"debit": 0,
				"credit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			}
		]
		new_doc = frappe.get_doc({
			"doctype": "Journal Entry",
			"voucher_type": "Bank Entry",
			"reference_doctype": "Payment Entry",
			"reference_link": doc.name,
			"cheque_no": doc.reference_no,
			"cheque_date": doc.reference_date,
			"pe_status": "محصل فوري",
			"posting_date": doc.posting_date,
			"accounts": accounts,
			"payment_type": doc.payment_type

		})
		new_doc.insert()
		new_doc.submit()

	if not doc.bank_acc and doc.cheque_action == "إيداع شيك تحت التحصيل":
		frappe.throw(_("برجاء تحديد الحساب البنكي"))

	if doc.cheque_action == "إيداع شيك تحت التحصيل" and doc.with_bank_commission:
		frappe.db.sql(""" update `tabPayment Entry` set cheque_status = "تحت التحصيل" where name = %s""", doc.name)
		doc.reload()
		accounts = [
			{
				"doctype": "Journal Entry Account",
				"account": doc.collection_fee_account,
				"credit": 0,
				"debit": doc.paid_amount,
				"debit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			},
			{
				"doctype": "Journal Entry Account",
				"account": default_bank_commissions_account,
				"credit": 0,
				"debit": doc.co3_,
				"debit_in_account_currency": doc.co3_,
				"user_remark": doc.name
			},
			{
				"doctype": "Journal Entry Account",
				"account": doc.paid_to,
				"debit": 0,
				"credit": doc.paid_amount,
				"credit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			},
			{
				"doctype": "Journal Entry Account",
				"account": doc.account,
				"debit": 0,
				"credit": doc.co3_,
				"credit_in_account_currency": doc.co3_,
				"user_remark": doc.name
			},
		]
		new_doc = frappe.get_doc({
			"doctype": "Journal Entry",
			"voucher_type": "Bank Entry",
			"reference_doctype": "Payment Entry",
			"reference_link": doc.name,
			"cheque_no": doc.reference_no,
			"cheque_date": doc.reference_date,
			"pe_status": "تحت التحصيل",
			"posting_date": doc.posting_date,
			"accounts": accounts,
			"payment_type": doc.payment_type
		})
		new_doc.insert()
		new_doc.submit()

	if not doc.collection_fee_account and doc.mode_of_payment == "شيك":
		frappe.throw(_(" برجاء تحديد حساب برسم التحصيل داخل الحساب البنكي وإعادة إختيار الحساب البنكي مرة أخرى "))

	if not doc.payable_account and doc.mode_of_payment == "شيك":
		frappe.throw(_(" برجاء تحديد حساب برسم الدفع داخل الحساب البنكي وإعادة إختيار الحساب البنكي مرة أخرى "))

	if not doc.account and doc.mode_of_payment == "شيك":
		frappe.throw(_(" برجاء تحديد الحساب الجاري داخل الحساب البنكي وإعادة إختيار الحساب البنكي مرة أخرى "))

	if doc.cheque_action == "إيداع شيك تحت التحصيل" and not doc.with_bank_commission:
		frappe.db.sql(""" update `tabPayment Entry` set cheque_status = "تحت التحصيل" where name = %s""", doc.name)
		doc.reload()
		accounts = [
			{
				"doctype": "Journal Entry Account",
				"account": doc.collection_fee_account,
				"credit": 0,
				"debit": doc.paid_amount,
				"debit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			},
			{
				"doctype": "Journal Entry Account",
				"account": doc.paid_to,
				"debit": 0,
				"credit": doc.paid_amount,
				"credit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			}
		]
		new_doc = frappe.get_doc({
			"doctype": "Journal Entry",
			"voucher_type": "Bank Entry",
			"reference_doctype": "Payment Entry",
			"reference_link": doc.name,
			"cheque_no": doc.reference_no,
			"cheque_date": doc.reference_date,
			"pe_status": "تحت التحصيل",
			"posting_date": doc.posting_date,
			"accounts": accounts,
			"payment_type": doc.payment_type
		})
		new_doc.insert()
		new_doc.submit()

	if doc.cheque_action == "صرف شيك تحت التحصيل":
		frappe.db.sql("""update `tabPayment Entry` set clearance_date = %s where name=%s """,
					  (nowdate(), doc.name))
		frappe.db.sql(""" update `tabPayment Entry` set cheque_status = "محصل" where name = %s""", doc.name)
		doc.reload()
		accounts = [
			{
				"doctype": "Journal Entry Account",
				"account": doc.account,
				"credit": 0,
				"debit": doc.paid_amount,
				"debit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			},
			{
				"doctype": "Journal Entry Account",
				"account": doc.collection_fee_account,
				"debit": 0,
				"credit": doc.paid_amount,
				"credit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			}
		]
		new_doc = frappe.get_doc({
			"doctype": "Journal Entry",
			"voucher_type": "Bank Entry",
			"reference_doctype": "Payment Entry",
			"reference_link": doc.name,
			"cheque_no": doc.reference_no,
			"cheque_date": doc.reference_date,
			"pe_status": "محصل",
			"posting_date": doc.posting_date,
			"accounts": accounts,
			"payment_type": doc.payment_type
		})
		new_doc.insert()
		new_doc.submit()

	if doc.cheque_action == "رفض شيك تحت التحصيل" and doc.with_bank_commission:
		frappe.db.sql(""" update `tabPayment Entry` set cheque_status = "مرفوض بالبنك" where name = %s""",
					  doc.name)
		doc.reload()
		accounts = [
			{
				"doctype": "Journal Entry Account",
				"account": default_rejected_cheque_account,
				"credit": 0,
				"debit": doc.paid_amount,
				"debit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			},
			{
				"doctype": "Journal Entry Account",
				"account": default_bank_commissions_account,
				"credit": 0,
				"debit": doc.co5_,
				"debit_in_account_currency": doc.co5_,
				"user_remark": doc.name
			},
			{
				"doctype": "Journal Entry Account",
				"account": doc.collection_fee_account,
				"debit": 0,
				"credit": doc.paid_amount,
				"credit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			},
			{
				"doctype": "Journal Entry Account",
				"account": doc.account,
				"debit": 0,
				"credit": doc.co5_,
				"credit_in_account_currency": doc.co5_,
				"user_remark": doc.name
			}
		]
		new_doc = frappe.get_doc({
			"doctype": "Journal Entry",
			"voucher_type": "Bank Entry",
			"reference_doctype": "Payment Entry",
			"reference_link": doc.name,
			"cheque_no": doc.reference_no,
			"cheque_date": doc.reference_date,
			"pe_status": "مرفوض بالبنك",
			"posting_date": doc.posting_date,
			"accounts": accounts,
			"payment_type": doc.payment_type
		})
		new_doc.insert()
		new_doc.submit()

	if doc.cheque_action == "رفض شيك تحت التحصيل" and not doc.with_bank_commission:
		frappe.db.sql(""" update `tabPayment Entry` set cheque_status = "مرفوض بالبنك" where name = %s""",
					  doc.name)
		doc.reload()
		accounts = [
			{
				"doctype": "Journal Entry Account",
				"account": default_rejected_cheque_account,
				"credit": 0,
				"debit": doc.paid_amount,
				"debit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			},
			{
				"doctype": "Journal Entry Account",
				"account": doc.collection_fee_account,
				"debit": 0,
				"credit": doc.paid_amount,
				"credit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			}
		]
		new_doc = frappe.get_doc({
			"doctype": "Journal Entry",
			"voucher_type": "Bank Entry",
			"reference_doctype": "Payment Entry",
			"reference_link": doc.name,
			"cheque_no": doc.reference_no,
			"cheque_date": doc.reference_date,
			"pe_status": "مرفوض بالبنك",
			"posting_date": doc.posting_date,
			"accounts": accounts,
			"payment_type": doc.payment_type
		})
		new_doc.insert()
		new_doc.submit()

	if doc.cheque_action == "تظهير شيك":
		frappe.db.sql(""" update `tabPayment Entry` set cheque_status = "مظهر" where name = %s""", doc.name)
		doc.reload()
		accounts = [
			{
				"doctype": "Journal Entry Account",
				"account": doc.account_1,
				"party_type": doc.party_type_,
				"party": doc.party_,
				"credit": 0,
				"debit": doc.paid_amount,
				"debit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			},
			{
				"doctype": "Journal Entry Account",
				"account": doc.paid_to,
				"debit": 0,
				"credit": doc.paid_amount,
				"credit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			}
		]
		new_doc = frappe.get_doc({
			"doctype": "Journal Entry",
			"voucher_type": "Bank Entry",
			"reference_doctype": "Payment Entry",
			"reference_link": doc.name,
			"cheque_no": doc.reference_no,
			"cheque_date": doc.reference_date,
			"pe_status": "مظهر",
			"posting_date": doc.posting_date,
			"accounts": accounts,
			"payment_type": doc.payment_type
		})
		new_doc.insert()
		new_doc.submit()

	if doc.cheque_action == "سحب شيك مرفوض بالبنك":
		frappe.db.sql(""" update `tabPayment Entry` set cheque_status = "حافظة شيكات مرجعة" where name = %s""",
					  doc.name)
		doc.reload()
		accounts = [
			{
				"doctype": "Journal Entry Account",
				"account": default_payback_cheque_wallet_account,
				"credit": 0,
				"debit": doc.paid_amount,
				"debit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			},
			{
				"doctype": "Journal Entry Account",
				"account": default_rejected_cheque_account,
				"debit": 0,
				"credit": doc.paid_amount,
				"credit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			}
		]
		new_doc = frappe.get_doc({
			"doctype": "Journal Entry",
			"voucher_type": "Bank Entry",
			"reference_doctype": "Payment Entry",
			"reference_link": doc.name,
			"cheque_no": doc.reference_no,
			"cheque_date": doc.reference_date,
			"pe_status": "حافظة شيكات مرجعة",
			"posting_date": doc.posting_date,
			"accounts": accounts,
			"payment_type": doc.payment_type
		})
		new_doc.insert()
		new_doc.submit()

	if not doc.encashment_amount and doc.cheque_action == "تسييل الشيك":
		frappe.throw(_("برجاء إدخال مبلغ التسييل"))

	if doc.encashment_amount > doc.paid_amount and doc.cheque_action == "تسييل الشيك":
		frappe.throw(_("مبلغ التسييل لا يمكن أن يكون أكبر من مبلغ الشيك"))
		doc.reload()

	if doc.encashed_amount > doc.paid_amount and doc.cheque_action == "تسييل الشيك":
		frappe.throw(_("مبلغ التسييل لا يمكن أن يكون أكبر من المبلغ الغير مسيل"))
		doc.reload()

	if doc.cheque_action == "تسييل الشيك":
		frappe.db.sql(""" update `tabPayment Entry` set cheque_status = "حافظة شيكات مرجعة" where name = %s""",
					  doc.name)
		doc.reload()
		accounts = [
			{
				"doctype": "Journal Entry Account",
				"account": default_cash_account,
				"credit": 0,
				"debit": doc.encashment_amount,
				"debit_in_account_currency": doc.encashment_amount,
				"user_remark": doc.name
			},
			{
				"doctype": "Journal Entry Account",
				"account": default_payback_cheque_wallet_account,
				"debit": 0,
				"credit": doc.encashment_amount,
				"credit_in_account_currency": doc.encashment_amount,
				"user_remark": doc.name
			}
		]
		new_doc = frappe.get_doc({
			"doctype": "Journal Entry",
			"voucher_type": "Bank Entry",
			"reference_doctype": "Payment Entry",
			"reference_link": doc.name,
			"cheque_no": doc.reference_no,
			"cheque_date": doc.reference_date,
			"pe_status": "حافظة شيكات مرجعة",
			"posting_date": doc.posting_date,
			"accounts": accounts,
			"payment_type": doc.payment_type
		})
		new_doc.insert()
		new_doc.submit()
		frappe.db.sql(""" update `tabPayment Entry` set encashment_amount = 0 where name = %s""", doc.name)
		doc.reload()

	if doc.cheque_action == "رد شيك":
		frappe.db.sql(""" update `tabPayment Entry` set cheque_status = "مردود" where name = %s""", doc.name)
		doc.reload()
		accounts = [
			{
				"doctype": "Journal Entry Account",
				"account": default_receivable_account,
				"party": doc.party,
				"party_type": doc.party_type,
				"credit": 0,
				"debit": doc.paid_amount,
				"debit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			},
			{
				"doctype": "Journal Entry Account",
				"account": default_payback_cheque_wallet_account,
				"debit": 0,
				"credit": doc.paid_amount,
				"credit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			}
		]
		new_doc = frappe.get_doc({
			"doctype": "Journal Entry",
			"voucher_type": "Bank Entry",
			"reference_doctype": "Payment Entry",
			"reference_link": doc.name,
			"cheque_no": doc.reference_no,
			"cheque_date": doc.reference_date,
			"pe_status": "مردود",
			"posting_date": doc.posting_date,
			"accounts": accounts,
			"payment_type": doc.payment_type
		})
		new_doc.insert()
		new_doc.submit()

	if not doc.bank_acc and doc.cheque_action == "صرف الشيك":
		frappe.throw(_("برجاء تحديد الحساب البنكي"))

	if doc.cheque_action == "صرف الشيك":
		frappe.db.sql("""update `tabPayment Entry` set clearance_date = %s where name=%s """,
					  (nowdate(), doc.name))
		frappe.db.sql(""" update `tabPayment Entry` set cheque_status_pay = "مدفوع" where name = %s""", doc.name)
		doc.reload()
		accounts = [
			{
				"doctype": "Journal Entry Account",
				"account": doc.payable_account,
				"credit": 0,
				"debit": doc.paid_amount,
				"debit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			},
			{
				"doctype": "Journal Entry Account",
				"account": doc.account,
				"debit": 0,
				"credit": doc.paid_amount,
				"credit_in_account_currency": doc.paid_amount,
				"user_remark": doc.name
			}
		]
		new_doc = frappe.get_doc({
			"doctype": "Journal Entry",
			"voucher_type": "Bank Entry",
			"reference_doctype": "Payment Entry",
			"reference_link": doc.name,
			"cheque_no": doc.reference_no,
			"cheque_date": doc.reference_date,
			"pe_status": "مدفوع",
			"posting_date": doc.posting_date,
			"accounts": accounts,
			"payment_type": doc.payment_type
		})
		new_doc.insert()
		new_doc.submit()
