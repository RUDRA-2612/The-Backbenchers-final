# Research analytics taxonomy

Firebase Analytics receives only pseudonymous backend UUIDs through `user_id`. Never add email, name, Microsoft IDs, authentication values, raw search text, document titles, uploaded filenames, report/feedback text, or error messages.

| Area | Events |
| --- | --- |
| Sessions | `research_session_start`, `research_session_end`, `active_heartbeat`, `user_idle`, `tab_visibility_change` |
| Navigation | `virtual_page_view`, `navigation`, `sidebar_toggle`, `theme_change`, `ui_interaction` |
| Learning | `subject_open`, `material_open`, `material_close`, `scroll_progress`, `content_filter`, `search` |
| Library | `material_save`, `material_unsave`, `download_start`, `download_complete`, `download_failed` |
| Reliability/admin | `api_error`, `app_error`, `blocked_action`, `admin_action` |

Common parameters: `research_session_id`, `route_name`, `device_class`, `user_role`, viewport dimensions; material events add `material_id`, `subject_code`, `material_category`, and `material_type`. Register desired parameters as GA4 custom dimensions and link GA4 to BigQuery for event-level research queries.

Use `?analytics_debug=1` during development and Firebase DebugView to validate events. `debug_mode` is automatically set during Vite development. GA4 has event/parameter naming and custom-dimension limits; keep additions documented and register only the dimensions needed for reporting.
