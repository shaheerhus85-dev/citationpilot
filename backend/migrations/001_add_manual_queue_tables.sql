BEGIN TRANSACTION;

UPDATE directory_submissions
SET status = 'manual_required'
WHERE status = 'MANUAL_REQUIRED';

CREATE TABLE IF NOT EXISTS manual_submission_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    directory_submission_id INTEGER NOT NULL UNIQUE,
    status VARCHAR NOT NULL DEFAULT 'pending',
    priority INTEGER NOT NULL DEFAULT 100,
    assigned_to_user_id INTEGER NULL,
    operator_notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    FOREIGN KEY(directory_submission_id) REFERENCES directory_submissions(id),
    FOREIGN KEY(assigned_to_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS temp_email_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    directory_submission_id INTEGER NOT NULL UNIQUE,
    provider VARCHAR NOT NULL DEFAULT 'mail_tm',
    email_address VARCHAR NOT NULL UNIQUE,
    access_token TEXT NULL,
    mailbox_password VARCHAR NULL,
    status VARCHAR NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NULL,
    FOREIGN KEY(directory_submission_id) REFERENCES directory_submissions(id)
);

CREATE TABLE IF NOT EXISTS submission_attempt_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    directory_submission_id INTEGER NOT NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    phase VARCHAR NOT NULL,
    outcome VARCHAR NOT NULL,
    error_message TEXT NULL,
    http_status INTEGER NULL,
    screenshot_path VARCHAR NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(directory_submission_id) REFERENCES directory_submissions(id)
);

CREATE INDEX IF NOT EXISTS ix_submission_requests_user_created
ON submission_requests(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_submission_requests_status_updated
ON submission_requests(status, updated_at DESC);

CREATE INDEX IF NOT EXISTS ix_directory_submissions_request_status
ON directory_submissions(submission_request_id, status);

CREATE INDEX IF NOT EXISTS ix_directory_submissions_directory_status
ON directory_submissions(directory_id, status);

CREATE INDEX IF NOT EXISTS ix_directory_submissions_profile_status
ON directory_submissions(business_profile_id, status);

CREATE INDEX IF NOT EXISTS ix_directory_submissions_submitted_at
ON directory_submissions(submitted_at DESC);

CREATE INDEX IF NOT EXISTS ix_directories_tier_active
ON directories(tier, is_active);

CREATE INDEX IF NOT EXISTS ix_directories_validation_status
ON directories(last_validation_status);

CREATE INDEX IF NOT EXISTS ix_manual_submission_tasks_status_priority
ON manual_submission_tasks(status, priority, created_at);

CREATE INDEX IF NOT EXISTS ix_manual_submission_tasks_assigned_status
ON manual_submission_tasks(assigned_to_user_id, status);

CREATE INDEX IF NOT EXISTS ix_temp_email_accounts_status_created
ON temp_email_accounts(status, created_at);

CREATE INDEX IF NOT EXISTS ix_submission_attempt_logs_submission_created
ON submission_attempt_logs(directory_submission_id, created_at DESC);

INSERT OR IGNORE INTO manual_submission_tasks (
    directory_submission_id,
    status,
    priority,
    created_at,
    updated_at
)
SELECT
    ds.id,
    'pending',
    100,
    COALESCE(ds.timestamp, CURRENT_TIMESTAMP),
    CURRENT_TIMESTAMP
FROM directory_submissions ds
WHERE ds.status = 'manual_required';

COMMIT;
