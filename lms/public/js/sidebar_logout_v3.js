/**
 * Adds a "Log out" button to the bottom of the Desk sidebar.
 * Uses a robust polling mechanism to ensure the button is always
 * at the absolute bottom, even when Frappe dynamically renders items.
 */
$(document).ready(function () {
	const logoutHTML = `
		<div class="sidebar-item-container" id="sidebar-logout-container" style="margin-top: 15px; border-top: 1px solid var(--border-color); padding-top: 15px;">
			<div class="desk-sidebar-item standard-sidebar-item">
				<a id="sidebar-logout-btn" href="#" onclick="frappe.app.logout(); return false;" class="item-anchor" title="Log out">
					<span class="sidebar-item-icon">
						<svg class="es-icon icon-sm" style="width: 14px; height: 14px; margin-left: 2px;"><use href="#icon-arrow-right"></use></svg>
					</span>
					<span class="sidebar-item-label">Log out</span>
				</a>
			</div>
		</div>
	`;

	setInterval(() => {
		const sidebar = $(".desk-sidebar");
		if (!sidebar.length) return;

		const btnContainer = $("#sidebar-logout-container");
		
		if (!btnContainer.length) {
			// Button doesn't exist, append it
			sidebar.append(logoutHTML);
		} else {
			// Button exists, ensure it is the LAST element
			if (sidebar.children().last().attr('id') !== 'sidebar-logout-container') {
				sidebar.append(btnContainer);
			}
		}
	}, 500); // Check every 500ms
});
