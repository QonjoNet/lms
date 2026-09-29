from frappe.www.login import get_context as _get_context

def get_context(context):
    _get_context(context)
    return context
