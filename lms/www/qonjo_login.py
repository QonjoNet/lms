from frappe.www.login import get_context as _get_context

no_cache = True

def get_context(context):
    _get_context(context)
    return context
