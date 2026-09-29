from frappe.www.login import get_context as _get_context
import frappe
from frappe.utils.oauth import get_oauth2_authorize_url

no_cache = True

def get_context(context):
    _get_context(context)
        
    # Force all social logins to go straight to the LMS dashboard
    for provider in context.get("provider_logins", []):
        provider["auth_url"] = get_oauth2_authorize_url(provider["name"], "/lms")
        
    return context
