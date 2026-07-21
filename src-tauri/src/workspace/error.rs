use serde::Serialize;
use std::fmt;

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkspaceErrorCode {
    AccessDenied,
    DestinationConflict,
    InvalidName,
    InvalidPath,
    MalformedManifest,
    NotWorkspace,
    SelectionExpired,
    SettingsUnavailable,
    UnsupportedSchema,
    WriteFailed,
    Unexpected,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
pub struct WorkspaceCommandError {
    pub code: WorkspaceErrorCode,
}

impl WorkspaceCommandError {
    pub const fn new(code: WorkspaceErrorCode) -> Self {
        Self { code }
    }
}

impl fmt::Display for WorkspaceCommandError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(formatter, "workspace command failed: {:?}", self.code)
    }
}

impl std::error::Error for WorkspaceCommandError {}

pub type WorkspaceResult<T> = Result<T, WorkspaceCommandError>;

pub fn map_io_error(error: &std::io::Error, fallback: WorkspaceErrorCode) -> WorkspaceCommandError {
    let code = match error.kind() {
        std::io::ErrorKind::PermissionDenied => WorkspaceErrorCode::AccessDenied,
        std::io::ErrorKind::AlreadyExists => WorkspaceErrorCode::DestinationConflict,
        _ => fallback,
    };

    WorkspaceCommandError::new(code)
}
