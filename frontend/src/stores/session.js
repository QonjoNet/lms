import { defineStore } from 'pinia'
import { createResource } from 'frappe-ui'
import { usersStore } from './user'
import { computed, reactive, ref } from 'vue'

export const sessionStore = defineStore('lms-session', () => {
	let { userResource } = usersStore()
	const brand = reactive({})

	function getCookie(name) {
		const value = `; ${document.cookie}`
		const parts = value.split(`; ${name}=`)
		if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift().trim())
		const parts2 = value.split(`;${name}=`)
		if (parts2.length === 2) return decodeURIComponent(parts2.pop().split(';').shift().trim())
		return null
	}

	function sessionUser() {
		let _sessionUser = getCookie('user_id')
		if (_sessionUser === 'Guest' || !_sessionUser) {
			_sessionUser = null
		} else {
			userResource.reload()
		}
		return _sessionUser
	}

	let user = ref(sessionUser())
	const isLoggedIn = computed(() => !!user.value)

	const logout = createResource({
		url: 'logout',
		onSuccess() {
			userResource.reset()
			user.value = null
			window.location.reload()
		},
	})

	const branding = createResource({
		url: 'lms.lms.api.get_branding',
		cache: 'brand',
		auto: true,
		onSuccess(data) {
			brand.name = data.app_name
			brand.logo = data.app_logo
			brand.favicon =
				data.favicon?.file_url || '/assets/lms/frontend/learning.svg'
		},
	})

	return {
		user,
		isLoggedIn,
		logout,
		brand,
		branding,
	}
})
