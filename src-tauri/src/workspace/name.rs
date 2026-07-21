use super::error::{WorkspaceCommandError, WorkspaceErrorCode, WorkspaceResult};

pub const WORKSPACE_NAME_MAX_LENGTH: usize = 80;

const RESERVED_NAMES: &[&str] = &["CON", "PRN", "AUX", "NUL"];

pub fn normalize_workspace_name(value: &str) -> String {
    value.split_whitespace().collect::<Vec<_>>().join(" ")
}

pub fn validate_workspace_name(value: &str) -> WorkspaceResult<String> {
    let normalized = normalize_workspace_name(value);

    if normalized.is_empty()
        || normalized == "."
        || normalized == ".."
        || normalized.chars().all(|character| character == '.')
        || normalized.chars().count() > WORKSPACE_NAME_MAX_LENGTH
        || normalized.ends_with('.')
        || normalized.chars().any(|character| {
            matches!(
                character,
                '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*'
            )
        })
    {
        return Err(WorkspaceCommandError::new(WorkspaceErrorCode::InvalidName));
    }

    let device_name = normalized
        .split('.')
        .next()
        .unwrap_or_default()
        .to_uppercase();
    let numbered_device = device_name
        .strip_prefix("COM")
        .or_else(|| device_name.strip_prefix("LPT"))
        .is_some_and(|suffix| matches!(suffix.parse::<u8>(), Ok(1..=9)));

    if RESERVED_NAMES.contains(&device_name.as_str()) || numbered_device {
        return Err(WorkspaceCommandError::new(WorkspaceErrorCode::InvalidName));
    }

    Ok(normalized)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalizes_and_accepts_portable_workspace_names() {
        assert_eq!(
            validate_workspace_name("  Mi   espacio Neo  ").unwrap(),
            "Mi espacio Neo"
        );
        assert_eq!(validate_workspace_name("COM10").unwrap(), "COM10");
    }

    #[test]
    fn rejects_invalid_windows_workspace_names() {
        for name in [
            "",
            " ",
            ".",
            "..",
            "...",
            "../Neo",
            "Neo\\Casa",
            "Neo<",
            "Neo.",
            "CON",
            "con.txt",
            "PRN",
            "AUX",
            "NUL",
            "COM1",
            "COM9.log",
            "LPT1",
            "LPT9",
        ] {
            assert_eq!(
                validate_workspace_name(name).unwrap_err().code,
                WorkspaceErrorCode::InvalidName,
                "expected {name:?} to be rejected"
            );
        }

        assert_eq!(
            validate_workspace_name(&"N".repeat(WORKSPACE_NAME_MAX_LENGTH + 1))
                .unwrap_err()
                .code,
            WorkspaceErrorCode::InvalidName
        );
    }
}
