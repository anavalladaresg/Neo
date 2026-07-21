use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use time::{format_description::well_known::Rfc3339, OffsetDateTime};
use uuid::Uuid;

use super::{
    error::{WorkspaceCommandError, WorkspaceErrorCode, WorkspaceResult},
    name::validate_workspace_name,
};

pub const WORKSPACE_SCHEMA_VERSION: u32 = 1;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceManifest {
    pub schema_version: u32,
    pub workspace_id: Uuid,
    pub name: String,
    pub created_at: String,
    pub updated_at: String,
    #[serde(flatten)]
    pub additional_fields: BTreeMap<String, Value>,
}

impl WorkspaceManifest {
    pub fn new(name: &str) -> WorkspaceResult<Self> {
        let normalized_name = validate_workspace_name(name)?;
        let timestamp = OffsetDateTime::now_utc()
            .format(&Rfc3339)
            .map_err(|_| WorkspaceCommandError::new(WorkspaceErrorCode::Unexpected))?;

        Ok(Self {
            schema_version: WORKSPACE_SCHEMA_VERSION,
            workspace_id: Uuid::now_v7(),
            name: normalized_name,
            created_at: timestamp.clone(),
            updated_at: timestamp,
            additional_fields: BTreeMap::new(),
        })
    }

    fn validate(&self) -> WorkspaceResult<()> {
        if self.schema_version != WORKSPACE_SCHEMA_VERSION {
            return Err(WorkspaceCommandError::new(
                WorkspaceErrorCode::UnsupportedSchema,
            ));
        }

        validate_workspace_name(&self.name)?;
        OffsetDateTime::parse(&self.created_at, &Rfc3339)
            .and_then(|_| OffsetDateTime::parse(&self.updated_at, &Rfc3339))
            .map_err(|_| WorkspaceCommandError::new(WorkspaceErrorCode::MalformedManifest))?;

        Ok(())
    }
}

pub fn parse_workspace_manifest(contents: &str) -> WorkspaceResult<WorkspaceManifest> {
    let value: Value = serde_json::from_str(contents)
        .map_err(|_| WorkspaceCommandError::new(WorkspaceErrorCode::MalformedManifest))?;
    let schema_version = value
        .get("schemaVersion")
        .and_then(Value::as_u64)
        .ok_or_else(|| WorkspaceCommandError::new(WorkspaceErrorCode::MalformedManifest))?;

    if schema_version != u64::from(WORKSPACE_SCHEMA_VERSION) {
        return Err(WorkspaceCommandError::new(
            WorkspaceErrorCode::UnsupportedSchema,
        ));
    }

    let manifest: WorkspaceManifest = serde_json::from_value(value)
        .map_err(|_| WorkspaceCommandError::new(WorkspaceErrorCode::MalformedManifest))?;
    manifest.validate()?;
    Ok(manifest)
}

pub fn serialize_workspace_manifest(manifest: &WorkspaceManifest) -> WorkspaceResult<Vec<u8>> {
    manifest.validate()?;
    let mut bytes = serde_json::to_vec_pretty(manifest)
        .map_err(|_| WorkspaceCommandError::new(WorkspaceErrorCode::WriteFailed))?;
    bytes.push(b'\n');
    Ok(bytes)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn valid_manifest_json() -> String {
        r#"{
          "schemaVersion": 1,
          "workspaceId": "01900000-0000-7000-8000-000000000000",
          "name": "Neo",
          "createdAt": "2026-07-21T20:00:00.000Z",
          "updatedAt": "2026-07-21T20:00:00.000Z",
          "futureField": "preserved"
        }"#
        .to_owned()
    }

    #[test]
    fn parses_and_serializes_a_valid_manifest_with_unknown_fields() {
        let manifest = parse_workspace_manifest(&valid_manifest_json()).unwrap();
        assert_eq!(manifest.name, "Neo");
        assert_eq!(
            manifest.additional_fields.get("futureField"),
            Some(&Value::String("preserved".to_owned()))
        );

        let serialized = serialize_workspace_manifest(&manifest).unwrap();
        assert!(serialized.ends_with(b"\n"));
        let reparsed = parse_workspace_manifest(std::str::from_utf8(&serialized).unwrap()).unwrap();
        assert_eq!(manifest, reparsed);
    }

    #[test]
    fn creates_a_versioned_manifest_with_uuid_and_utc_timestamps() {
        let manifest = WorkspaceManifest::new(" Neo ").unwrap();
        assert_eq!(manifest.schema_version, WORKSPACE_SCHEMA_VERSION);
        assert_eq!(manifest.name, "Neo");
        assert_eq!(manifest.workspace_id.get_version_num(), 7);
        assert!(OffsetDateTime::parse(&manifest.created_at, &Rfc3339).is_ok());
        assert_eq!(manifest.created_at, manifest.updated_at);
    }

    #[test]
    fn rejects_malformed_and_unsupported_manifests() {
        for contents in ["not json", "{}", r#"{"schemaVersion":"one"}"#] {
            assert_eq!(
                parse_workspace_manifest(contents).unwrap_err().code,
                WorkspaceErrorCode::MalformedManifest
            );
        }

        let unsupported =
            valid_manifest_json().replace("\"schemaVersion\": 1", "\"schemaVersion\": 2");
        assert_eq!(
            parse_workspace_manifest(&unsupported).unwrap_err().code,
            WorkspaceErrorCode::UnsupportedSchema
        );

        let invalid_timestamp =
            valid_manifest_json().replace("2026-07-21T20:00:00.000Z", "not-a-date");
        assert_eq!(
            parse_workspace_manifest(&invalid_timestamp)
                .unwrap_err()
                .code,
            WorkspaceErrorCode::MalformedManifest
        );
    }
}
