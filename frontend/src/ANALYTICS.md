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

## High-volume interaction trail

The delegated browser observers emit `ui_interaction` for every click, control change, and form submission across the portal. Thus a research session can generate thousands of distinct **event records** when users perform thousands of actions, while retaining a small, queryable event taxonomy. The event records identify the control, element type, interaction phase, route, session, device, and pseudonymous user ID—but never input values or visible text that can contain personal data.

The deployed taxonomy contains exactly 500 Firebase event types: 27 semantic events and 473 deterministic `research_interaction_001` through `research_interaction_473` slots. Each UI action maps stably to one slot from its control, route, and phase, and includes `event_family=ui_interaction` plus the action metadata. This preserves a 500-type Firebase-compatible schema while allowing unlimited interaction records.
