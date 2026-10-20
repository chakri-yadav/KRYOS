# Incremental render composition

Settings is the first explicit page composition owner. Its app entry calls the
presentation pipeline when available, otherwise the base renderer. The shared
runtime sequences capture, model read, base, owned sections and finally restore.
Errors propagate; restoration does not retry domain writes. No listeners or timers
are registered per render. Existing delegated events keep their original owners.

Transient editing state is scoped to the active mode/account. Restoration cannot
move a draft into another account. File controls and domain records are excluded.
Status-only refresh remains section-scoped. Repeated renders must preserve focus,
text selection, disclosure state and reading position without duplicate panels.

Migrate other pages separately after their interaction regressions are covered.
Do not remove evidence polling until bootstrap, dirty/save, conflict, reconnect
and other-window transitions reliably notify all consumers.
