use std::{
    fs, io,
    path::PathBuf,
    time::{self, SystemTime},
    vec,
};

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SavedAuth {
    pub token: String,
    pub last_touched: SystemTime,
    pub account: Account,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Account {
    pub id: String,
    pub username: String,
    pub avatar: Option<String>,
}

fn get_auth_path() -> PathBuf {
    super::get_app_files_path().join("auth.dgt")
}

fn read_auth_file() -> io::Result<String> {
    fs::read_to_string(get_auth_path())
}

fn write_auth_file(data: String) -> io::Result<()> {
    fs::write(get_auth_path(), data)
}

fn get_encryption_alphabet() -> String {
    String::from(
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789.()[]{}\"\'/\\:=!?-_",
    )
}

fn get_last_modified_unix_timestamp() -> std::io::Result<u64> {
    let metadata = fs::metadata(get_auth_path())?;
    let modified_time = metadata.modified()?;
    let duration_since_epoch = modified_time
        .duration_since(SystemTime::UNIX_EPOCH)
        .expect("[auth_saver::get_last_modified_unix_timestamp] Couldn't get time since 1970");
    Ok(duration_since_epoch.as_secs())
}

pub fn get_all_athorizations() -> Result<Vec<SavedAuth>, String> {
    let auth_path = get_auth_path();
    if !auth_path.exists() {
        return Ok(vec![]);
    }
    let last_modified_timestamp = match get_last_modified_unix_timestamp() {
        Ok(val) => val,
        Err(err) => return Err(format!("Couldn't get last_modified: {:?}", err)),
    };
    let last_modified_minutes = last_modified_timestamp / 60;
    let raw_data = match read_auth_file() {
        Ok(val) => val,
        Err(err) => return Err(format!("Couldn't read auth file: {:?}", err)),
    };
    let decrypted_data = match decrypt_data(raw_data, last_modified_minutes) {
        Ok(val) => val,
        Err(err) => return Err(format!("Couldn't decrypt data: {}", err)),
    };

    Ok(decrypted_data)
}

pub fn set_all_authorizations(data: Vec<SavedAuth>) -> Result<(), String> {
    let mut encrypted_data: String;

    loop {
        println!("[auth_saver::set_all_authorizations] DEBUG: Saving auth");
        let before_encryption = time::SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .expect("[auth_saver::set_all_authorizations] Couldn't get time since 1970")
            .as_secs()
            / 60;

        encrypted_data = encrypt_data(data.clone(), before_encryption)?;

        let after_encryption = time::SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .expect("[auth_saver::set_all_authorizations] Couldn't get time since 1970")
            .as_secs()
            / 60;

        if before_encryption == after_encryption {
            break;
        }
    }

    if let Err(err) = write_auth_file(encrypted_data) {
        eprintln!(
            "[auth_saver::set_all_authorizations] Couldn't save authorizations: {:?}",
            err
        )
    }

    Ok(())
}

pub fn encrypt_data(data: Vec<SavedAuth>, move_by: u64) -> Result<String, String> {
    let alphabet = get_encryption_alphabet();
    let alphabet_vec: Vec<char> = alphabet.chars().collect();
    let stringified_data = serde_json::to_string(&data).map_err(|e| e.to_string())?;
    let mut output_data = String::new();
    let mut additional_offset: usize = 0;

    for character in stringified_data.chars() {
        if let Some(index) = alphabet_vec.iter().position(|&c| c == character) {
            let new_index = ((index + move_by as usize) + additional_offset) % alphabet_vec.len();
            output_data.push(alphabet_vec[new_index]);
        } else {
            output_data.push(character);
        }
        additional_offset += 1;
    }
    Ok(output_data)
}

pub fn decrypt_data(data: String, move_by: u64) -> Result<Vec<SavedAuth>, String> {
    let alphabet = get_encryption_alphabet();
    let alphabet_vec: Vec<char> = alphabet.chars().collect();
    let mut decrypted_data = String::new();
    let mut additional_offset: usize = 0;

    for character in data.chars() {
        if let Some(index) = alphabet_vec.iter().position(|&c| c == character) {
            let new_index = ((index as i32 - move_by as i32 - additional_offset as i32)
                .rem_euclid(alphabet_vec.len() as i32)) as usize;
            decrypted_data.push(alphabet_vec[new_index]);
        } else {
            decrypted_data.push(character);
        }
        additional_offset += 1;
    }

    serde_json::from_str(&decrypted_data).map_err(|e| e.to_string())
}
