from frappe.www.login import get_context as _get_context
import frappe
from frappe.utils.oauth import get_oauth2_authorize_url

no_cache = True

def get_context(context):
    _get_context(context)
    
    # If the user is already logged in (e.g. returning from Google OAuth)
    # and they land here, we can show them the choice modal or redirect them
    if frappe.session.user != "Guest":
        context.is_logged_in = True
        context.is_system_manager = "System Manager" in frappe.get_roles(frappe.session.user)
    else:
        context.is_logged_in = False
        
    # Force all social logins to return to the 'login' page so we can handle routing via JS/Jinja
    # We pass ?redirect-to=login so Frappe's core logic doesn't aggressively redirect admins to /app before our JS runs
    for provider in context.get("provider_logins", []):
        provider["auth_url"] = get_oauth2_authorize_url(provider["name"], "/login?redirect-to=login")
        
    return context
