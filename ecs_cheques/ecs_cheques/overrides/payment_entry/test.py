from __future__ import unicode_literals
import frappe, json
from frappe.model.document import Document
from frappe import _
from frappe.desk.search import sanitize_searchfield

def test(doc, method=None):
    frappe.msgprint(_("Hello"))